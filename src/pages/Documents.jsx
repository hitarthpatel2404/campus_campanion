import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Bell, Upload, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import '../styles/dashboard.css';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Date.now() + Math.random(),
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: new Date().toLocaleDateString(),
            }));
            setDocuments(prev => [...prev, ...newFiles]);
        }
    };

    const removeDocument = (id) => {
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    return (
        <div>
            <nav className="navbar">
                <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={24} />
                        <span>CAMPUS COMPANION</span>
                    </Link>
                    <div className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/chat">AI Chat</Link>
                        <Link to="/documents" className="active">Documents</Link>
                        <Link to="/analytics">Analytics</Link>
                    </div>
                    <div className="nav-profile">
                        <button className="icon-btn"><Bell size={20} /></button>
                        <div className="avatar" id="nav-avatar-container"></div>
                    </div>
                </div>
            </nav>

            <main className="dashboard-container">
                <header className="page-header" style={{ marginBottom: '2rem' }}>
                    <div className="header-text">
                        <h1>Your Documents</h1>
                        <p>Upload and manage your course materials for AI context.</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleUploadClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={20} /> Upload New Document
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                    />
                </header>

                {documents.length === 0 ? (
                    <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#fff' }}>
                        <div style={{ backgroundColor: '#f9fbfd', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'inline-flex' }}>
                            <FileText size={48} color="#a0aec0" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>No documents uploaded yet</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
                            Get started by uploading your syllabus, lecture notes, or readings. The AI Campus Companion will use these to provide verified, context-aware answers.
                        </p>
                        <button className="btn btn-primary" onClick={handleUploadClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem' }}>
                            <Upload size={18} /> Browse Files
                        </button>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                            Supported formats: PDF, DOCX, TXT (Max 50MB)
                        </p>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '0' }}>
                        <div className="list-container" style={{ padding: '0' }}>
                            {documents.map(doc => (
                                <div key={doc.id} className="list-row align-center" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ backgroundColor: '#eef2ff', padding: '0.75rem', borderRadius: '8px', color: 'var(--green-bg)' }}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{doc.name}</strong>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {doc.size} • Uploaded {doc.date}
                                                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircle2 size={14} /> Processed
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeDocument(doc.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                                        title="Delete document"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Documents;
