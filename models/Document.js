const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
    chunkId: {
        type: String,
        required: true
    },
    sectionTitle: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    keywords: [{
        type: String
    }],
    embedding: [{
        type: Number
    }]
});

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    filename: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: String,
        default: '1.2 MB'
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Syllabus', 'Policies', 'Calendar', 'Notes', 'General'],
        default: 'General'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    chunks: [ChunkSchema]
}, {
    timestamps: true
});

// Text index for fast fallback full-text search across chunks
DocumentSchema.index({
    'title': 'text',
    'chunks.sectionTitle': 'text',
    'chunks.content': 'text',
    'chunks.keywords': 'text'
});

module.exports = mongoose.model('Document', DocumentSchema);
