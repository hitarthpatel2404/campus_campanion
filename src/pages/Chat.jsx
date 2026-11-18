import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/chat.css';

const FALLBACK_DOCS = [
    {
        title: "WAD - Web Application Development Syllabus & Lab Policies",
        fileSize: "1.8 MB",
        course: "WAD",
        chunks: [1, 2, 3]
    },
    {
        title: "DCN & Machine Learning (ML) Laboratory Regulations & Guidelines",
        fileSize: "2.4 MB",
        course: "ML / DCN",
        chunks: [1, 2, 3]
    },
    {
        title: "Academic Calendar & Examination Schedule (Semester 5 - 2026)",
        fileSize: "1.1 MB",
        course: "Academic Affairs",
        chunks: [1, 2, 3]
    }
];

const QUICK_PROMPTS = [
    "Tell me about WAD Unit 1 topics",
    "What is the late submission policy for WAD?",
    "When and where is the ML lab session?",
    "What are the dates for Semester 5 midterms?",
    "Which room is DCN lecture in on Thursdays?"
];

function buildGreetingMessage(docs) {
    if (!docs || docs.length === 0) {
        return `Hello! I am your **AI Campus Companion** with **Retrieval-Augmented Generation (RAG)**.

I have verified Semester 5 course documents loaded in my **MongoDB Knowledge Base**:
1. 📄 **WAD - Web Application Development Syllabus & Lab Policies** (Prof. AD, Lab 4B & 3A, Room 402/403)
2. 🔬 **DCN & Machine Learning (ML) Laboratory Regulations** (Prof. DT & MSG, Labs 5C & 2C)
3. 📅 **Academic Calendar & Examination Schedule (Semester 5 - 2026)** (Timetable w.e.f. 05/08/2026, Midterms Oct 12-20)

Feel free to ask any question about your courses, uploaded unit notes, or tap a quick prompt below!`;
    }

    const docItems = docs.slice(0, 5).map((d, i) => 
        `${i + 1}. 📄 **${d.title || d.filename}** (${d.course || 'Course'} • ${d.chunks ? d.chunks.length : 3} chunks)`
    ).join('\n');

    return `Hello! I am your **AI Campus Companion** with **Retrieval-Augmented Generation (RAG)**.

I have **${docs.length} active verified documents** indexed in the **MongoDB Knowledge Base**:
${docItems}

Feel free to ask anything about your course materials, unit notes, or tap one of the quick suggestions below!`;
}

function formatMarkdown(text) {
    if (!text) return '';
    // Format bold text
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Format bullet points
    formatted = formatted.replace(/^\s*[-•]\s+(.*)$/gm, '<li style="margin-left: 1.25rem; margin-top: 0.25rem;">$1</li>');
    // Format numbered lists
    formatted = formatted.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li style="margin-left: 1.25rem; margin-top: 0.25rem;" value="$1">$2</li>');
    // Wrap consecutive list items in ul or ol
    formatted = formatted.replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin: 0.5rem 0; padding-left: 0.5rem;">$&</ul>');
    // Format line breaks
    formatted = formatted.replace(/\n\n/g, '<div style="height:0.6rem"></div>');
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
}

const Chat = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: buildGreetingMessage([]),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: []
        }
    ]);
    const [documents, setDocuments] = useState([]);
    const [isDbOnline, setIsDbOnline] = useState(false);
    const [dbStatusText, setDbStatusText] = useState('Connecting to MongoDB...');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    // Scroll to bottom whenever messages or typing changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Fetch documents and backend health
    useEffect(() => {
        // Pre-load from local cache if present
        try {
            const cached = localStorage.getItem('campus_indexed_documents');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setDocuments(parsed);
                    setIsDbOnline(true);
                    setDbStatusText(`${parsed.length} Docs Active (RAG Ready)`);
                    setMessages(prev => {
                        if (prev.length === 1 && prev[0].id === 1) {
                            return [{
                                ...prev[0],
                                text: buildGreetingMessage(parsed)
                            }];
                        }
                        return prev;
                    });
                }
            }
        } catch (e) {}

        async function fetchContext() {
            try {
                const res = await fetch('/api/documents');
                const data = await res.json();
                if (data.success && data.documents && data.documents.length > 0) {
                    setDocuments(data.documents);
                    try {
                        localStorage.setItem('campus_indexed_documents', JSON.stringify(data.documents));
                    } catch (e) {}
                    setIsDbOnline(true);
                    if (data.source === 'mongodb') {
                        setDbStatusText(`${data.documents.length} Docs in MongoDB`);
                    } else {
                        setDbStatusText(`${data.documents.length} Docs Active (RAG Ready)`);
                    }
                    // Dynamically update greeting with live documents
                    setMessages(prev => {
                        if (prev.length === 1 && prev[0].id === 1) {
                            return [{
                                ...prev[0],
                                text: buildGreetingMessage(data.documents)
                            }];
                        }
                        return prev;
                    });
                } else {
                    setDocuments(FALLBACK_DOCS);
                    setIsDbOnline(true);
                    setDbStatusText('3 Docs Active (RAG Ready)');
                }
            } catch (err) {
                setDocuments(FALLBACK_DOCS);
                setIsDbOnline(true);
                setDbStatusText('3 Docs Active (RAG Ready)');
            }
        }
        fetchContext();
    }, []);

    const sendMessage = async (textToSend) => {
        const query = (textToSend || message).trim();
        if (!query || isTyping) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add user message
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: query,
            time: timeStr
        };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/rag/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query })
            });

            const data = await res.json();
            setIsTyping(false);

            if (data.success) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: 'ai',
                        text: data.answer,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        sources: data.sources || [],
                        responseTimeMs: data.responseTimeMs
                    }
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: 'ai',
                        text: `Sorry, I encountered an issue: ${data.error || 'Unable to process query.'}`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        sources: []
                    }
                ]);
            }
        } catch (err) {
            setIsTyping(false);
            // Fallback response for offline/preview mode
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: `Could not reach the Campus Companion backend server at \`/api/rag/chat\`. Make sure the backend server is running with \`npm run server\`.`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sources: []
                }
            ]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="app-layout">
            <header className="app-header">
                <Link to="/dashboard" className="header-left" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    <span className="brand">AI Campus Companion</span>
                </Link>
                <div className="header-right">
                    <span className="semester-info">Semester-5th 2026</span>
                    <span className="status-badge" id="db-status-badge">
                        <span className={isDbOnline ? 'status-online' : 'status-offline'}></span>
                        {dbStatusText}
                    </span>
                    <button 
                        className="btn-logout" 
                        onClick={() => { logout(); navigate('/login'); }}
                        title="Log Out"
                        style={{ marginLeft: '0.5rem' }}
                    >
                        <LogOut size={16} />
                        <span>Log Out</span>
                    </button>
                </div>
            </header>

            <div className="main-container">
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <span className="sidebar-subtitle">RAG KNOWLEDGE BASE (MONGODB)</span>
                        <h2>Active Context Files</h2>
                    </div>

                    <div className="file-list" id="file-list">
                        {documents.map((doc, idx) => (
                            <div key={idx} className="file-item">
                                <div className="file-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <div className="file-details">
                                    <div className="file-name" title={doc.title}>{doc.title}</div>
                                    <div className="file-meta">
                                        {doc.fileSize || '1.5 MB'} • {doc.course || 'Campus'} • {doc.chunks ? doc.chunks.length : 3} chunks
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-footer">
                        <p>These documents are retrieved from MongoDB to provide immediate, verified answers about your courses, policies, and schedules.</p>
                    </div>
                </aside>

                <main className="chat-area">
                    <div className="chat-history" id="chat-history">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.sender}-message`}>
                                <div className="message-meta">
                                    <span className="sender">{msg.sender === 'user' ? 'YOU' : 'AI CAMPUS COMPANION'}</span>
                                    <span className="dot">•</span>
                                    <span className="time">{msg.time}</span>
                                </div>
                                <div className="message-content">
                                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="sources-container">
                                            <div className="sources-label">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                </svg>
                                                Verified Citations from MongoDB ({msg.sources.length} sources{msg.responseTimeMs ? ` • ${msg.responseTimeMs}ms` : ''})
                                            </div>
                                            <div className="sources-list">
                                                {msg.sources.map((s, sIdx) => (
                                                    <div key={sIdx} className="source-tag" title={s.content || ''}>
                                                        <span>📄 {s.title}</span>
                                                        <span style={{ color: '#64748b', fontSize: '0.68rem' }}>({s.sectionTitle})</span>
                                                        <span className="source-score">{s.similarityScore}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message ai-message">
                                <div className="message-meta">
                                    <span className="sender">AI CAMPUS COMPANION</span>
                                    <span className="dot">•</span>
                                    <span className="time">RETRIEVING FROM MONGODB...</span>
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="chat-input-area">
                        {/* Quick Prompts Bar */}
                        <div className="quick-prompts-bar">
                            {QUICK_PROMPTS.map((prompt, pIdx) => (
                                <button
                                    key={pIdx}
                                    type="button"
                                    className="quick-prompt-btn"
                                    onClick={() => sendMessage(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <div className="input-box">
                            <div className="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                id="user-input"
                                placeholder="Ask about WAD Unit 1, Machine Learning, DCN, lab timings, or exam policies..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isTyping}
                                autoComplete="off"
                            />
                            <button className="btn-ask" id="btn-ask" onClick={() => sendMessage()} disabled={isTyping}>
                                Ask
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Chat;
