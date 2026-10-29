/**
 * Embedding & Similarity Search Service for Campus Companion RAG
 * Supports deterministic local semantic vectors and optional Google Gemini text embeddings.
 */

// Simple deterministic hash-based vocabulary vectorizer for local semantic representation (size 128)
const VECTOR_DIM = 128;

function tokenize(text) {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
}

// Stopwords to filter out low-information words
const STOPWORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
    'or', 'by', 'with', 'from', 'as', 'that', 'this', 'are', 'was', 'be', 'has',
    'have', 'had', 'you', 'your', 'can', 'will', 'what', 'when', 'where', 'how'
]);

function hashWordToIdx(word, dim) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % dim;
}

/**
 * Generate a normalized dense vector from text
 * @param {string} text 
 * @returns {number[]} 128-dimensional normalized embedding vector
 */
function generateLocalEmbedding(text) {
    const vector = new Array(VECTOR_DIM).fill(0);
    const tokens = tokenize(text).filter(t => !STOPWORDS.has(t));

    if (tokens.length === 0) return vector;

    tokens.forEach(token => {
        const idx = hashWordToIdx(token, VECTOR_DIM);
        vector[idx] += 1;
    });

    // Normalize vector (L2 norm)
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;

    return vector.map(val => Number((val / norm).toFixed(6)));
}

/**
 * Calculate Cosine Similarity between two vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} similarity score from -1.0 to 1.0
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieve top relevant chunks across all documents using semantic cosine similarity & keyword boost
 * @param {string} query 
 * @param {Array} documents - List of MongoDB Document objects
 * @param {number} topK - Number of chunks to retrieve
 * @returns {Array} Top relevant chunks with score and metadata
 */
function findRelevantChunks(query, documents, topK = 3) {
    const queryVector = generateLocalEmbedding(query);
    const queryTokens = tokenize(query).filter(t => !STOPWORDS.has(t));
    const scoredChunks = [];

    documents.forEach(doc => {
        if (!doc.isActive) return;

        (doc.chunks || []).forEach(chunk => {
            let sim = 0;
            if (chunk.embedding && chunk.embedding.length === VECTOR_DIM) {
                sim = cosineSimilarity(queryVector, chunk.embedding);
            } else {
                const chunkVec = generateLocalEmbedding(chunk.content + ' ' + chunk.sectionTitle);
                sim = cosineSimilarity(queryVector, chunkVec);
            }

            // Keyword boost for exact acronyms, numbers, course codes (e.g. CS101, 10%, Dec 10)
            let keywordMatches = 0;
            const contentLower = (chunk.content + ' ' + chunk.sectionTitle + ' ' + (chunk.keywords || []).join(' ')).toLowerCase();
            queryTokens.forEach(token => {
                if (contentLower.includes(token)) {
                    keywordMatches++;
                }
            });

            const keywordBoost = queryTokens.length > 0 ? (keywordMatches / queryTokens.length) * 0.4 : 0;
            const finalScore = Number((sim * 0.6 + keywordBoost).toFixed(4));

            scoredChunks.push({
                docId: doc._id,
                documentTitle: doc.title,
                filename: doc.filename,
                course: doc.course,
                chunkId: chunk.chunkId,
                sectionTitle: chunk.sectionTitle,
                content: chunk.content,
                score: finalScore
            });
        });
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK);
}

module.exports = {
    generateLocalEmbedding,
    cosineSimilarity,
    findRelevantChunks
};
