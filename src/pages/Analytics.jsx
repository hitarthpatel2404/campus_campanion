import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Download, GraduationCap, Bell, Activity, AlertCircle, Clock } from 'lucide-react';
import '../styles/analytics.css';

const DEFAULT_STRUGGLE_TOPICS = [
    { topic: 'CS101 Late Submission Policies & Grace Period', count: '18 queries', severity: 'High', color: '#ef4444' },
    { topic: 'Library Weekend Access & 24/7 Final Exam Hours', count: '12 queries', severity: 'Medium', color: '#f59e0b' },
    { topic: 'CS101 Final Exam Date & Hall Allocation', count: '9 queries', severity: 'Medium', color: '#f59e0b' },
    { topic: 'Dr. Sharma Office Hours & Room Location', count: '7 queries', severity: 'Low', color: '#10b981' }
];

const DEFAULT_VOLUME = [
    { course: 'CS101 - Intro to CS', percent: 55, queries: '28 queries' },
    { course: 'Campus Policies & Facilities', percent: 25, queries: '13 queries' },
    { course: 'Academic Calendar & Exams', percent: 20, queries: '10 queries' }
];

const Analytics = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState({
        totalQueries: 51,
        unresolvedQueries: 3,
        avgResponseTime: '120ms',
        recentQueries: []
    });

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch('/api/analytics');
                const data = await res.json();
                if (data.success) {
                    setAnalytics(prev => ({
                        totalQueries: data.totalQueries || prev.totalQueries,
                        unresolvedQueries: data.unresolvedQueries || prev.unresolvedQueries,
                        avgResponseTime: data.avgResponseTime || prev.avgResponseTime,
                        recentQueries: data.recentQueries || []
                    }));
                }
            } catch (err) {
                console.warn('Analytics fetch fallback', err);
            }
        }
        fetchAnalytics();
    }, []);

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
                        <Link to="/documents">Documents</Link>
                        <Link to="/analytics" className="active">Analytics</Link>
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
                <header className="dashboard-header" style={{ marginTop: '2rem' }}>
                    <div className="header-title">
                        <h1>Faculty Query Analytics</h1>
                        <p id="faculty-info">Prof. Smith & Dr. Sharma • Computer Science Dept • Fall 2026</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Dashboard
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
                            <Activity size={18} style={{ marginRight: '8px' }} /> Test RAG Chat
                        </button>
                    </div>
                </header>

                <section className="kpi-cards">
                    <div className="card">
                        <div className="card-title">TOTAL QUERIES PROCESSED</div>
                        <div className="card-body">
                            <div className="card-value" id="total-queries-val">{analytics.totalQueries}</div>
                            <div className="card-trend" id="total-queries-trend" style={{ color: '#16a34a' }}>+18% from last week</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-title">UNRESOLVED / ESCALATED</div>
                        <div className="card-body">
                            <div className="card-value" id="unresolved-queries-val">{analytics.unresolvedQueries}</div>
                            <div className="card-trend" id="unresolved-queries-trend" style={{ color: analytics.unresolvedQueries > 0 ? '#ef4444' : '#16a34a' }}>
                                {analytics.unresolvedQueries > 0 ? 'Requires faculty review' : 'All resolved'}
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-title">AVG RAG RETRIEVAL TIME</div>
                        <div className="card-body">
                            <div className="card-value" id="avg-response-time-val">{analytics.avgResponseTime}</div>
                            <div className="card-trend" id="avg-response-time-trend" style={{ color: '#16a34a' }}>Vector search latency</div>
                        </div>
                    </div>
                </section>

                <section className="diagnostics-section">
                    <div className="diagnostics-header">
                        <span className="diagnostics-subtitle">DIAGNOSTICS</span>
                        <h2>Top Student Struggle Topics</h2>
                    </div>
                    <div className="diagnostics-list" id="diagnostics-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {DEFAULT_STRUGGLE_TOPICS.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AlertCircle size={18} color={item.color} />
                                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{item.topic}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{item.count}</span>
                                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${item.color}22`, color: item.color, border: `1px solid ${item.color}55` }}>
                                        {item.severity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bottom-grid">
                    <div className="recent-queries">
                        <div className="section-header">
                            <h3>Recent Queries Logged</h3>
                            <span className="badge" id="priority-queries-badge">Live Feed</span>
                        </div>
                        <div className="query-list" id="recent-queries-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                            {(analytics.recentQueries && analytics.recentQueries.length > 0 ? analytics.recentQueries : [
                                { question: "What is the penalty if I submit my CS101 assignment late?", resolved: true, responseTimeMs: 110 },
                                { question: "What are the library hours on weekends and during final exam week?", resolved: true, responseTimeMs: 95 },
                                { question: "When is the CS101 final exam scheduled and in which hall?", resolved: true, responseTimeMs: 140 },
                                { question: "Can I get an extension for the binary tree project?", resolved: false, responseTimeMs: 130 }
                            ]).map((q, idx) => (
                                <div key={idx} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{q.question}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Response: {q.responseTimeMs || 120}ms</div>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: q.resolved ? '#dcfce7' : '#fee2e2', color: q.resolved ? '#166534' : '#991b1b' }}>
                                        {q.resolved ? 'Resolved' : 'Unresolved'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="vertical-divider"></div>

                    <div className="query-volume">
                        <div className="section-header">
                            <h3>Query Volume by Category</h3>
                        </div>
                        <div className="volume-list" id="volume-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            {DEFAULT_VOLUME.map((vol, idx) => (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                                        <span style={{ fontWeight: 500 }}>{vol.course}</span>
                                        <span style={{ color: '#64748b' }}>{vol.queries} ({vol.percent}%)</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${vol.percent}%`, height: '100%', background: '#0f172a', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="insight-card" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div className="insight-title" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>DISTRIBUTION INSIGHT</div>
                            <p id="distribution-insight-text" style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.35rem', margin: 0 }}>
                                55% of questions focus on CS101 grading policies and exam schedules. Pre-exam announcements can reduce support query volume significantly.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Analytics;
