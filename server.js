/**
 * Campus Companion - RAG Backend Server
 * Express Server with MongoDB Mongoose & RAG Pipeline
 */

require('dotenv').config();
const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Document = require('./models/Document');
const QueryLog = require('./models/QueryLog');
const { processRagQuery } = require('./services/ragService');
const { dummyDocuments } = require('./seed');
const { generateLocalEmbedding } = require('./services/embeddingService');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_companion';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 1. Health & Status
app.get('/api/health', async (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    let docCount = 0;
    if (isConnected) {
        docCount = await Document.countDocuments();
    }
    res.json({
        status: 'ok',
        mongodb: isConnected ? 'connected' : 'disconnected',
        database: mongoose.connection.name || 'none',
        documentsCount: docCount,
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
    });
});

// 2. Get all Knowledge Base Documents (for Sidebar and Dashboard)
app.get('/api/documents', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const docs = await Document.find({ isActive: true }).select('-chunks.embedding');
            return res.json({ success: true, count: docs.length, documents: docs });
        }
        return res.json({ success: true, count: dummyDocuments.length, documents: dummyDocuments });
    } catch (err) {
        res.json({ success: true, count: dummyDocuments.length, documents: dummyDocuments });
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
                count
            });
        }
        res.json({
            success: true,
            message: `Knowledge base active with ${dummyDocuments.length} documents!`,
            count: dummyDocuments.length
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
            
            // Calculate average response time
            const avgAgg = await QueryLog.aggregate([
                { $group: { _id: null, avgTime: { $avg: '$responseTimeMs' } } }
            ]);
            const avgResponseTime = avgAgg.length > 0 ? Math.round(avgAgg[0].avgTime) : 120;

            return res.json({
                success: true,
                totalQueries,
                unresolvedQueries,
                avgResponseTime: `${avgResponseTime}ms`,
                recentQueries: recentLogs
            });
        }

        // Offline demo fallback stats
        res.json({
            success: true,
            totalQueries: 34,
            unresolvedQueries: 2,
            avgResponseTime: '115ms',
            recentQueries: []
        });
    } catch (err) {
        res.json({
            success: true,
            totalQueries: 34,
            unresolvedQueries: 2,
            avgResponseTime: '115ms',
            recentQueries: []
        });
    }
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
        await mongoose.connect(MONGODB_URI);
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
            console.log(`💬 Open Chat: http://localhost:${PORT}/chat.html`);
            console.log(`📊 Open Dashboard: http://localhost:${PORT}/dashboard.html`);
            console.log(`==================================================\n`);
        });
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\nTIP: Ensure MongoDB is running locally (mongod) or provide a valid MONGODB_URI in .env');
        console.log('Starting server in offline-demo mode for UI preview...');
        app.listen(PORT, () => {
            console.log(`Campus Companion UI running at: http://localhost:${PORT} (Database offline)`);
        });
    }
}

startServer();
