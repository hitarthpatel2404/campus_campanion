/**
 * Campus Companion - RAG Chat Client
 * Connects frontend to MongoDB Knowledge Base & RAG Chat Endpoint
 */

const API_BASE = window.location.origin;

const fileListContainer = document.getElementById('file-list');
const chatHistoryContainer = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const btnAsk = document.getElementById('btn-ask');
const statusBadge = document.getElementById('db-status-badge');

// Initial Welcome Message
const INITIAL_AI_MESSAGE = `Hello! I am your **AI Campus Companion** with **Retrieval-Augmented Generation (RAG)**.

I have 3 verified campus documents loaded in my **MongoDB Knowledge Base**:
1. 📄 **CS101 Syllabus & Policies** (Office hours, grading weights, late penalties)
2. 🏛️ **Library & Computing Facilities Regulations** (Hours, borrowing, 24/7 exam access, printing)
3. 📅 **Academic Calendar & Exam Schedule** (Add/drop dates, midterms, CS101 final exam)

Feel free to ask any question or tap one of the quick suggestions below!`;

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    loadActiveDocuments();
    appendMessage('ai', INITIAL_AI_MESSAGE);
    setupEventListeners();
});

// Setup event listeners for inputs and quick prompt buttons
function setupEventListeners() {
    btnAsk.addEventListener('click', handleUserSubmit);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserSubmit();
        }
    });

    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            if (query) {
                userInput.value = query;
                handleUserSubmit();
            }
        });
    });
}

// Fetch active documents from MongoDB
async function loadActiveDocuments() {
    try {
        const response = await fetch(`${API_BASE}/api/documents`);
        const data = await response.json();

        if (data.success && data.documents && data.documents.length > 0) {
            renderFileList(data.documents);
            updateStatusBadge(true, `${data.documents.length} Docs in MongoDB`);
        } else {
            fileListContainer.innerHTML = `
                <div style="font-size:0.8rem; color:#64748b; padding:1rem; background:#f8fafc; border-radius:6px; border:1px dashed #cbd5e1;">
                    <p style="margin-bottom:0.5rem;">No documents in MongoDB yet.</p>
                    <button id="btn-quick-seed" style="padding:0.4rem 0.8rem; background:#0f172a; color:#fff; border:none; border-radius:4px; font-size:0.75rem; cursor:pointer;">
                        Seed 3 Dummy Documents
                    </button>
                </div>
            `;
            document.getElementById('btn-quick-seed')?.addEventListener('click', triggerSeed);
            updateStatusBadge(false, 'MongoDB Empty');
        }
    } catch (err) {
        console.warn('Backend not responding or offline:', err);
        // Fallback demo documents for pure frontend display
        renderFallbackFiles();
        updateStatusBadge(false, 'Local Server Offline');
    }
}

// Render document items in the sidebar
function renderFileList(documents) {
    fileListContainer.innerHTML = '';

    documents.forEach(doc => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </div>
            <div class="file-details">
                <div class="file-name" title="${doc.title}">${doc.title}</div>
                <div class="file-meta">${doc.fileSize || '1.5 MB'} • ${doc.course || 'Campus'} • ${doc.chunks ? doc.chunks.length : 3} chunks</div>
            </div>
        `;
        fileListContainer.appendChild(fileItem);
    });
}

function renderFallbackFiles() {
    renderFileList([
        {
            title: "CS101 - Introduction to Computer Science Syllabus & Policies",
            fileSize: "1.8 MB",
            course: "CS101",
            chunks: [1, 2, 3]
        },
        {
            title: "Campus Library and Computing Facilities Guidelines",
            fileSize: "2.4 MB",
            course: "Campus IT",
            chunks: [1, 2, 3]
        },
        {
            title: "Academic Calendar & Examination Schedule (Fall 2026)",
            fileSize: "1.1 MB",
            course: "Registrar",
            chunks: [1, 2, 3]
        }
    ]);
}

// Update header status badge
function updateStatusBadge(isOnline, text) {
    if (!statusBadge) return;
    statusBadge.innerHTML = `
        <span class="${isOnline ? 'status-online' : 'status-offline'}"></span> ${text}
    `;
}

// Quick trigger seed via API
async function triggerSeed() {
    try {
        fileListContainer.innerHTML = '<div style="font-size:0.8rem; color:#64748b;">Seeding 3 dummy documents...</div>';
        const res = await fetch(`${API_BASE}/api/documents/seed`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            loadActiveDocuments();
        }
    } catch (e) {
        alert('Could not seed database. Please ensure "node server.js" is running.');
    }
}

// Handle asking a question
async function handleUserSubmit() {
    const question = userInput.value.trim();
    if (!question) return;

    // Append User Message
    appendMessage('user', question);
    userInput.value = '';
    btnAsk.disabled = true;

    // Show Typing indicator
    const typingId = showTypingIndicator();

    try {
        const response = await fetch(`${API_BASE}/api/rag/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        const data = await response.json();
        removeTypingIndicator(typingId);

        if (data.success) {
            appendMessage('ai', data.answer, data.sources, data.responseTimeMs);
        } else {
            appendMessage('ai', `Sorry, I encountered an error: ${data.error || 'Unable to process query.'}`);
        }
    } catch (err) {
        console.error('Chat error:', err);
        removeTypingIndicator(typingId);
        appendMessage('ai', `Could not reach the Campus Companion backend server. Please make sure \`node server.js\` is running at \`http://localhost:5000\`.`);
    } finally {
        btnAsk.disabled = false;
        userInput.focus();
    }
}

// Append message bubble to chat history
function appendMessage(sender, text, sources = [], responseTimeMs = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format Markdown bold, lists, and line breaks
    let formattedText = formatMarkdown(text);

    let sourcesHtml = '';
    if (sources && sources.length > 0) {
        sourcesHtml = `
            <div class="sources-container">
                <div class="sources-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Verified Citations from MongoDB (${sources.length} sources${responseTimeMs ? ` • ${responseTimeMs}ms` : ''})
                </div>
                <div class="sources-list">
                    ${sources.map(s => `
                        <div class="source-tag" title="${s.content ? escapeHtml(s.content) : ''}">
                            <span>📄 ${s.title}</span>
                            <span style="color:#64748b; font-size:0.68rem;">(${s.sectionTitle})</span>
                            <span class="source-score">${s.similarityScore}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-meta">
            <span class="sender">${sender === 'user' ? 'YOU' : 'AI CAMPUS COMPANION'}</span>
            <span class="dot">•</span>
            <span class="time">${timeStr}</span>
        </div>
        <div class="message-content">
            ${formattedText}
            ${sourcesHtml}
        </div>
    `;

    chatHistoryContainer.appendChild(messageDiv);
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
}

// Typing Indicator
function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'message ai-message';
    typingDiv.innerHTML = `
        <div class="message-meta">
            <span class="sender">AI CAMPUS COMPANION</span>
            <span class="dot">•</span>
            <span class="time">RETRIEVING FROM MONGODB...</span>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatHistoryContainer.appendChild(typingDiv);
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Basic markdown formatter for clean chat messages
function formatMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; padding:0.15rem 0.35rem; border-radius:4px; font-family:monospace;">$1</code>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    return text
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
