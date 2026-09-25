import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Bell, MessageSquarePlus, Zap, AlertCircle, FileText, BarChart2 } from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = () => {
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
                            {/* Avatar image goes here */}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="dashboard-container">
                <header className="page-header">
                    <div className="header-text">
                        <h1>Welcome back, <span id="user-name">Student</span></h1>
                        <p id="header-subtitle">Ready for another productive session?</p>
                    </div>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquarePlus size={20} /> Ask AI Companion
                    </button>
                </header>

                <section className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-title">COURSES ENROLLED</div>
                        <div className="kpi-value" id="kpi-courses-val">0</div>
                        <div className="kpi-subtext" id="kpi-courses-sub">Active this semester</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">DOCUMENTS UPLOADED</div>
                        <div className="kpi-value" id="kpi-documents-val">0</div>
                        <div className="kpi-subtext" id="kpi-documents-sub">0 this week</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">AI CONTEXT ACTIVE</div>
                        <div className="kpi-value" id="kpi-context-val">0</div>
                        <div className="kpi-subtext" id="kpi-context-sub">Files processing queries</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-title">QUERIES ANSWERED</div>
                        <div className="kpi-value" id="kpi-queries-val">0</div>
                        <div className="kpi-subtext" id="kpi-queries-sub">Total interactions</div>
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
                                <span className="badge badge-gold" id="insights-badge">New</span>
                            </div>
                            <ul className="insights-list" id="insights-list">
                                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>No new insights today.</p>
                                </div>
                            </ul>
                        </div>

                        <div className="card active-context-card">
                            <div className="card-header">
                                <h2>Active Context</h2>
                                <Link to="#" className="header-link">Manage All</Link>
                            </div>
                            <div className="context-list" id="context-list">
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No active context files.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="card">
                            <div className="card-header">
                                <h2>Today's Schedule</h2>
                                <Link to="#" className="header-link">View Calendar</Link>
                            </div>
                            <div className="list-container" id="schedule-list">
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No events scheduled for today.
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2>Upcoming Assignments</h2>
                                <Link to="#" className="header-link">View All</Link>
                            </div>
                            <div className="list-container" id="assignments-list">
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No upcoming assignments.
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2>Grade Overview</h2>
                                <Link to="#" className="header-link">Full Report</Link>
                            </div>
                            <div className="list-container" id="grade-list">
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No grades available yet.
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2>Recent AI Chat Activity</h2>
                                <Link to="/chat" className="header-link">Open Chat</Link>
                            </div>
                            <div className="list-container" id="chat-activity-list">
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No recent chat activity.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
