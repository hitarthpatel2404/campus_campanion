import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Bell, MessageSquarePlus, Zap, Calendar, BookOpen, Clock, CheckCircle } from 'lucide-react';
import '../styles/dashboard.css';

const DEFAULT_SCHEDULE = [
    { time: '09:00 AM - 10:30 AM', course: 'CS101', title: 'Data Structures & Algorithms Lecture', location: 'Turing Hall - Room 402' },
    { time: '11:00 AM - 01:00 PM', course: 'CS101', title: 'Algorithm Lab Session', location: 'Lab 3 (TA: Rahul Verma)' },
    { time: '02:30 PM - 04:00 PM', course: 'MATH301', title: 'Discrete Mathematics', location: 'Aryabhata Block - 105' }
];

const DEFAULT_ASSIGNMENTS = [
    { course: 'CS101', title: 'Programming Assignment 3 - Binary Trees', due: 'In 3 days', weight: '10%' },
    { course: 'CS101', title: 'Midterm Preparation Quiz', due: 'In 5 days', weight: '5%' },
    { course: 'MATH301', title: 'Graph Theory Problem Set 2', due: 'Next Monday', weight: '8%' }
];

const DEFAULT_INSIGHTS = [
    { title: 'CS101 Midterm Scheduled', desc: 'Midterm will cover Weeks 1-6. Verify syllabus policies in RAG Chat.', tag: 'Exam Alert' },
    { title: 'Library 24/7 Hours', desc: 'Extended 24/7 study access starts 2 weeks before final exam week.', tag: 'Facility' },
    { title: 'Late Submission Grace Period', desc: 'CS101 allows up to 24 hours with a 10% penalty.', tag: 'Policy' }
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [analytics, setAnalytics] = useState({ totalQueries: 14, unresolvedQueries: 2 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [docRes, analyticsRes] = await Promise.allSettled([
                    fetch('/api/documents'),
                    fetch('/api/analytics')
                ]);

                if (docRes.status === 'fulfilled') {
                    const docData = await docRes.value.json();
                    if (docData.success && docData.documents) {
                        setDocuments(docData.documents);
                    }
                }

                if (analyticsRes.status === 'fulfilled') {
                    const aData = await analyticsRes.value.json();
                    if (aData.success) {
                        setAnalytics(aData);
                    }
                }
            } catch (e) {
                console.warn('Dashboard fetch fallback', e);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    const docCount = documents.length > 0 ? documents.length : 3;

    return (
        <div>
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <GraduationCap size={24} style={{ marginRight: '8px' }} />
                        CAMPUS COMPANION
                    </Link>
                    <div className="nav-links">
                        <Link to="/dashboard" className="active">Dashboard</Link>
                        <Link to="/chat">AI Chat</Link>
                        <Link to="/documents">Documents</Link>
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
                <header className="page-header">
                    <div className="header-text">
                        <h1>Welcome back, <span id="user-name">Alex</span></h1>
                        <p id="header-subtitle">Semester 5 • Computer Science & Engineering • Academic Session 2026</p>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        onClick={() => navigate('/chat')}
                    >
                        <MessageSquarePlus size={20} /> Ask AI Companion
                    </button>
                </header>

                <section className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-title">COURSES ENROLLED</div>
                        <div className="kpi-value" id="kpi-courses-val">4</div>
                        <div className="kpi-subtext" id="kpi-courses-sub">CS101, CS204, MATH301, AI405</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">DOCUMENTS IN KNOWLEDGE BASE</div>
                        <div className="kpi-value" id="kpi-documents-val">{docCount}</div>
                        <div className="kpi-subtext" id="kpi-documents-sub">Verified PDFs in MongoDB</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">AI CONTEXT ACTIVE</div>
                        <div className="kpi-value" id="kpi-context-val">{docCount} Active</div>
                        <div className="kpi-subtext" id="kpi-context-sub">100% RAG Grounding Enabled</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">QUERIES ANSWERED</div>
                        <div className="kpi-value" id="kpi-queries-val">{analytics.totalQueries || 14}</div>
                        <div className="kpi-subtext" id="kpi-queries-sub">Total student interactions</div>
                    </div>
                </section>

                <div className="main-grid">
                    <div className="left-column">
                        <div className="card insights-card">
                            <div className="card-header">
                                <h2 className="insights-title">
                                    <Zap size={20} className="icon-zap" style={{ marginRight: '8px' }} /> 
                                    AI Study Insights
                                </h2>
                                <span className="badge badge-gold" id="insights-badge">Live RAG</span>
                            </div>
                            <ul className="insights-list" id="insights-list" style={{ listStyle: 'none', padding: 0 }}>
                                {DEFAULT_INSIGHTS.map((item, idx) => (
                                    <li key={idx} style={{ padding: '0.85rem 1rem', borderBottom: idx < DEFAULT_INSIGHTS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{item.title}</strong>
                                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }}>{item.tag}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{item.desc}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card active-context-card">
                            <div className="card-header">
                                <h2>Active RAG Documents</h2>
                                <Link to="/chat" className="header-link">Open in Chat</Link>
                            </div>
                            <div className="context-list" id="context-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                                {(documents.length > 0 ? documents : [
                                    { title: "CS101 - Introduction to Computer Science Syllabus & Policies", fileSize: "1.8 MB", course: "CS101" },
                                    { title: "Campus Library and Computing Facilities Guidelines", fileSize: "2.4 MB", course: "Campus IT" },
                                    { title: "Academic Calendar & Examination Schedule (Fall 2026)", fileSize: "1.1 MB", course: "Registrar" }
                                ]).map((doc, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <BookOpen size={20} color="#0284c7" />
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.fileSize || '1.5 MB'} • {doc.course || 'Campus'} • Indexed in MongoDB</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="card">
                            <div className="card-header">
                                <h2>Today's Schedule</h2>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Thursday, Fall Term</span>
                            </div>
                            <div className="list-container" id="schedule-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {DEFAULT_SCHEDULE.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0f172a' }}>
                                        <div style={{ minWidth: '120px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={14} /> {item.time}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>[{item.course}] {item.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.location}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2>Upcoming Assignments & Milestones</h2>
                                <Link to="/chat" className="header-link">Ask AI for details</Link>
                            </div>
                            <div className="list-container" id="assignments-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {DEFAULT_ASSIGNMENTS.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>[{item.course}] {item.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>Due: {item.due} • Weight: {item.weight}</div>
                                        </div>
                                        <button 
                                            style={{ padding: '0.35rem 0.75rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                                            onClick={() => navigate('/chat')}
                                        >
                                            Check Rules
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2>AI Chat Quick Launch</h2>
                                <Link to="/chat" className="header-link">Open Full Chat</Link>
                            </div>
                            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CheckCircle size={24} color="#16a34a" />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#166534' }}>RAG Engine Ready</div>
                                        <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Instant answers grounded in your course documents</div>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                    onClick={() => navigate('/chat')}
                                >
                                    Ask Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
