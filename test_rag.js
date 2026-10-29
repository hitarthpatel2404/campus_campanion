/**
 * CLI Test Script for Campus Companion RAG
 * Tests MongoDB document retrieval & RAG response generation in the terminal
 */

require('dotenv').config();
const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const { processRagQuery } = require('./services/ragService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_companion';

const TEST_QUESTIONS = [
    "What is the penalty if I submit my CS101 assignment late?",
    "What are the library hours on weekends and during final exam week?",
    "When is the CS101 final exam scheduled and in which hall?"
];

async function runTest() {
    console.log("==================================================");
    console.log("🔍 TESTING CAMPUS COMPANION RAG PIPELINE");
    console.log("==================================================");
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}\n`);

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✓ MongoDB Connected!\n");

        for (let i = 0; i < TEST_QUESTIONS.length; i++) {
            const question = TEST_QUESTIONS[i];
            console.log(`--------------------------------------------------`);
            console.log(`[Query ${i + 1}] Student: "${question}"`);
            console.log(`--------------------------------------------------`);

            const result = await processRagQuery(question);

            console.log(`\n📚 Retrieved Citations (${result.sources.length} sources):`);
            result.sources.forEach((s, idx) => {
                console.log(`   ${idx + 1}. [${s.similarityScore}% Match] ${s.title} -> "${s.sectionTitle}"`);
            });

            console.log(`\n🤖 AI Campus Companion Response (${result.responseTimeMs}ms):`);
            console.log(result.answer);
            console.log("\n");
        }

        console.log("==================================================");
        console.log("🎉 All RAG tests completed successfully!");
        console.log("==================================================");

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Test failed:", err.message);
        process.exit(1);
    }
}

runTest();
