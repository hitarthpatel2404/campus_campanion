import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    GraduationCap, 
    Upload, 
    FileText, 
    Trash2, 
    CheckCircle2, 
    RefreshCw, 
    LogOut, 
    X, 
    AlertCircle,
    FileCheck,
    Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const Documents = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractStatus, setExtractStatus] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [notification, setNotification] = useState(null);

    // Form State for Document Upload
    const [docTitle, setDocTitle] = useState('');
    const [docCourse, setDocCourse] = useState('WAD');
    const [docCategory, setDocCategory] = useState('Syllabus');
    const [docFilename, setDocFilename] = useState('');
    const [docContent, setDocContent] = useState('');
    const [fileSizeStr, setFileSizeStr] = useState('1.2 MB');
    const fileInputRef = useRef(null);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            // Immediately restore from local cache if present to prevent blank screen
            try {
                const cached = localStorage.getItem('campus_indexed_documents');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setDocuments(parsed);
                    }
                }
            } catch (e) {}

            const res = await fetch('/api/documents');
            const data = await res.json();
            if (data.success && data.documents) {
                setDocuments(data.documents);
                try {
                    localStorage.setItem('campus_indexed_documents', JSON.stringify(data.documents));
                } catch (e) {}
            }
        } catch (e) {
            console.error('Failed to load documents', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        loadDocuments();
    }, []);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        setDocFilename(file.name);
        const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocTitle(autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1));
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setFileSizeStr(`${sizeMb} MB`);

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            setIsExtracting(true);
            setExtractStatus(`Extracting readable text from "${file.name}"...`);
            setDocContent('Extracting readable text from PDF with server parser, please wait...');

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const base64Data = event.target.result;
                    const res = await fetch('/api/documents/extract', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            base64Data,
                            filename: file.name
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.text) {
                        setDocContent(data.text);
                        showToast(`Extracted ${data.characterCount} characters (${data.pageCount || 1} pages)! Ready for indexing.`, 'success');
                        setExtractStatus(`Extracted ${data.characterCount} characters (${data.pageCount || 1} pages)`);
                    } else if (data.success && !data.text) {
                        setDocContent('');
                        showToast(data.warning || 'No extractable text found in this PDF (might be image scans). Please type or paste syllabus notes directly.', 'error');
                        setExtractStatus('No extractable text found');
                    } else {
                        setDocContent('');
                        showToast(`Extraction error: ${data.error || 'Could not parse PDF text'}`, 'error');
                        setExtractStatus('Extraction failed');
                    }
                } catch (extractErr) {
                    setDocContent('');
                    showToast(`Extraction request failed: ${extractErr.message}`, 'error');
                    setExtractStatus('Extraction error');
                } finally {
                    setIsExtracting(false);
                }
            };
            reader.onerror = () => {
                setIsExtracting(false);
                setDocContent('');
                showToast('Failed to read PDF file in browser.', 'error');
            };
            reader.readAsDataURL(file);
        } else {
            // Text, markdown, JSON, CSV
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                setDocContent(text);
                showToast(`Loaded ${text.length} characters from file.`, 'success');
                setExtractStatus(`Loaded ${text.length} characters`);
            };
            reader.onerror = () => {
                showToast('Unable to read selected file text. Please paste content manually.', 'error');
            };
            reader.readAsText(file);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (isExtracting) {
            showToast('Please wait for document text extraction to complete.', 'info');
            return;
        }
        if (!docContent || docContent.trim().length === 0) {
            showToast('Please provide document content or select a valid text file.', 'error');
            return;
        }

        try {
            setIsUploading(true);
            const payload = {
                title: docTitle.trim() || docFilename || 'Untitled Course Document',
                filename: docFilename.trim() || `${docTitle.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`,
                fileSize: fileSizeStr,
                course: docCourse,
                category: docCategory,
                content: docContent.trim()
            };

            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                showToast(`Success! Document chunked into ${data.chunkCount} vector passages & indexed into knowledge base! Ready for AI Chat.`, 'success');
                setShowUploadModal(false);
                // Reset form
                setDocTitle('');
                setDocFilename('');
                setDocContent('');
                setExtractStatus('');
                await loadDocuments();
            } else {
                showToast(`Upload failed: ${data.error || 'Server error'}`, 'error');
            }
        } catch (err) {
            showToast(`Error uploading document: ${err.message}`, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDocument = async (id, title) => {
        if (!window.confirm(`Are you sure you want to remove "${title}" from the active MongoDB knowledge base?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast(`Document "${title}" removed from knowledge base.`, 'info');
                await loadDocuments();
            } else {
                showToast('Failed to delete document.', 'error');
            }
        } catch (err) {
            showToast('Error removing document.', 'error');
        }
    };

    const handleSeedClick = async () => {
        try {
            setIsSeeding(true);
            const res = await fetch('/api/documents/seed', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast('Default campus documents seeded and indexed successfully in MongoDB!', 'success');
                await loadDocuments();
            }
        } catch (e) {
            showToast('Seed error: could not reset knowledge base.', 'error');
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <nav className="navbar">
                <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={24} color="#10b981" />
                        <span>CAMPUS COMPANION</span>
                    </Link>
                    <div className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/chat">AI Chat</Link>
                        <Link to="/documents" className="active">Documents</Link>
                        <Link to="/analytics">Analytics</Link>
                    </div>
                    <div className="nav-profile">
                        <div className="avatar" id="nav-avatar-container" title={user?.username || 'Alex'}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'HP'}
                            </span>
                        </div>
                        <button 
                            className="btn-logout" 
                            onClick={() => { logout(); navigate('/login'); }}
                            title="Log Out"
                        >
                            <LogOut size={16} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="dashboard-container" style={{ paddingTop: '2.5rem' }}>
                {/* Toast Notification */}
                {notification && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        marginBottom: '1.5rem',
                        borderRadius: '8px',
                        background: notification.type === 'error' ? '#fef2f2' : (notification.type === 'info' ? '#eff6ff' : '#f0fdf4'),
                        border: notification.type === 'error' ? '1px solid #fecaca' : (notification.type === 'info' ? '1px solid #bfdbfe' : '1px solid #bbf7d0'),
                        color: notification.type === 'error' ? '#991b1b' : (notification.type === 'info' ? '#1e40af' : '#166534'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
                            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                            <span>{notification.message}</span>
                        </div>
                        <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="header-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 700 }}>RAG Knowledge Base Documents</h1>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                                MongoDB Vector Store
                            </span>
                        </div>
                        <p style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                            Upload syllabi, lecture notes, and assignments. Every document is chunked, converted to vector embeddings, and indexed into MongoDB for real-time RAG grounding in AI Chat.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={handleSeedClick} 
                            disabled={isSeeding}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem' }}
                        >
                            <RefreshCw size={16} className={isSeeding ? 'spin' : ''} />
                            <span>{isSeeding ? 'Seeding...' : 'Reset Default Knowledge'}</span>
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setShowUploadModal(true)} 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem', backgroundColor: '#0f172a', color: '#ffffff' }}
                        >
                            <Upload size={18} />
                            <span>Upload New Document</span>
                        </button>
                    </div>
                </header>

                {/* Document List Card */}
                <div className="card" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Active Indexed Documents ({documents.length})
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Ready for Vector Retrieval in AI Chat
                        </span>
                    </div>

                    <div className="list-container" style={{ padding: '0' }}>
                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                Loading indexed documents from MongoDB...
                            </div>
                        ) : documents.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>No documents in knowledge base</p>
                                <p style={{ fontSize: '0.85rem', margin: '0 0 1rem 0' }}>Click "Upload New Document" to add and index your course material.</p>
                                <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>Upload Document</button>
                            </div>
                        ) : (
                            documents.map((doc, idx) => (
                                <div 
                                    key={doc._id || idx} 
                                    style={{ 
                                        padding: '1.25rem 1.5rem', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        borderBottom: idx < documents.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        transition: 'background 0.15s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ backgroundColor: '#eef2ff', padding: '0.75rem', borderRadius: '8px', color: '#4f46e5' }}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '0.95rem', marginBottom: '0.25rem', display: 'block', color: '#0f172a' }}>
                                                {doc.title || doc.filename}
                                            </strong>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <span>{doc.fileSize || '1.2 MB'}</span>
                                                <span>•</span>
                                                <span style={{ fontWeight: 600, color: '#334155' }}>[{doc.course || 'General'}]</span>
                                                <span>•</span>
                                                <span>{doc.category || 'Syllabus'}</span>
                                                <span>•</span>
                                                <span>{doc.chunks ? `${doc.chunks.length} chunks embedded` : '3 chunks'}</span>
                                                <span>•</span>
                                                <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                                    <CheckCircle2 size={14} /> Indexed in MongoDB
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => navigate('/chat')}
                                            style={{ 
                                                fontSize: '0.8rem', 
                                                padding: '0.45rem 0.9rem', 
                                                borderRadius: '6px', 
                                                background: '#f1f5f9', 
                                                color: '#0f172a', 
                                                border: '1px solid #cbd5e1',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            Query in Chat
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDocument(doc._id || doc.title, doc.title)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px' }}
                                            title="Delete document from MongoDB"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Document Upload & MongoDB Indexing Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                                    Upload &amp; Index Document in MongoDB
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                                    Document text will be automatically chunked and converted to local vector embeddings for RAG AI Chat.
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowUploadModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit}>
                            <div className="modal-body">
                                {/* File Picker Zone */}
                                <div 
                                    onClick={() => !isExtracting && fileInputRef.current && fileInputRef.current.click()}
                                    style={{
                                        border: isExtracting ? '2px dashed #6366f1' : '2px dashed #cbd5e1',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        cursor: isExtracting ? 'wait' : 'pointer',
                                        background: isExtracting ? '#f5f3ff' : '#f8fafc',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {isExtracting ? (
                                        <RefreshCw size={28} color="#6366f1" className="spin" style={{ marginBottom: '0.5rem' }} />
                                    ) : (
                                        <Upload size={28} color="#4f46e5" style={{ marginBottom: '0.5rem' }} />
                                    )}
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                                        {isExtracting 
                                            ? `Extracting text from ${docFilename}...` 
                                            : (docFilename ? `Selected: ${docFilename}` : 'Click to choose file (.pdf, .txt, .md, .docx)')}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: isExtracting ? '#6366f1' : '#64748b', marginTop: '0.25rem' }}>
                                        {isExtracting 
                                            ? 'Server PDF parser is extracting clean text stream...' 
                                            : 'PDF & text files are extracted automatically into readable plain text'}
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        style={{ display: 'none' }}
                                        onChange={handleFileSelect}
                                        accept=".txt,.md,.pdf,.doc,.docx,.json,.csv"
                                        disabled={isExtracting}
                                    />
                                </div>

                                {extractStatus && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        background: isExtracting ? '#eff6ff' : '#f0fdf4',
                                        border: isExtracting ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                                        color: isExtracting ? '#1d4ed8' : '#15803d',
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}>
                                        {isExtracting ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
                                        <span>{extractStatus}</span>
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                        Document Title *
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="e.g. WAD Syllabus & Web Architecture Guidelines"
                                        value={docTitle}
                                        onChange={(e) => setDocTitle(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.85rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {/* Course & Category Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Course Code *
                                        </label>
                                        <select
                                            value={docCourse}
                                            onChange={(e) => setDocCourse(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.85rem',
                                                background: '#fff'
                                            }}
                                        >
                                            <option value="WAD">WAD - Web Application Development</option>
                                            <option value="ML">ML - Machine Learning</option>
                                            <option value="DCN">DCN - Data Communication &amp; Networks</option>
                                            <option value="SS">SS - System Software</option>
                                            <option value="DMBI">DMBI - Data Mining &amp; Business Intelligence</option>
                                            <option value="VLSI">VLSI - VLSI Design</option>
                                            <option value="CS101">CS101 - Intro to Computer Science</option>
                                            <option value="Campus IT">Campus IT &amp; Facilities</option>
                                            <option value="Registrar">Registrar &amp; Academic Calendar</option>
                                            <option value="General">General Campus Policy</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Category
                                        </label>
                                        <select
                                            value={docCategory}
                                            onChange={(e) => setDocCategory(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.85rem',
                                                background: '#fff'
                                            }}
                                        >
                                            <option value="Syllabus">Syllabus</option>
                                            <option value="Policies">Policies &amp; Regulations</option>
                                            <option value="Notes">Lecture Notes / Slides</option>
                                            <option value="Calendar">Calendar &amp; Exams</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Content Preview / Direct Paste */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                                            Document Content * (Extracted or Paste Directly)
                                        </label>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {docContent.length} characters
                                        </span>
                                    </div>
                                    <textarea 
                                        required
                                        rows={7}
                                        placeholder="Paste syllabus text, course policies, lecture notes, or grading criteria here..."
                                        value={docContent}
                                        onChange={(e) => setDocContent(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.82rem',
                                            fontFamily: 'monospace',
                                            lineHeight: '1.5',
                                            outline: 'none',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={isUploading || isExtracting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={isUploading || isExtracting}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', color: '#fff' }}
                                >
                                    {isUploading ? (
                                        <>
                                            <RefreshCw size={16} className="spin" />
                                            <span>Chunking &amp; Indexing in MongoDB...</span>
                                        </>
                                    ) : isExtracting ? (
                                        <>
                                            <RefreshCw size={16} className="spin" />
                                            <span>Extracting PDF Text...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Cpu size={16} />
                                            <span>Chunk &amp; Index in MongoDB</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
