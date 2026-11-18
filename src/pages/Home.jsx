import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    GraduationCap, 
    Lock, 
    Clock, 
    Calendar, 
    CheckCircle2, 
    ShieldCheck, 
    LogOut,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TIMETABLE_BY_DAY } from '../data/scheduleData';
import heroBg from '../assets/hero-bg.jpg';
import '../styles/styles.css';

const Home = () => {
    const navigate = useNavigate();
    const { user, isLoggedIn, logout } = useAuth();
    const [previewDay, setPreviewDay] = useState('THU');

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            {/* Mint-Style Top Navbar */}
            <nav className="mint-navbar">
                <div className="mint-nav-container">
                    <div className="mint-logo" onClick={() => navigate('/')}>
                        <GraduationCap className="mint-logo-icon" />
                        <span>campus companion</span>
                    </div>

                    <ul className="mint-nav-links">
                        <li>
                            <a href="#how-it-works" className="mint-nav-link">How It Works</a>
                        </li>
                        <li>
                            <a href="#timetable" className="mint-nav-link">Timetable</a>
                        </li>
                    </ul>

                    <div className="mint-nav-actions">
                        {isLoggedIn ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 600 }}>
                                    Hi, {user?.username || 'Student'}
                                </span>
                                <Link to="/dashboard" className="mint-nav-link" style={{ fontWeight: 700, color: '#0f172a' }}>
                                    Dashboard
                                </Link>
                                <button 
                                    className="btn-logout" 
                                    onClick={logout}
                                    title="Log Out"
                                >
                                    <LogOut size={15} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="mint-nav-login">
                                    <Lock size={15} />
                                    <span>Login</span>
                                </Link>
                                <button 
                                    className="mint-btn-orange"
                                    onClick={() => navigate('/signup')}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mint-Style Photography Hero Section */}
            <header 
                className="mint-hero" 
                style={{ 
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.82)), url(${heroBg})` 
                }}
            >
                <div className="mint-hero-eyebrow">
                    BE GOOD WITH YOUR STUDIES
                </div>

                <h1 className="mint-hero-title">
                    SO YOU CAN BE CONFIDENT WITH EVERY CLASS &amp; EXAM
                </h1>

                <p className="mint-hero-subtitle">
                    Get your syllabus-grounded AI companion and start making academic success a reality. Instant answers directly from your verified course documents.
                </p>

                <div className="mint-hero-cta-group">
                    <button 
                        className="mint-hero-btn-main"
                        onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signup')}
                    >
                        <Lock size={16} />
                        <span>{isLoggedIn ? 'GO TO DASHBOARD' : 'SIGN UP FREE'}</span>
                    </button>
                </div>

                {/* Downward Notch Pointer Arrow matching Mint screenshot */}
                <div className="mint-hero-notch"></div>
            </header>

            {/* Mint 3-Column Features Section */}
            <section className="mint-features-section" id="how-it-works">
                <div className="mint-features-container">
                    {/* Column 1: Bills? Paid -> Syllabus? Verified */}
                    <div className="mint-feature-col">
                        <h3>Syllabus? Verified</h3>
                        <p>
                            Don't guess course policies again. Upload your CS101, WAD, and ML syllabi to get verified answers with direct citations.
                        </p>
                        <span className="mint-feature-tag">
                            <CheckCircle2 size={13} /> 100% Grounded Context
                        </span>
                    </div>

                    {/* Column 2: All-in-one? Done -> Timetable? Synced */}
                    <div className="mint-feature-col">
                        <h3>Timetable? Synced</h3>
                        <p>
                            From daily lecture hours to lab batches (B1, B2, B3) and faculty rooms (402, 201, 303B)—get your daily classes organized in one place.
                        </p>
                        <span className="mint-feature-tag">
                            <Calendar size={13} /> Official W.E.F Schedule
                        </span>
                    </div>

                    {/* Column 3: Credit? Checked -> Deadlines? Aced (with top speech pointer) */}
                    <div className="mint-feature-col mint-pointer-bubble">
                        <h3>Deadlines? Aced</h3>
                        <p>
                            Track assignment submissions, quiz weightages, and late submission grace period rules before penalty marks are deducted.
                        </p>
                        <span className="mint-feature-tag">
                            <ShieldCheck size={13} /> Zero Hallucinations
                        </span>
                    </div>
                </div>
            </section>

            {/* Timetable Quick Glance on Home Page */}
            <section className="container" id="timetable" style={{ margin: '4rem auto' }}>
                <div className="timetable-preview-banner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                LIVE ACADEMIC TIMETABLE
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0.25rem 0' }}>
                                Weekly Class &amp; Lab Schedule
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                                Official classroom schedule (w.e.f. 05/08/2026). Select a day to preview classes:
                            </p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/dashboard')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <span>Open Full Schedule in Dashboard</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Day selector tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => (
                            <button
                                key={day}
                                onClick={() => setPreviewDay(day)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: previewDay === day ? '#0f172a' : '#ffffff',
                                    color: previewDay === day ? '#ffffff' : '#4b5563',
                                    boxShadow: previewDay === day ? '0 4px 10px rgba(15,23,42,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {TIMETABLE_BY_DAY[day]?.dayName} ({day})
                            </button>
                        ))}
                    </div>

                    {/* Preview Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {(TIMETABLE_BY_DAY[previewDay]?.items || []).slice(0, 4).map((slot, sIdx) => (
                            <div 
                                key={sIdx}
                                style={{
                                    background: slot.type === 'break' ? '#fefce8' : '#ffffff',
                                    border: slot.type === 'break' ? '1px solid #fef08a' : '1px solid #e5e7eb',
                                    borderLeft: `4px solid ${slot.color || '#4f46e5'}`,
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {slot.time}
                                    </span>
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        fontWeight: 700, 
                                        padding: '0.15rem 0.5rem', 
                                        borderRadius: '4px', 
                                        background: slot.type === 'break' ? '#fde047' : '#f1f5f9',
                                        color: slot.type === 'break' ? '#854d0e' : '#1e293b'
                                    }}>
                                        {slot.course}
                                    </span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
                                    {slot.title}
                                </div>
                                {slot.location && (
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.3rem' }}>
                                        📍 {slot.location} {slot.faculty ? `• Prof. ${slot.faculty}` : ''}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* RAG Feature Box */}
            <main>
                <section className="feature-highlight container">
                    <div className="feature-box">
                        <div className="feature-box-header">
                            <h2>Retrieval-Augmented Generation</h2>
                            <span className="badge">GUARANTEED CONTEXT</span>
                        </div>
                        <div className="feature-box-divider"></div>
                        <div className="feature-box-content">
                            <p>Every answer is grounded in your uploaded documents — syllabi, lecture recordings, research papers. No hallucinations, just your curriculum.</p>
                            <ul>
                                <li>Document-grounded answers</li>
                                <li>Multi-file cross-referencing</li>
                                <li>Citation-linked responses</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="capabilities container">
                    <div className="section-header">
                        <span className="section-title">SYSTEM CAPABILITIES</span>
                        <div className="section-line"></div>
                    </div>

                    <div className="cards-grid">
                        <div className="card card-beige">
                            <h3>Smart Scheduling</h3>
                            <p>Syncs with your timetable to suggest optimal study blocks. By parsing your course syllabus dates automatically, it plots quiet revision windows exactly when assignments loom.</p>
                        </div>

                        <div className="card card-orange">
                            <h3>Assignment Tracker</h3>
                            <p>Tracks deadlines and breaks large, intimidating projects into smaller actionable milestones. Never get caught off guard by a major percentage block on your syllabus again.</p>
                        </div>

                        <div className="card card-green">
                            <h3>Study Groups</h3>
                            <p>Matches you automatically with peers studying identical modules, allowing collaborative, context-verified Q&A sessions. Shared learning, validated by your actual course readings.</p>
                        </div>
                    </div>
                </section>

                <section className="bottom-cta container">
                    <div className="bottom-cta-divider"></div>
                    <h2>Ready to study smarter?</h2>
                    <button className="mint-btn-orange" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/signup')}>
                        Get Started Free
                    </button>
                </section>

                <section className="contact-section container">
                    <div className="section-header">
                        <span className="section-title">CONTACT US</span>
                        <div className="section-line"></div>
                    </div>
                    <div className="contact-content">
                        <div className="contact-info">
                            <h3>Get in Touch</h3>
                            <p>Have questions or need support? We'd love to hear from you.</p>
                            <ul className="contact-details">
                                <li><strong>Email:</strong> support@campuscompanion.ai</li>
                                <li><strong>Phone:</strong> +91 1234567890</li>
                                <li><strong>Location:</strong> Adani University, Adani Shantigram, Gandhinagar, Gujarat, India</li>
                            </ul>
                        </div>
                        <div className="contact-map">
                            <iframe 
                                src="https://maps.google.com/maps?q=Adani+University,+Adani+Shantigram,+Gandhinagar,+Gujarat,+India&t=&z=14&ie=UTF8&iwloc=&output=embed" 
                                width="100%" 
                                height="250" 
                                style={{ border: 0, borderRadius: '8px' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer container">
                <div className="footer-content">
                    <span className="copyright">© 2026 AI Campus Companion Technologies Inc.</span>
                    <span className="footer-links">
                        <Link to="#">Terms of Publication</Link> · <Link to="#">Privacy Guidelines</Link>
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Home;
