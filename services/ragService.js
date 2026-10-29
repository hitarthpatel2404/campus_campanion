/**
 * RAG (Retrieval-Augmented Generation) Service
 * Combines MongoDB context retrieval with AI generation (Google Gemini + Local Intelligent Fallback)
 * Includes robust offline fallback so the app works seamlessly even without a running MongoDB service.
 */

const mongoose = require('mongoose');
const Document = require('../models/Document');
const QueryLog = require('../models/QueryLog');
const { findRelevantChunks, generateLocalEmbedding } = require('./embeddingService');
const { dummyDocuments } = require('../seed');

// Disable Mongoose command buffering so queries don't hang when DB is disconnected
mongoose.set('bufferCommands', false);

// In-memory query log cache for offline demo / fallback mode
const inMemoryQueryLogs = [
    {
        question: "What is the penalty if I submit my CS101 assignment late?",
        answer: "Late submissions are penalized at 10% per 24-hour period for up to 48 hours.",
        course: "CS101",
        resolved: true,
        responseTimeMs: 95,
        createdAt: new Date(Date.now() - 3600000)
    },
    {
        question: "What are the library hours on weekends?",
        answer: "On weekends, Main Library is open 9:00 AM to 9:00 PM.",
        course: "Campus IT",
        resolved: true,
        responseTimeMs: 80,
        createdAt: new Date(Date.now() - 7200000)
    }
];

// Ensure dummy documents have local embeddings initialized
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

// Pre-initialize embeddings on dummy documents
ensureEmbeddings(dummyDocuments);

// Optional Google Generative AI
let GoogleGenerativeAI = null;
try {
    const genAiModule = require('@google/generative-ai');
    GoogleGenerativeAI = genAiModule.GoogleGenerativeAI;
} catch (e) {
    // Generative AI module will be loaded when dependencies are installed
}

/**
 * Intelligent Local Generator:
 * Generates clear, citation-grounded answers directly from retrieved chunks
 * when no external cloud LLM API key is configured.
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
 * Executes the full RAG pipeline:
 * 1. RETRIEVAL: Searches MongoDB (or in-memory verified docs if offline)
 * 2. AUGMENTATION: Formats retrieved text as verified context
 * 3. GENERATION: Passes context to Gemini LLM or Local Grounded Generator
 * 4. LOGGING: Records query in MongoDB or in-memory store
 */
async function processRagQuery(question) {
    const startTime = Date.now();
    let activeDocs = [];

    // 1. Check if MongoDB is connected and query active documents
    if (mongoose.connection.readyState === 1) {
        try {
            activeDocs = await Document.find({ isActive: true });
        } catch (dbErr) {
            console.warn('MongoDB query failed, using in-memory documents:', dbErr.message);
            activeDocs = dummyDocuments;
        }
    } else {
        activeDocs = dummyDocuments;
    }

    if (!activeDocs || activeDocs.length === 0) {
        activeDocs = dummyDocuments;
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
            console.warn('Gemini API call failed, falling back to local grounded generator:', apiErr.message);
            answer = generateLocalAnswer(question, relevantChunks);
        }
    } else {
        // Fallback to local deterministic generator
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

    // 4. Log to MongoDB if online, or in-memory array if offline
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
            inMemoryQueryLogs.push(logItem);
        }
    } else {
        inMemoryQueryLogs.push(logItem);
    }

    return {
        answer,
        sources: formattedSources,
        contextUsed: hasSufficientContext,
        responseTimeMs
    };
}

module.exports = {
    processRagQuery,
    inMemoryQueryLogs
};
