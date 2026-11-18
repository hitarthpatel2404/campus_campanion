/**
 * Campus Companion - RAG Backend Server
 * Express Server with MongoDB Mongoose & RAG Pipeline
 * Built with full offline resiliency for in-memory RAG previews when MongoDB is offline
 */

require('dotenv').config();
const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const express = require('express');
const mongoose = require('mongoose');
// Disable Mongoose command buffering so queries don't hang for 10s when DB is offline
mongoose.set('bufferCommands', false);

const cors = require('cors');
const path = require('path');

const Document = require('./models/Document');
const QueryLog = require('./models/QueryLog');
const { 
    processRagQuery, 
    indexAndSaveDocument, 
    deleteDocument, 
    getRealAnalytics, 
    resetPersistedDocuments,
    inMemoryDocuments,
    inMemoryQueryLogs 
} = require('./services/ragService');
const { dummyDocuments } = require('./seed');
const { generateLocalEmbedding } = require('./services/embeddingService');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_companion';

// Middleware with 50mb limit for PDF base64 payloads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use(express.static(path.join(__dirname)));

// 1. Health & Status
app.get('/api/health', async (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    let docCount = dummyDocuments.length;
    if (isConnected) {
        try {
            docCount = await Document.countDocuments();
        } catch (e) {
            docCount = dummyDocuments.length;
        }
    }
    res.json({
        status: 'ok',
        mongodb: isConnected ? 'connected' : 'disconnected',
        database: isConnected ? (mongoose.connection.name || 'campus_companion') : 'in-memory-demo',
        documentsCount: docCount,
        mode: isConnected ? 'mongodb-live' : 'in-memory-preview',
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
    });
});

// 2. Get all Knowledge Base Documents (for Sidebar and Dashboard)
app.get('/api/documents', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const docs = await Document.find({ isActive: true }).select('-chunks.embedding').sort({ createdAt: -1 });
            if (docs && docs.length > 0) {
                return res.json({ success: true, count: docs.length, documents: docs, source: 'mongodb' });
            }
        }
        // Return in-memory documents
        res.json({
            success: true,
            count: inMemoryDocuments.length,
            documents: inMemoryDocuments.map(d => ({
                _id: d._id,
                title: d.title,
                filename: d.filename,
                fileSize: d.fileSize,
                course: d.course,
                category: d.category,
                isActive: true,
                chunks: (d.chunks || []).map(c => ({
                    chunkId: c.chunkId,
                    sectionTitle: c.sectionTitle,
                    content: c.content,
                    keywords: c.keywords
                }))
            })),
            source: 'in-memory'
        });
    } catch (err) {
        res.json({
            success: true,
            count: inMemoryDocuments.length,
            documents: inMemoryDocuments,
            source: 'in-memory-fallback'
        });
    }
});

// 2b. Upload and Index a New Document (Chunked + Vector Embeddings into MongoDB)
app.post('/api/documents/upload', async (req, res) => {
    try {
        const { title, filename, fileSize, course, category, content } = req.body;
        
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Document text content is required for indexing.' });
        }

        const savedDoc = await indexAndSaveDocument({
            title: title || filename,
            filename: filename || 'Uploaded_Document.pdf',
            fileSize: fileSize || '1.0 MB',
            course: course || 'General',
            category: category || 'Syllabus',
            content: content.trim()
        });

        res.json({
            success: true,
            message: `Document "${savedDoc.title}" indexed and embedded successfully into knowledge base! Ready for AI Chat.`,
            document: savedDoc,
            chunkCount: savedDoc.chunks.length,
            source: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory'
        });
    } catch (err) {
        console.error('Document indexing error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2c. Delete Document by ID
app.delete('/api/documents/:id', async (req, res) => {
    try {
        await deleteDocument(req.params.id);
        res.json({ success: true, message: 'Document deleted successfully from knowledge base.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2d. Document Plain-Text Extraction Endpoint (PDF, Markdown, TXT, JSON, CSV)
app.post('/api/documents/extract', async (req, res) => {
    try {
        const { base64Data, filename } = req.body;
        if (!base64Data) {
            return res.status(400).json({ success: false, error: 'No file data received.' });
        }

        const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
        const fileBuffer = Buffer.from(cleanBase64, 'base64');
        const isPdf = !filename || filename.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            const { PDFParse } = require('pdf-parse');
            const parser = new PDFParse({ data: fileBuffer });
            const result = await parser.getText();
            await parser.destroy().catch(() => {});

            let fullText = '';
            if (result.pages && Array.isArray(result.pages) && result.pages.length > 0) {
                fullText = result.pages
                    .map((p, idx) => {
                        const pageText = (p.text || '').trim();
                        if (!pageText) return '';
                        return `### Page ${p.num || idx + 1}\n${pageText}`;
                    })
                    .filter(Boolean)
                    .join('\n\n');
            }

            if (!fullText.trim() && result.text) {
                fullText = result.text.trim();
            }

            fullText = fullText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

            if (!fullText.trim()) {
                return res.json({
                    success: true,
                    text: '',
                    pageCount: result.total || 0,
                    warning: 'This PDF does not appear to contain selectable text (it may be scanned images). You can type or paste syllabus notes directly.'
                });
            }

            return res.json({
                success: true,
                text: fullText,
                pageCount: result.total || (result.pages ? result.pages.length : 1),
                characterCount: fullText.length
            });
        } else {
            // Text, markdown, JSON, CSV
            const text = fileBuffer.toString('utf-8');
            return res.json({
                success: true,
                text: text,
                characterCount: text.length
            });
        }
    } catch (err) {
        console.error('File extraction error:', err);
        res.status(500).json({
            success: false,
            error: `Failed to extract text from document: ${err.message}`
        });
    }
});

// 3. Seed 3 Dummy Documents directly via API (resets both DB and disk persistence)
app.post('/api/documents/seed', async (req, res) => {
    try {
        resetPersistedDocuments();

        if (mongoose.connection.readyState === 1) {
            await Document.deleteMany({});

            for (const doc of dummyDocuments) {
                for (const chunk of doc.chunks) {
                    const textToEmbed = `${chunk.sectionTitle} ${chunk.content} ${(chunk.keywords || []).join(' ')}`;
                    chunk.embedding = generateLocalEmbedding(textToEmbed);
                }
                await Document.create(doc);
            }

            const count = await Document.countDocuments();
            return res.json({
                success: true,
                message: `Successfully seeded ${count} dummy documents in MongoDB!`,
                count,
                source: 'mongodb'
            });
        }

        res.json({
            success: true,
            message: `Active knowledge base reset with ${dummyDocuments.length} default documents.`,
            count: dummyDocuments.length,
            source: 'in-memory-persisted'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. RAG Chat Query Endpoint
app.post('/api/rag/chat', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string' || question.trim() === '') {
            return res.status(400).json({ success: false, error: 'A question is required.' });
        }

        const ragResult = await processRagQuery(question.trim());

        res.json({
            success: true,
            question: question.trim(),
            ...ragResult
        });
    } catch (err) {
        console.error('RAG Query Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. Analytics Endpoint (REAL Telemetry - no static placeholders)
app.get('/api/analytics', async (req, res) => {
    try {
        const analytics = await getRealAnalytics();
        res.json({
            success: true,
            ...analytics
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Fallback to React index.html for client-side routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(distPath, 'index.html');
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    next();
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 3000
        });
        console.log('✓ MongoDB Connected Successfully!');

        // Check if DB is already seeded, if not, auto-seed with all inMemoryDocuments
        const count = await Document.countDocuments();
        if (count === 0) {
            console.log(`Knowledge base in MongoDB is empty. Seeding ${inMemoryDocuments.length} documents...`);
            for (const doc of inMemoryDocuments) {
                const docToSave = {
                    title: doc.title,
                    filename: doc.filename,
                    fileSize: doc.fileSize,
                    course: doc.course,
                    category: doc.category,
                    isActive: true,
                    uploadDate: doc.uploadDate || new Date(),
                    chunks: (doc.chunks || []).map(chunk => ({
                        chunkId: chunk.chunkId,
                        sectionTitle: chunk.sectionTitle,
                        content: chunk.content,
                        keywords: chunk.keywords,
                        embedding: chunk.embedding || generateLocalEmbedding(`${chunk.sectionTitle} ${chunk.content} ${(chunk.keywords || []).join(' ')}`)
                    }))
                };
                await Document.create(docToSave);
            }
            console.log(`✓ ${inMemoryDocuments.length} documents indexed into MongoDB successfully!`);
        } else {
            console.log(`✓ Found ${count} active documents in MongoDB knowledge base.`);
        }

        app.listen(PORT, () => {
            console.log(`\n==================================================`);
            console.log(`🚀 Campus Companion Server running at: http://localhost:${PORT}`);
            console.log(`💬 Open Chat: http://localhost:${PORT}/chat`);
            console.log(`📊 Open Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`==================================================\n`);
        });
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\nTIP: Ensure MongoDB is running locally (mongod) or provide a valid MONGODB_URI in .env');
        console.log('Starting server in offline-demo mode for UI preview...');
        app.listen(PORT, () => {
            console.log(`\n==================================================`);
            console.log(`🚀 Campus Companion Server running at: http://localhost:${PORT} (Database offline)`);
            console.log(`💬 Open Chat: http://localhost:${PORT}/chat`);
            console.log(`📊 Open Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`==================================================\n`);
        });
    }
}

startServer();
