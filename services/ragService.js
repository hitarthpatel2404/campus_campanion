/**
 * RAG (Retrieval-Augmented Generation) Service
 * Combines MongoDB context retrieval with AI generation (Google Gemini + Local Intelligent Fallback)
 */

const Document = require('../models/Document');
const QueryLog = require('../models/QueryLog');
const { findRelevantChunks } = require('./embeddingService');

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

    answer += `*Sources verified from your course documents.*`;
    return answer;
}

/**
 * Executes the full RAG pipeline:
 * 1. RETRIEVAL: Searches MongoDB for the most semantically relevant chunks
 * 2. AUGMENTATION: Formats the retrieved text as verified context
 * 3. GENERATION: Passes context to Gemini LLM or Local Generator to produce grounded answer
 * 4. LOGGING: Records query in MongoDB QueryLog
 *
 * @param {string} question 
 * @returns {Promise<Object>} Answer with sources and latency
 */
async function processRagQuery(question) {
    const startTime = Date.now();

    // 1. RETRIEVE all active documents from MongoDB
    const activeDocs = await Document.find({ isActive: true });

    if (!activeDocs || activeDocs.length === 0) {
        return {
            answer: "No active documents found in the database. Please run 'npm run seed' to initialize the knowledge base.",
            sources: [],
            contextUsed: false,
            responseTimeMs: Date.now() - startTime
        };
    }

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

    // 4. LOG to MongoDB QueryLog for analytics
    try {
        await QueryLog.create({
            question,
            answer,
            sources: formattedSources.map(s => ({
                title: s.title,
                sectionTitle: s.sectionTitle,
                similarityScore: s.similarityScore
            })),
            course: relevantChunks[0]?.course || 'General',
            resolved: hasSufficientContext,
            responseTimeMs
        });
    } catch (logErr) {
        console.error('Error logging query to MongoDB:', logErr.message);
    }

    return {
        answer,
        sources: formattedSources,
        contextUsed: hasSufficientContext,
        responseTimeMs
    };
}

module.exports = {
    processRagQuery
};
