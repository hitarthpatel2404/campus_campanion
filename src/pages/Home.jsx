import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/styles.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div>
            <nav className="floating-nav">
                <div className="nav-container">
                    <div className="logo">CAMPUS COMPANION</div>
                    <div className="nav-actions">
                        <Link to="/login" className="btn-nav-link">Login</Link>
                        <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
                    </div>
                </div>
            </nav>

            <main style={{ paddingTop: '6rem' }}>
                <section className="hero container" style={{ 
                    textAlign: 'center', 
                    marginTop: '8rem', 
                    marginBottom: '5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '30vh',
                    background: '#ffffff',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>Your AI-Powered Study Partner</h1>
                    <p className="hero-subtitle" style={{ fontSize: '1.1rem', color: '#4a4a4a', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Upload your syllabus, lecture notes, and assignments. Get instant, context-aware answers grounded in your actual course materials.
                    </p>
                </section>

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
                    <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
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
