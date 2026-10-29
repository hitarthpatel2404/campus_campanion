const mongoose = require('mongoose');

const QueryLogSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true
    },
    sources: [{
        title: String,
        sectionTitle: String,
        similarityScore: Number
    }],
    course: {
        type: String,
        default: 'General'
    },
    resolved: {
        type: Boolean,
        default: true
    },
    responseTimeMs: {
        type: Number,
        default: 120
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QueryLog', QueryLogSchema);
