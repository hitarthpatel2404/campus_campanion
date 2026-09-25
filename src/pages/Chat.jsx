import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/chat.css';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Campus Companion. How can I help you with your studies today?", isUser: false }
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        
        // Add user message
        setMessages(prev => [...prev, { id: Date.now(), text: message, isUser: true }]);
        
        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: "I can help answer questions about your course materials once you upload them.", 
                isUser: false 
            }]);
        }, 1000);
        
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
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
                    <span className="semester-info">Current Term</span>
                    <span className="status-badge">System Online</span>
                </div>
            </header>

            <div className="main-container">
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <span className="sidebar-subtitle">RAG KNOWLEDGE BASE</span>
                        <h2>Active Context Files</h2>
                    </div>

                    <div className="file-list">
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                            No active context files.
                        </div>
                    </div>

                    <div className="sidebar-footer">
                        <p>These documents are parsed to provide immediate, verified answers about your courses and schedules.</p>
                    </div>
                </aside>

                <main className="chat-area">
                    <div className="chat-history">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-message ${msg.isUser ? 'user' : 'ai'}`} style={{ 
                                margin: '1rem', 
                                padding: '1rem', 
                                backgroundColor: msg.isUser ? '#eef2ff' : '#f9fafb',
                                borderRadius: '8px',
                                alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                                maxWidth: '80%'
                            }}>
                                <strong>{msg.isUser ? 'You' : 'AI Companion'}</strong>
                                <p style={{ margin: '0.5rem 0 0 0' }}>{msg.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="chat-input-area">
                        <div className="input-box">
                            <div className="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Ask a question about your studies..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button className="btn-ask" onClick={handleSend}>Ask</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Chat;
