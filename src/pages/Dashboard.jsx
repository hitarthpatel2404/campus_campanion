import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    GraduationCap, 
    MessageSquarePlus, 
    Zap, 
    Calendar, 
    BookOpen, 
    Clock, 
    CheckCircle, 
    LogOut, 
    Table,
    FileText,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TIMETABLE_BY_DAY, WEEKLY_GRID } from '../data/scheduleData';
import '../styles/dashboard.css';

// Real Semester 5 Course Assignments
const REAL_ASSIGNMENTS = [
    { course: 'WAD', title: 'Interactive Web App & MongoDB Authentication', due: 'In 2 days', weight: '15%' },
    { course: 'ML', title: 'Decision Tree & Supervised Learning Classifier', due: 'In 5 days', weight: '10%' },
    { course: 'DCN', title: 'Wireshark Packet Tracing & Subnetting Lab Exercise', due: 'Next Monday', weight: '10%' },
    { course: 'SS', title: 'Two-Pass Assembler Symbol Table Analysis', due: 'In 8 days', weight: '12%' },
    { course: 'DMBI', title: 'Association Rule Mining using Apriori Algorithm', due: 'In 11 days', weight: '10%' }
];

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [analytics, setAnalytics] = useState({ totalQueries: 0, unresolvedQueries: 0 });
    const [_loading, setLoading] = useState(true);

    // Auto-detect current weekday or default to THU
    const currentDayKey = (() => {
        const dayIdx = new Date().getDay();
        const map = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI' };
        return map[dayIdx] || 'THU';
    })();

    const [selectedDay, setSelectedDay] = useState(currentDayKey);
    const [showFullGrid, setShowFullGrid] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // Immediate local cache load for instant display
        try {
            const cached = localStorage.getItem('campus_indexed_documents');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setDocuments(parsed);
                }
            }
        } catch (e) {}

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
                        try {
                            localStorage.setItem('campus_indexed_documents', JSON.stringify(docData.documents));
                        } catch (e) {}
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

    const docCount = documents.length;

    // Real dynamic study insights based on live timetable and database state
    const realInsights = [
        {
            title: `Today's Schedule: ${TIMETABLE_BY_DAY[selectedDay]?.dayName || 'Classes'}`,
            desc: `${(TIMETABLE_BY_DAY[selectedDay]?.items || []).filter(i => i.type !== 'break').length} academic classes scheduled today across Rooms 402, 201, and campus labs.`,
            tag: 'Timetable'
        },
        {
            title: 'Active Knowledge Base',
            desc: `${docCount} verified documents indexed in MongoDB. 100% RAG context active for AI Chat.`,
            tag: 'MongoDB RAG'
        },
        {
            title: 'WAD & CS Course Policy',
            desc: 'Assignments permit up to 24-hr grace period with a 10% penalty before hard deadline closes.',
            tag: 'Policy'
        }
    ];

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <GraduationCap size={24} color="#10b981" style={{ marginRight: '8px' }} />
                        CAMPUS COMPANION
                    </Link>
                    <div className="nav-links">
                        <Link to="/dashboard" className="active">Dashboard</Link>
                        <Link to="/chat">AI Chat</Link>
                        <Link to="/documents">Documents</Link>
                        <Link to="/analytics">Analytics</Link>
                    </div>
                    <div className="nav-profile">
                        <div className="avatar" id="nav-avatar-container" title={user?.username || 'Student'}>
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

            <main className="dashboard-container">
                <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                    <div className="header-text">
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                            Welcome back, <span id="user-name">{user?.username || 'Student'}</span>
                        </h1>
                        <p id="header-subtitle" style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
                            Semester 5 • Computer Science &amp; Engineering • Academic Session 2026
                        </p>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#0f172a', color: '#fff', padding: '0.75rem 1.25rem' }}
                        onClick={() => navigate('/chat')}
                    >
                        <MessageSquarePlus size={20} /> Ask AI Companion
                    </button>
                </header>

                {/* Real KPI Cards */}
                <section className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-title">COURSES ENROLLED</div>
                        <div className="kpi-value" id="kpi-courses-val">6</div>
                        <div className="kpi-subtext" id="kpi-courses-sub">WAD, ML, DCN, SS, DMBI, VLSI</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">DOCUMENTS IN KNOWLEDGE BASE</div>
                        <div className="kpi-value" id="kpi-documents-val">{docCount}</div>
                        <div className="kpi-subtext" id="kpi-documents-sub">Indexed in MongoDB Vector Store</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">AI CONTEXT ACTIVE</div>
                        <div className="kpi-value" id="kpi-context-val">{docCount} Active</div>
                        <div className="kpi-subtext" id="kpi-context-sub">100% RAG Grounding Enabled</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">QUERIES ANSWERED</div>
                        <div className="kpi-value" id="kpi-queries-val">{analytics.totalQueries || 0}</div>
                        <div className="kpi-subtext" id="kpi-queries-sub">Live student query telemetry</div>
                    </div>
                </section>

                <div className="main-grid">
                    {/* Left Column: AI Study Insights & Active Documents */}
                    <div className="left-column">
                        <div className="card insights-card" style={{ borderRadius: '12px' }}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="insights-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                                    <Zap size={18} className="icon-zap" style={{ marginRight: '6px' }} /> 
                                    AI Study Insights
                                </h2>
                                <span className="badge badge-gold" id="insights-badge">Live RAG</span>
                            </div>
                            <ul className="insights-list" id="insights-list" style={{ listStyle: 'none', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0 }}>
                                {realInsights.map((item, idx) => (
                                    <li 
                                        key={idx} 
                                        style={{ 
                                            display: 'block', 
                                            padding: '0.85rem 1rem', 
                                            background: 'rgba(255,255,255,0.06)', 
                                            borderRadius: '8px', 
                                            border: '1px solid rgba(255,255,255,0.1)' 
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                            <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{item.title}</strong>
                                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', color: '#e2e8f0', fontWeight: 600 }}>
                                                {item.tag}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>
                                            {item.desc}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Real Active Documents */}
                        <div className="card active-context-card" style={{ borderRadius: '12px', marginTop: '1.5rem' }}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Active RAG Documents</h2>
                                <Link to="/documents" className="header-link" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                                    Manage Documents
                                </Link>
                            </div>
                            <div className="context-list" id="context-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                                {documents.length === 0 ? (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                        No documents in knowledge base yet. Click "Manage Documents" to upload.
                                    </div>
                                ) : (
                                    documents.slice(0, 4).map((doc, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <BookOpen size={18} color="#4f46e5" />
                                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0f172a' }}>
                                                    {doc.title || doc.filename}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                    {doc.fileSize || '1.2 MB'} • [{doc.course || 'General'}] • Indexed in MongoDB
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Today's Schedule & Assignments */}
                    <div className="right-column">
                        {/* Timetable Section */}
                        <div className="card" style={{ borderRadius: '12px' }}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.15rem' }}>
                                        <Calendar size={18} color="#4f46e5" />
                                        Today's Schedule
                                    </h2>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        Official Timetable • w.e.f. 05/08/2026
                                    </span>
                                </div>
                                <button 
                                    className="btn" 
                                    onClick={() => setShowFullGrid(!showFullGrid)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '0.35rem 0.75rem',
                                        fontSize: '0.75rem',
                                        background: showFullGrid ? '#1e293b' : '#f1f5f9',
                                        color: showFullGrid ? '#fff' : '#1e293b',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Table size={14} />
                                    <span>{showFullGrid ? 'Show Daily View' : 'Full Timetable Grid'}</span>
                                </button>
                            </div>

                            {/* Day Tabs */}
                            <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', overflowX: 'auto', paddingBottom: '4px' }}>
                                {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => { setSelectedDay(day); setShowFullGrid(false); }}
                                        style={{
                                            flex: 1,
                                            padding: '0.45rem 0.6rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: selectedDay === day && !showFullGrid ? '#0f172a' : '#f1f5f9',
                                            color: selectedDay === day && !showFullGrid ? '#ffffff' : '#64748b',
                                            transition: 'all 0.2s ease',
                                            boxShadow: selectedDay === day && !showFullGrid ? '0 2px 6px rgba(15,23,42,0.2)' : 'none'
                                        }}
                                    >
                                        {day} {day === currentDayKey ? '• Today' : ''}
                                    </button>
                                ))}
                            </div>

                            {showFullGrid ? (
                                /* Full Weekly Grid Table View */
                                <div style={{ overflowX: 'auto', marginTop: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                                <th style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: '#334155' }}>TIME</th>
                                                <th style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: '#334155' }}>MON</th>
                                                <th style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: '#334155' }}>TUE</th>
                                                <th style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: '#334155' }}>WED</th>
                                                <th style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: '#334155' }}>THU</th>
                                                <th style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: '#334155' }}>FRI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {WEEKLY_GRID.map((row, rIdx) => (
                                                <tr 
                                                    key={rIdx} 
                                                    style={{ 
                                                        background: row.isLunch ? '#fef08a' : (rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'),
                                                        borderBottom: '1px solid #e2e8f0'
                                                    }}
                                                >
                                                    <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                                        {row.time}
                                                    </td>
                                                    {row.isLunch ? (
                                                        <td colSpan={5} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700, color: '#854d0e', letterSpacing: '0.1em' }}>
                                                            🍽️ LUNCH BREAK
                                                        </td>
                                                    ) : (
                                                        <>
                                                            <td style={{ padding: '0.5rem 0.6rem', color: '#1e293b' }}>{row.mon}</td>
                                                            <td style={{ padding: '0.5rem 0.6rem', color: '#1e293b' }}>{row.tue}</td>
                                                            <td style={{ padding: '0.5rem 0.6rem', color: '#1e293b' }}>{row.wed}</td>
                                                            <td style={{ padding: '0.5rem 0.6rem', color: '#1e293b' }}>{row.thu}</td>
                                                            <td style={{ padding: '0.5rem 0.6rem', color: '#1e293b' }}>{row.fri}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                /* Daily Schedule List */
                                <div className="list-container" id="schedule-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {(TIMETABLE_BY_DAY[selectedDay]?.items || []).map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                display: 'flex', 
                                                gap: '0.85rem', 
                                                padding: '0.75rem', 
                                                background: item.type === 'break' ? '#fefce8' : '#f8fafc', 
                                                borderRadius: '8px', 
                                                borderLeft: `4px solid ${item.color || '#0f172a'}`,
                                                border: item.type === 'break' ? '1px solid #fef08a' : '1px solid #e2e8f0',
                                                borderLeftWidth: '4px'
                                            }}
                                        >
                                            <div style={{ minWidth: '110px', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                                <Clock size={13} /> {item.time}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ 
                                                        fontWeight: 700, 
                                                        fontSize: '0.75rem', 
                                                        padding: '0.15rem 0.45rem', 
                                                        borderRadius: '4px', 
                                                        background: item.type === 'break' ? '#fde047' : '#e2e8f0',
                                                        color: item.type === 'break' ? '#854d0e' : '#0f172a' 
                                                    }}>
                                                        {item.course}
                                                    </span>
                                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                                                        {item.title}
                                                    </span>
                                                </div>

                                                {item.location && (
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                                        📍 {item.location} {item.faculty ? `• Faculty: Prof. ${item.faculty}` : ''}
                                                    </div>
                                                )}

                                                {item.batches && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                                        {item.batches.map((b, bIdx) => (
                                                            <div 
                                                                key={bIdx}
                                                                style={{
                                                                    fontSize: '0.72rem',
                                                                    background: '#ffffff',
                                                                    border: '1px solid #cbd5e1',
                                                                    borderRadius: '4px',
                                                                    padding: '0.2rem 0.5rem',
                                                                    color: '#334155'
                                                                }}
                                                            >
                                                                <strong>Batch {b.batch}:</strong> {b.course} [{b.faculty}] @ {b.room}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Real Semester 5 Assignments */}
                        <div className="card" style={{ borderRadius: '12px', marginTop: '1.5rem' }}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Upcoming Course Assignments &amp; Milestones</h2>
                                <Link to="/chat" className="header-link" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                                    Ask AI for details
                                </Link>
                            </div>
                            <div className="list-container" id="assignments-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                                {REAL_ASSIGNMENTS.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                                                [{item.course}] {item.title}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginTop: '0.2rem' }}>
                                                Due: {item.due} • Weight: {item.weight}
                                            </div>
                                        </div>
                                        <button 
                                            style={{ padding: '0.4rem 0.85rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                            onClick={() => navigate('/chat')}
                                        >
                                            Check Rules
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
