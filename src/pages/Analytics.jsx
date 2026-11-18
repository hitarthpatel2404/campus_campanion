import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    GraduationCap, 
    Activity, 
    AlertCircle, 
    Clock, 
    LogOut, 
    Shield, 
    Lock, 
    Key, 
    Unlock, 
    CheckCircle2, 
    RefreshCw, 
    MessageSquare, 
    Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/analytics.css';

const ADMIN_PASSCODE = '1234';

const Analytics = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Admin Passcode Authentication State
    const [isAdminAuthed, setIsAdminAuthed] = useState(() => {
        try {
            return sessionStorage.getItem('analytics_admin_authenticated') === 'true';
        } catch (e) {
            return false;
        }
    });
    const [passcode, setPasscode] = useState('');
    const [authError, setAuthError] = useState('');

    // Real Analytics Data State
    const [analytics, setAnalytics] = useState({
        totalQueries: 0,
        unresolvedQueries: 0,
        avgResponseTime: '0ms',
        topStruggleTopics: [],
        queryVolumeByCategory: [],
        recentQueries: [],
        source: 'loading'
    });
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/analytics');
            const data = await res.json();
            if (data.success) {
                setAnalytics({
                    totalQueries: data.totalQueries || 0,
                    unresolvedQueries: data.unresolvedQueries || 0,
                    avgResponseTime: data.avgResponseTime || '95ms',
                    topStruggleTopics: data.topStruggleTopics || [],
                    queryVolumeByCategory: data.queryVolumeByCategory || [],
                    recentQueries: data.recentQueries || [],
                    source: data.source || 'mongodb'
                });
            }
        } catch (err) {
            console.error('Analytics fetch error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (isAdminAuthed) {
            fetchAnalytics();
        }
    }, [isAdminAuthed]);

    const handlePasscodeSubmit = (e) => {
        e.preventDefault();
        if (passcode.trim() === ADMIN_PASSCODE) {
            setIsAdminAuthed(true);
            try {
                sessionStorage.setItem('analytics_admin_authenticated', 'true');
            } catch (e) {}
            setAuthError('');
            setPasscode('');
        } else {
            setAuthError('Incorrect admin passcode. Access denied.');
        }
    };

    const handleLockPortal = () => {
        setIsAdminAuthed(false);
        try {
            sessionStorage.removeItem('analytics_admin_authenticated');
        } catch (e) {}
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={24} color="#10b981" />
                        <span>CAMPUS COMPANION</span>
                    </Link>
                    <div className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/chat">AI Chat</Link>
                        <Link to="/documents">Documents</Link>
                        <Link to="/analytics" className="active">Analytics</Link>
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

            {!isAdminAuthed ? (
                /* Admin Passcode Gate (1234 Required) */
                <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: '#f8fafc' }}>
                    <div style={{
                        maxWidth: '460px',
                        width: '100%',
                        background: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        padding: '2.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
                            color: '#059669'
                        }}>
                            <Shield size={32} />
                        </div>

                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                            Faculty &amp; Admin Analytics Portal
                        </h1>

                        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 2rem 0', lineHeight: '1.5' }}>
                            This portal contains real student query telemetry and RAG diagnostics. Please enter the administrator passcode to proceed.
                        </p>

                        <form onSubmit={handlePasscodeSubmit}>
                            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                                    Administrator Passcode
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="password"
                                        autoFocus
                                        required
                                        maxLength={10}
                                        placeholder="Enter admin passcode"
                                        value={passcode}
                                        onChange={(e) => setPasscode(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                                            borderRadius: '8px',
                                            border: authError ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                            fontSize: '1rem',
                                            letterSpacing: '0.2em',
                                            outline: 'none',
                                            textAlign: 'center',
                                            fontWeight: 700
                                        }}
                                    />
                                    <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                                {authError && (
                                    <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <AlertCircle size={14} />
                                        <span>{authError}</span>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    justifyContent: 'center',
                                    backgroundColor: '#0f172a',
                                    color: '#ffffff',
                                    cursor: 'pointer'
                                }}
                            >
                                <Unlock size={18} />
                                <span>Unlock Analytics Dashboard</span>
                            </button>
                        </form>

                        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                            Authorized Personnel Only • Faculty &amp; IT Administration
                        </div>
                    </div>
                </main>
            ) : (
                /* Authenticated Faculty Analytics Dashboard (Real Data Only) */
                <main className="dashboard-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
                    <header className="dashboard-header" style={{ marginTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="header-title">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0 }}>Faculty Query Analytics</h1>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={12} /> Live Telemetry
                                </span>
                            </div>
                            <p id="faculty-info" style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                                Real student interactions ground-truth diagnostics • Academic Session 2026
                            </p>
                        </div>
                        <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={fetchAnalytics}
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <RefreshCw size={15} className={loading ? 'spin' : ''} />
                                <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
                                <Activity size={16} /> Test AI Chat
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleLockPortal}
                                title="Lock Admin Portal"
                                style={{ color: '#dc2626' }}
                            >
                                <Lock size={15} /> Lock Admin
                            </button>
                        </div>
                    </header>

                    {/* Real KPI Cards */}
                    <section className="kpi-cards" style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div className="card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                                TOTAL REAL QUERIES PROCESSED
                            </div>
                            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.75rem' }}>
                                <div className="card-value" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>
                                    {analytics.totalQueries}
                                </div>
                                <div className="card-trend" style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
                                    Active Telemetry
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div className="card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                                UNRESOLVED / ESCALATED
                            </div>
                            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.75rem' }}>
                                <div className="card-value" style={{ fontSize: '2.4rem', fontWeight: 800, color: analytics.unresolvedQueries > 0 ? '#ef4444' : '#0f172a' }}>
                                    {analytics.unresolvedQueries}
                                </div>
                                <div className="card-trend" style={{ color: analytics.unresolvedQueries > 0 ? '#ef4444' : '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
                                    {analytics.unresolvedQueries > 0 ? 'Requires faculty review' : 'All resolved with verified context'}
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div className="card-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                                AVG RAG RETRIEVAL TIME
                            </div>
                            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.75rem' }}>
                                <div className="card-value" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a' }}>
                                    {analytics.avgResponseTime}
                                </div>
                                <div className="card-trend" style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
                                    Vector search latency
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Diagnostics: Real Student Struggle Topics (Computed from query logs) */}
                    <section className="diagnostics-section" style={{ borderRadius: '14px', padding: '2.5rem', marginBottom: '2.5rem' }}>
                        <div className="diagnostics-header" style={{ marginBottom: '1.5rem' }}>
                            <span className="diagnostics-subtitle" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#a7f3d0' }}>
                                TELEMETRY DIAGNOSTICS
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '0.35rem 0 0 0' }}>
                                Top Student Struggle Topics (Real Query Volume)
                            </h2>
                        </div>

                        <div className="diagnostics-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {analytics.topStruggleTopics.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                        No student query patterns recorded yet. As students query the RAG AI Chat, real struggle topics will appear here.
                                    </p>
                                </div>
                            ) : (
                                analytics.topStruggleTopics.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '1rem 1.25rem', 
                                            background: 'rgba(255,255,255,0.06)', 
                                            borderRadius: '8px', 
                                            border: '1px solid rgba(255,255,255,0.1)' 
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                            <AlertCircle size={18} color={item.color} />
                                            <div>
                                                <span style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600 }}>
                                                    {item.topic}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginLeft: '8px' }}>
                                                    [{item.course}]
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                                                {item.count}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.72rem', 
                                                padding: '0.2rem 0.6rem', 
                                                borderRadius: '4px', 
                                                background: `${item.color}33`, 
                                                color: item.color, 
                                                border: `1px solid ${item.color}66`,
                                                fontWeight: 700
                                            }}>
                                                {item.severity}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Bottom Grid: Real Query Volume & Recent Queries */}
                    <section className="bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
                        {/* Real Recent Queries Stream */}
                        <div className="recent-queries">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Real Student Queries Logged</h3>
                                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}>
                                    Live Stream
                                </span>
                            </div>

                            <div 
                                className="query-list" 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '0.75rem',
                                    maxHeight: '460px',
                                    overflowY: 'auto',
                                    paddingRight: '0.4rem'
                                }}
                            >
                                {analytics.recentQueries.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                        No recent queries in telemetry log.
                                    </div>
                                ) : (
                                    analytics.recentQueries.map((q, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                padding: '1rem', 
                                                background: '#f8fafc', 
                                                borderRadius: '8px', 
                                                border: '1px solid #e2e8f0'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                                                    {q.question}
                                                </div>
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    padding: '0.2rem 0.5rem', 
                                                    borderRadius: '4px', 
                                                    background: q.resolved ? '#dcfce7' : '#fee2e2', 
                                                    color: q.resolved ? '#166534' : '#991b1b',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    marginLeft: '8px'
                                                }}>
                                                    {q.resolved ? 'Resolved' : 'Unresolved'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', marginBottom: '0.4rem' }}>
                                                {q.answer?.slice(0, 140)}...
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '1rem' }}>
                                                <span>Course: <strong>{q.course || 'General'}</strong></span>
                                                <span>Latency: {q.responseTimeMs || 90}ms</span>
                                                {q.createdAt && (
                                                    <span>{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Real Query Volume by Course */}
                        <div className="query-volume">
                            <div className="section-header" style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Query Volume by Course</h3>
                            </div>

                            <div className="volume-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {analytics.queryVolumeByCategory.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                        No course volume data available.
                                    </div>
                                ) : (
                                    analytics.queryVolumeByCategory.map((vol, idx) => (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{vol.course}</span>
                                                <span style={{ color: '#64748b', fontWeight: 500 }}>{vol.count} ({vol.percent}%)</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div 
                                                    style={{ 
                                                        width: `${vol.percent}%`, 
                                                        height: '100%', 
                                                        background: vol.percent > 40 ? '#4f46e5' : (vol.percent > 20 ? '#0284c7' : '#10b981'), 
                                                        borderRadius: '4px' 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    REAL-TIME TELEMETRY INSIGHT
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.5rem', lineHeight: '1.5', margin: '0.5rem 0 0 0' }}>
                                    Data reflects verified student queries processed through vector embeddings. Questions without verified context are escalated as unresolved for faculty review.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
};

export default Analytics;
