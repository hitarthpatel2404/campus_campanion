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
        .filter(w => {
            if (!w) return false;
            // Allow 2-letter course codes like ML, SS, AD, DT, VP, 2C, 4B, 3A, C1, B1
            if (w.length >= 2) return true;
            // Allow numbers (1, 2, 3) and Roman numeral units (i, v, x)
            if (/^[0-9]+$/.test(w) || w === 'i' || w === 'v' || w === 'x') return true;
            return false;
        });
}

// Stopwords to filter out low-information words
const STOPWORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
    'or', 'by', 'with', 'from', 'as', 'that', 'this', 'are', 'was', 'be', 'has',
    'have', 'had', 'you', 'your', 'can', 'will', 'what', 'when', 'where', 'how',
    'give', 'me', 'tell', 'show', 'about', 'please'
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

            // Keyword boost for exact acronyms, numbers, course codes (e.g. WAD, ML, Unit 1, Unit I)
            let keywordMatches = 0;
            const contentLower = (chunk.content + ' ' + chunk.sectionTitle + ' ' + (chunk.keywords || []).join(' ')).toLowerCase();
            const docTitleLower = ((doc.title || '') + ' ' + (doc.course || '') + ' ' + (doc.filename || '')).toLowerCase();

            queryTokens.forEach(token => {
                if (contentLower.includes(token)) {
                    keywordMatches++;
                }
                if (docTitleLower.includes(token)) {
                    keywordMatches += 1.5;
                }
                // Handle 1 <-> i mapping for Unit 1 / Unit I
                if (token === '1' && (contentLower.includes('unit i') || docTitleLower.includes('unit i'))) {
                    keywordMatches += 2;
                }
                if (token === 'i' && (contentLower.includes('unit 1') || docTitleLower.includes('unit 1'))) {
                    keywordMatches += 2;
                }
            });

            const keywordBoost = queryTokens.length > 0 ? (keywordMatches / queryTokens.length) * 0.5 : 0;
            const finalScore = Number((sim * 0.5 + keywordBoost).toFixed(4));

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
