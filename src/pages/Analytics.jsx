import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Download, GraduationCap, Bell } from 'lucide-react';
import '../styles/analytics.css';

const Analytics = () => {
    const navigate = useNavigate();

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
                        <div className="avatar" id="nav-avatar-container"></div>
                    </div>
                </div>
            </nav>

            <main className="dashboard-container">
                <header className="dashboard-header" style={{ marginTop: '2rem' }}>
                    <div className="header-title">
                        <h1>Faculty Query Analytics</h1>
                        <p id="faculty-info">Prof. Smith - Computer Science Dept</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Dashboard
                        </button>
                        <button className="btn btn-secondary">
                            <SlidersHorizontal size={18} style={{ marginRight: '8px' }} /> Filter
                        </button>
                        <button className="btn btn-secondary">
                            <Download size={18} style={{ marginRight: '8px' }} /> Export Data
                        </button>
                    </div>
                </header>

                <section className="kpi-cards">
                    <div className="card">
                        <div className="card-title">TOTAL QUERIES</div>
                        <div className="card-body">
                            <div className="card-value" id="total-queries-val">0</div>
                            <div className="card-trend" id="total-queries-trend" style={{ color: 'var(--text-secondary)' }}>No data</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-title">UNRESOLVED QUERIES</div>
                        <div className="card-body">
                            <div className="card-value" id="unresolved-queries-val">0</div>
                            <div className="card-trend" id="unresolved-queries-trend" style={{ color: 'var(--text-secondary)' }}>No data</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-title">AVG RESPONSE TIME</div>
                        <div className="card-body">
                            <div className="card-value" id="avg-response-time-val">0m</div>
                            <div className="card-trend" id="avg-response-time-trend" style={{ color: 'var(--text-secondary)' }}>No data</div>
                        </div>
                    </div>
                </section>

                <section className="diagnostics-section">
                    <div className="diagnostics-header">
                        <span className="diagnostics-subtitle">DIAGNOSTICS</span>
                        <h2>Top Student Struggle Topics</h2>
                    </div>
                    <div className="diagnostics-list" id="diagnostics-list">
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                            No struggle topics identified yet.
                        </div>
                    </div>
                </section>

                <section className="bottom-grid">
                    <div className="recent-queries">
                        <div className="section-header">
                            <h3>Recent Unresolved Queries</h3>
                            <span className="badge" id="priority-queries-badge">High Priority</span>
                        </div>
                        <div className="query-list" id="recent-queries-list">
                            <div style={{ padding: '2.5rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                No recent unresolved queries.
                            </div>
                        </div>
                    </div>

                    <div className="vertical-divider"></div>

                    <div className="query-volume">
                        <div className="section-header">
                            <h3>Query Volume by Course</h3>
                        </div>
                        <div className="volume-list" id="volume-list">
                            <div style={{ padding: '2.5rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                No query volume data available.
                            </div>
                        </div>
                        
                        <div className="insight-card">
                            <div className="insight-title">DISTRIBUTION INSIGHT</div>
                            <p id="distribution-insight-text">No insights available.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Analytics;
