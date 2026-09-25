import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signup.css';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock registration
        console.log('Signup attempt:', { fullName, email, password });
        navigate('/login');
    };

    return (
        <div className="signup-container">
            <div className="signup-header">
                <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
                    AI Campus Companion
                </Link>
                <h1>Create your account</h1>
                <p>Join thousands of students studying smarter</p>
            </div>

            <div className="signup-card">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Create Account</button>
                </form>

                <div className="login-link">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </div>
            </div>

            <div className="signup-footer">
                By continuing, you agree to our <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
            </div>
        </div>
    );
};

export default Signup;
