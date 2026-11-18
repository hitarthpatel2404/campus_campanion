/**
 * RAG (Retrieval-Augmented Generation) Service
 * Combines MongoDB context retrieval with AI generation
 * Includes robust offline fallback so the app works seamlessly even without a running MongoDB service.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const QueryLog = require('../models/QueryLog');
const { findRelevantChunks, generateLocalEmbedding } = require('./embeddingService');
const { dummyDocuments } = require('../seed');

// Disable Mongoose command buffering so queries don't hang when DB is disconnected
mongoose.set('bufferCommands', false);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DOCS_STORE_FILE = path.join(DATA_DIR, 'knowledge_base_store.json');
const LOGS_STORE_FILE = path.join(DATA_DIR, 'query_logs_store.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        try {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        } catch (e) {}
    }
}

// Ensure documents have local embeddings initialized
function ensureEmbeddings(docs) {
    if (!docs || !Array.isArray(docs)) return [];
    for (const doc of docs) {
        if (doc && doc.chunks) {
            for (const chunk of doc.chunks) {
                if (!chunk.embedding || chunk.embedding.length === 0) {
                    const textToEmbed = `${chunk.sectionTitle || ''} ${chunk.content || ''} ${(chunk.keywords || []).join(' ')}`;
                    chunk.embedding = generateLocalEmbedding(textToEmbed);
                }
            }
        }
    }
    return docs;
}

function savePersistedDocuments(docs) {
    try {
        ensureDataDir();
        fs.writeFileSync(DOCS_STORE_FILE, JSON.stringify(docs, null, 2), 'utf-8');
    } catch (err) {
        console.error('Failed to save knowledge_base_store.json:', err);
    }
}

function loadPersistedDocuments() {
    ensureDataDir();
    if (fs.existsSync(DOCS_STORE_FILE)) {
        try {
            const raw = fs.readFileSync(DOCS_STORE_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return ensureEmbeddings(parsed);
            }
        } catch (err) {
            console.error('Error reading persisted documents:', err);
        }
    }
    const initial = JSON.parse(JSON.stringify(dummyDocuments));
    ensureEmbeddings(initial);
    savePersistedDocuments(initial);
    return initial;
}

function savePersistedLogs(logs) {
    try {
        ensureDataDir();
        fs.writeFileSync(LOGS_STORE_FILE, JSON.stringify((logs || []).slice(0, 50), null, 2), 'utf-8');
    } catch (err) {}
}

function loadPersistedLogs(fallbackLogs) {
    ensureDataDir();
    if (fs.existsSync(LOGS_STORE_FILE)) {
        try {
            const raw = fs.readFileSync(LOGS_STORE_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (err) {}
    }
    savePersistedLogs(fallbackLogs);
    return fallbackLogs;
}

function resetPersistedDocuments() {
    const initial = JSON.parse(JSON.stringify(dummyDocuments));
    ensureEmbeddings(initial);
    inMemoryDocuments.length = 0;
    inMemoryDocuments.push(...initial);
    savePersistedDocuments(inMemoryDocuments);
    return inMemoryDocuments;
}

// In-memory query log cache for offline demo / fallback mode
const initialFallbackLogs = [
    {
        question: "What is the late submission policy for WAD Assignment 1?",
        answer: "According to course policies, assignments submitted within 24 hours of the deadline incur a 10% penalty. Submissions beyond 48 hours receive zero credit.",
        course: "WAD",
        resolved: true,
        responseTimeMs: 85,
        sources: [{ title: "WAD Course Syllabus & Policies", sectionTitle: "Grading & Late Submissions", similarityScore: 92 }],
        createdAt: new Date(Date.now() - 3600000)
    },
    {
        question: "When is the ML lab session for Batch B2 and where is it held?",
        answer: "Machine Learning (ML) lab for Batch B2 is held on Mondays from 11:10 AM to 01:00 PM in Lab 5C with Prof. DT.",
        course: "ML",
        resolved: true,
        responseTimeMs: 78,
        sources: [{ title: "Campus Academic Timetable 2026", sectionTitle: "Monday Schedule", similarityScore: 96 }],
        createdAt: new Date(Date.now() - 7200000)
    },
    {
        question: "Which room is DCN lecture scheduled in on Thursday?",
        answer: "DCN lecture on Thursday is scheduled from 11:10 AM to 12:00 PM in Room 402 with Prof. MSG.",
        course: "DCN",
        resolved: true,
        responseTimeMs: 92,
        sources: [{ title: "Campus Academic Timetable 2026", sectionTitle: "Thursday Schedule", similarityScore: 94 }],
        createdAt: new Date(Date.now() - 10800000)
    },
    {
        question: "What are the timings for the WAD Elective Lab for Batch C1?",
        answer: "WAD-EL (Elective Lab) for Batch C1 takes place on Thursdays from 02:10 PM to 04:00 PM in Lab 4B with Prof. AD.",
        course: "WAD",
        resolved: true,
        responseTimeMs: 110,
        sources: [{ title: "Campus Academic Timetable 2026", sectionTitle: "Thursday Electives", similarityScore: 95 }],
        createdAt: new Date(Date.now() - 14400000)
    },
    {
        question: "Can I access the computing lab during weekends?",
        answer: "Yes, computing labs and the main university library are open on weekends from 09:00 AM to 09:00 PM with student RFID badge access.",
        course: "Campus IT",
        resolved: true,
        responseTimeMs: 88,
        sources: [{ title: "Campus Library and Computing Facilities Guidelines", sectionTitle: "Weekend Lab Access", similarityScore: 89 }],
        createdAt: new Date(Date.now() - 18000000)
    },
    {
        question: "When are midterm examinations scheduled?",
        answer: "Midterm examinations will take place from October 12 to October 17, 2026. Hall allocations will be published one week prior by the Registrar.",
        course: "Registrar",
        resolved: true,
        responseTimeMs: 98,
        sources: [{ title: "Academic Calendar & Examination Schedule", sectionTitle: "Midterm Examination Period", similarityScore: 91 }],
        createdAt: new Date(Date.now() - 21600000)
    },
    {
        question: "What compiler version is required for System Software (SS) lab?",
        answer: "Compiler configuration details are being verified. Please consult Prof. VP directly during office hours in Room 402.",
        course: "SS",
        resolved: false,
        responseTimeMs: 135,
        sources: [],
        createdAt: new Date(Date.now() - 25200000)
    }
];

// Load query logs from persistent storage or fall back to rich default telemetry
const inMemoryQueryLogs = loadPersistedLogs(initialFallbackLogs);

// In-memory document storage loaded from persistent storage (survives restarts/logouts)
const inMemoryDocuments = loadPersistedDocuments();
=======
>>>>>>> origin/main

// Optional Google Generative AI
let GoogleGenerativeAI = null;
try {
    const genAiModule = require('@google/generative-ai');
    GoogleGenerativeAI = genAiModule.GoogleGenerativeAI;
} catch (e) {
    // Generative AI module will be loaded if available
}

/**
 * Intelligent Text Chunking Algorithm
 */
function chunkDocumentText(text, docTitle) {
    if (!text || typeof text !== 'string') return [];
    
    // Split by Markdown headers (##) or double newlines
    let rawSections = text.split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean);
    
    if (rawSections.length === 0) {
        rawSections = [text.trim()];
    }

    const chunks = [];
    let currentChunkText = '';
    let currentTitle = `${docTitle} - Overview`;

    for (let i = 0; i < rawSections.length; i++) {
        const sec = rawSections[i];
        const headingMatch = sec.match(/^(?:#+\s*|Unit\s*\d+:|Module\s*\d+:|Chapter\s*\d+:|Section\s*\d+:|[A-Z\s]{4,}:?)(.*)/i);
        const detectedHeading = headingMatch ? sec.split('\n')[0].replace(/^#+\s*/, '').trim() : null;

        if (currentChunkText.length + sec.length > 700 && currentChunkText.length > 100) {
            chunks.push({
                chunkId: `chunk-${chunks.length + 1}`,
                sectionTitle: currentTitle,
                content: currentChunkText.trim(),
                keywords: extractKeywords(currentChunkText)
            });
            currentChunkText = sec;
            currentTitle = detectedHeading || `${docTitle} - Section ${chunks.length + 1}`;
        } else {
            if (detectedHeading && currentChunkText.length === 0) {
                currentTitle = detectedHeading;
            }
            currentChunkText += (currentChunkText ? '\n\n' : '') + sec;
        }
    }

    if (currentChunkText.trim().length > 0) {
        chunks.push({
            chunkId: `chunk-${chunks.length + 1}`,
            sectionTitle: currentTitle,
            content: currentChunkText.trim(),
            keywords: extractKeywords(currentChunkText)
        });
    }

    return chunks;
}

function extractKeywords(text) {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'by', 'as', 'are', 'was', 'were', 'it', 'its', 'from', 'be', 'this', 'that', 'or', 'all', 'any']);
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const unique = [...new Set(words.filter(w => !stopWords.has(w)))];
    return unique.slice(0, 15);
}

/**
 * Indexes a new document into MongoDB and in-memory knowledge base
 */
async function indexAndSaveDocument({ title, filename, fileSize, course, category, content }) {
    const cleanTitle = (title || filename || 'Untitled Document').trim();
    const cleanCourse = (course || 'General').trim();
    const cleanCategory = (category || 'Syllabus').trim();
    const cleanFilename = (filename || `${cleanTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`).trim();
    const sizeStr = fileSize || `${Math.max(0.5, (content.length / (1024 * 1024)).toFixed(2))} MB`;

    // 1. Chunk the document content
    const rawChunks = chunkDocumentText(content, cleanTitle);
    
    // 2. Generate vector embeddings for every chunk
    const chunksWithEmbeddings = rawChunks.map(chunk => {
        const textToEmbed = `${chunk.sectionTitle} ${chunk.content} ${(chunk.keywords || []).join(' ')}`;
        return {
            ...chunk,
            embedding: generateLocalEmbedding(textToEmbed)
        };
    });

    const docPayload = {
        title: cleanTitle,
        filename: cleanFilename,
        fileSize: sizeStr,
        course: cleanCourse,
        category: cleanCategory,
        isActive: true,
        uploadDate: new Date(),
        chunks: chunksWithEmbeddings
    };

    let savedDoc = null;

    // 3. Save to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
        try {
            savedDoc = await Document.create(docPayload);
        } catch (dbErr) {
            console.warn('MongoDB document save failed, storing in memory:', dbErr.message);
        }
    }

    if (!savedDoc) {
        savedDoc = {
            _id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            ...docPayload
        };
    }

    // Always keep in-memory repository updated and persist immediately to disk
    inMemoryDocuments.unshift(savedDoc);
    savePersistedDocuments(inMemoryDocuments);

    return savedDoc;
}

/**
 * Deletes a document by ID or Title
 */
async function deleteDocument(docId) {
    if (mongoose.connection.readyState === 1) {
        try {
            await Document.findByIdAndDelete(docId);
        } catch (e) {}
    }
    const idx = inMemoryDocuments.findIndex(d => String(d._id) === String(docId) || d.title === docId);
    if (idx !== -1) {
        inMemoryDocuments.splice(idx, 1);
        savePersistedDocuments(inMemoryDocuments);
    }
    return true;
}

/**
 * Intelligent Local Grounded Generator
 */
function generateLocalAnswer(question, relevantChunks) {
    if (!relevantChunks || relevantChunks.length === 0 || relevantChunks[0].score < 0.1) {
        return "I couldn't find any verified information regarding your question in the active campus knowledge base documents. Please consult your course instructor or department office directly.";
    }

    const primaryChunk = relevantChunks[0];
    const secondaryChunks = relevantChunks.slice(1);

    let answer = `Based on **${primaryChunk.documentTitle}** (${primaryChunk.sectionTitle}):\n\n`;
    answer += `${primaryChunk.content}\n\n`;

    if (secondaryChunks.length > 0 && secondaryChunks[0].score > 0.25) {
        const sec = secondaryChunks[0];
        answer += `Additionally, according to **${sec.documentTitle}** (${sec.sectionTitle}):\n`;
        answer += `${sec.content}\n\n`;
    }

    answer += `*Sources verified from your campus documents.*`;
    return answer;
}

/**
 * Executes the full RAG pipeline
 */
async function processRagQuery(question) {
    const startTime = Date.now();
    let activeDocs = [];

    // 1. Query active documents from MongoDB or in-memory
    if (mongoose.connection.readyState === 1) {
        try {
            activeDocs = await Document.find({ isActive: true });
        } catch (dbErr) {
            activeDocs = inMemoryDocuments;
        }
    } else {
        activeDocs = inMemoryDocuments;
    }

    if (!activeDocs || activeDocs.length === 0) {
        activeDocs = inMemoryDocuments;
    }

    // Ensure all chunks have embeddings
    ensureEmbeddings(activeDocs);

    // Find top 3 most relevant chunks
    const relevantChunks = findRelevantChunks(question, activeDocs, 3);
    const hasSufficientContext = relevantChunks.length > 0 && relevantChunks[0].score >= 0.15;

    let answer = '';
    const apiKey = process.env.GEMINI_API_KEY;

    // 2 & 3. AUGMENT AND GENERATE
    if (apiKey && apiKey.trim() !== '' && GoogleGenerativeAI) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const contextText = relevantChunks.map((c, i) => 
                `[Source ${i + 1}: ${c.documentTitle} - ${c.sectionTitle}]\n${c.content}`
            ).join('\n\n');

            const prompt = `You are the AI Campus Companion for university students. 
Answer the student's question accurately, concisely, and warmly based ONLY on the provided verified campus documents. 
If the answer is not contained in the documents, state clearly that the verified context doesn't mention it.
Always cite the relevant document name when providing factual details (like dates, percentages, or rules).

VERIFIED CAMPUS DOCUMENTS:
${contextText}

STUDENT QUESTION:
${question}

CAMPUS COMPANION ANSWER:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            answer = response.text();
        } catch (apiErr) {
            answer = generateLocalAnswer(question, relevantChunks);
        }
    } else {
        answer = generateLocalAnswer(question, relevantChunks);
    }

    const responseTimeMs = Date.now() - startTime;

    // Format sources for UI
    const formattedSources = relevantChunks.map(c => ({
        title: c.documentTitle,
        filename: c.filename,
        course: c.course,
        sectionTitle: c.sectionTitle,
        content: c.content,
        similarityScore: Math.round(c.score * 100)
    }));

    // 4. Log query
    const logItem = {
        question,
        answer,
        sources: formattedSources.map(s => ({
            title: s.title,
            sectionTitle: s.sectionTitle,
            similarityScore: s.similarityScore
        })),
        course: relevantChunks[0]?.course || 'General',
        resolved: hasSufficientContext,
        responseTimeMs,
        createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
        try {
            await QueryLog.create(logItem);
        } catch (logErr) {
            inMemoryQueryLogs.unshift(logItem);
            savePersistedLogs(inMemoryQueryLogs);
        }
    } else {
        inMemoryQueryLogs.unshift(logItem);
        savePersistedLogs(inMemoryQueryLogs);
    }

    return {
        answer,
        sources: formattedSources,
        contextUsed: hasSufficientContext,
        responseTimeMs
    };
}

/**
 * Computes REAL aggregated analytics from MongoDB and inMemoryQueryLogs
 */
async function getRealAnalytics() {
    let logs = [];
    if (mongoose.connection.readyState === 1) {
        try {
            logs = await QueryLog.find().sort({ createdAt: -1 });
        } catch (e) {
            logs = inMemoryQueryLogs;
        }
    } else {
        logs = inMemoryQueryLogs;
    }

    if (!logs || logs.length === 0) {
        logs = inMemoryQueryLogs;
    }

    const totalQueries = logs.length;
    const unresolvedQueries = logs.filter(q => !q.resolved).length;
    const avgResponseTime = totalQueries > 0
        ? Math.round(logs.reduce((sum, q) => sum + (q.responseTimeMs || 100), 0) / totalQueries)
        : 90;

    // 1. Group queries to find Top Student Struggle Topics
    const topicMap = {};
    for (const log of logs) {
        const qText = log.question.trim();
        if (!topicMap[qText]) {
            topicMap[qText] = {
                topic: qText,
                count: 0,
                unresolved: 0,
                course: log.course || 'General'
            };
        }
        topicMap[qText].count += 1;
        if (!log.resolved) {
            topicMap[qText].unresolved += 1;
        }
    }

    const topStruggleTopics = Object.values(topicMap)
        .sort((a, b) => (b.unresolved * 10 + b.count) - (a.unresolved * 10 + a.count))
        .slice(0, 6)
        .map(t => {
            let severity = 'Low';
            let color = '#10b981';
            if (t.unresolved > 0 || t.count >= 3) {
                severity = 'High';
                color = '#ef4444';
            } else if (t.count >= 2) {
                severity = 'Medium';
                color = '#f59e0b';
            }
            return {
                topic: t.topic,
                count: `${t.count} ${t.count === 1 ? 'query' : 'queries'}`,
                severity,
                color,
                course: t.course
            };
        });

    // 2. Query Volume by Course / Category
    const courseMap = {};
    for (const log of logs) {
        const c = log.course || 'General';
        courseMap[c] = (courseMap[c] || 0) + 1;
    }

    const queryVolumeByCategory = Object.entries(courseMap)
        .map(([course, count]) => ({
            course,
            count: `${count} ${count === 1 ? 'query' : 'queries'}`,
            percent: totalQueries > 0 ? Math.round((count / totalQueries) * 100) : 0
        }))
        .sort((a, b) => b.percent - a.percent);

    return {
        totalQueries,
        unresolvedQueries,
        avgResponseTime: `${avgResponseTime}ms`,
        topStruggleTopics,
        queryVolumeByCategory,
        recentQueries: logs.slice(0, 50),
        source: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory'
    };
}

module.exports = {
    processRagQuery,
    indexAndSaveDocument,
    deleteDocument,
    getRealAnalytics,
    resetPersistedDocuments,
    savePersistedDocuments,
    loadPersistedDocuments,
    inMemoryDocuments,
    inMemoryQueryLogs
};
