import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication
        console.log('Login attempt:', { username, email, password });
        navigate('/dashboard');
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
                    AI Campus Companion
                </Link>
                <h1>Welcome back</h1>
                <p>Sign in to continue your study session</p>
            </div>

            <div className="login-card">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                    <div className="form-options">
                        <Link to="#" className="forgot-password">Forgot password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Sign In</button>
                </form>

                <div className="signup-link">
                    Don't have an account? <Link to="/signup">Sign up here</Link>
                </div>
            </div>

            <div className="login-footer">
                By continuing, you agree to our <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
            </div>
        </div>
    );
};

export default Login;
