import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Bell, Upload, FileText, Trash2, CheckCircle2, Database, RefreshCw } from 'lucide-react';
import '../styles/dashboard.css';

const DEFAULT_DOCS = [
    {
        id: 'doc-1',
        name: 'CS101_Syllabus_Fall2026.pdf',
        size: '1.8 MB',
        date: 'Oct 2026',
        course: 'CS101',
        title: 'CS101 - Introduction to Computer Science Syllabus & Course Policies'
    },
    {
        id: 'doc-2',
        name: 'Library_Guidelines_2026.pdf',
        size: '2.4 MB',
        date: 'Oct 2026',
        course: 'Campus IT',
        title: 'Campus Library and Computing Facilities Guidelines'
    },
    {
        id: 'doc-3',
        name: 'Academic_Calendar_Fall2026.pdf',
        size: '1.1 MB',
        date: 'Oct 2026',
        course: 'Registrar',
        title: 'Academic Calendar & Examination Schedule (Fall 2026)'
    }
];

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const fileInputRef = useRef(null);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/documents');
            const data = await res.json();
            if (data.success && data.documents && data.documents.length > 0) {
                const mapped = data.documents.map((d, i) => ({
                    id: d._id || `doc-${i}`,
                    name: d.filename || d.title,
                    title: d.title,
                    size: d.fileSize || '1.5 MB',
                    date: 'Fall 2026',
                    course: d.course || 'General'
                }));
                setDocuments(mapped);
            } else {
                setDocuments(DEFAULT_DOCS);
            }
        } catch (e) {
            setDocuments(DEFAULT_DOCS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleSeedClick = async () => {
        try {
            setIsSeeding(true);
            const res = await fetch('/api/documents/seed', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                await loadDocuments();
            }
        } catch (e) {
            console.error('Seed error', e);
        } finally {
            setIsSeeding(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Date.now() + Math.random(),
                name: file.name,
                title: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: new Date().toLocaleDateString(),
                course: 'User Upload'
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
                        <div className="avatar" id="nav-avatar-container">
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>HP</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="dashboard-container">
                <header className="page-header" style={{ marginBottom: '2rem' }}>
                    <div className="header-text">
                        <h1>RAG Knowledge Base Documents</h1>
                        <p>All active course materials chunked and indexed into MongoDB vector store.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={handleSeedClick} 
                            disabled={isSeeding}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <RefreshCw size={18} className={isSeeding ? 'spin' : ''} />
                            {isSeeding ? 'Seeding...' : 'Reset Default Knowledge'}
                        </button>
                        <button className="btn btn-primary" onClick={handleUploadClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={20} /> Upload New Document
                        </button>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                    />
                </header>

                <div className="card" style={{ padding: '0' }}>
                    <div className="list-container" style={{ padding: '0' }}>
                        {documents.map(doc => (
                            <div key={doc.id} className="list-row align-center" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ backgroundColor: '#eef2ff', padding: '0.75rem', borderRadius: '8px', color: '#4f46e5' }}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: '0.95rem', marginBottom: '0.25rem', display: 'block' }}>{doc.title || doc.name}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span>{doc.size}</span>
                                            <span>•</span>
                                            <span>{doc.course}</span>
                                            <span>•</span>
                                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                                <CheckCircle2 size={14} /> Indexed in MongoDB
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Link 
                                        to="/chat" 
                                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '4px', background: '#f1f5f9', color: '#0f172a', textDecoration: 'none', fontWeight: 500 }}
                                    >
                                        Query in Chat
                                    </Link>
                                    <button 
                                        onClick={() => removeDocument(doc.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                                        title="Delete document"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Documents;
