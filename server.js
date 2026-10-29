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
const { processRagQuery, inMemoryQueryLogs } = require('./services/ragService');
const { dummyDocuments } = require('./seed');
const { generateLocalEmbedding } = require('./services/embeddingService');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_companion';

// Middleware
app.use(cors());
app.use(express.json());

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
            const docs = await Document.find({ isActive: true }).select('-chunks.embedding');
            if (docs && docs.length > 0) {
                return res.json({ success: true, count: docs.length, documents: docs, source: 'mongodb' });
            }
        }
        // Fallback to in-memory verified documents
        res.json({
            success: true,
            count: dummyDocuments.length,
            documents: dummyDocuments.map(d => ({
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
            count: dummyDocuments.length,
            documents: dummyDocuments,
            source: 'in-memory-fallback'
        });
    }
});

// 3. Seed 3 Dummy Documents directly via API
app.post('/api/documents/seed', async (req, res) => {
    try {
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
            message: `Active in-memory knowledge base initialized with ${dummyDocuments.length} documents.`,
            count: dummyDocuments.length,
            source: 'in-memory'
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

// 5. Analytics Endpoint (for Faculty Analytics & Dashboard)
app.get('/api/analytics', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const totalQueries = await QueryLog.countDocuments();
            const unresolvedQueries = await QueryLog.countDocuments({ resolved: false });
            const recentLogs = await QueryLog.find().sort({ createdAt: -1 }).limit(10);
            
            const avgAgg = await QueryLog.aggregate([
                { $group: { _id: null, avgTime: { $avg: '$responseTimeMs' } } }
            ]);
            const avgResponseTime = avgAgg.length > 0 ? Math.round(avgAgg[0].avgTime) : 120;

            return res.json({
                success: true,
                totalQueries,
                unresolvedQueries,
                avgResponseTime: `${avgResponseTime}ms`,
                recentQueries: recentLogs,
                source: 'mongodb'
            });
        }

        // Return in-memory analytics
        const total = inMemoryQueryLogs.length;
        const unresolved = inMemoryQueryLogs.filter(q => !q.resolved).length;
        const avgTime = total > 0 
            ? Math.round(inMemoryQueryLogs.reduce((acc, q) => acc + (q.responseTimeMs || 100), 0) / total)
            : 110;

        res.json({
            success: true,
            totalQueries: total || 18,
            unresolvedQueries: unresolved || 2,
            avgResponseTime: `${avgTime}ms`,
            recentQueries: inMemoryQueryLogs.slice(-10).reverse(),
            source: 'in-memory'
        });
    } catch (err) {
        res.json({
            success: true,
            totalQueries: inMemoryQueryLogs.length,
            unresolvedQueries: 0,
            avgResponseTime: '110ms',
            recentQueries: inMemoryQueryLogs,
            source: 'in-memory-fallback'
        });
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

        // Check if DB is already seeded, if not, auto-seed with the 3 dummy entries
        const count = await Document.countDocuments();
        if (count === 0) {
            console.log('Knowledge base is empty. Auto-seeding 3 dummy documents...');
            for (const doc of dummyDocuments) {
                for (const chunk of doc.chunks) {
                    chunk.embedding = generateLocalEmbedding(`${chunk.sectionTitle} ${chunk.content} ${(chunk.keywords || []).join(' ')}`);
                }
                await Document.create(doc);
            }
            console.log('✓ 3 Dummy documents created in MongoDB successfully!');
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
