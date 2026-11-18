import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('campus_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Failed to parse campus_user from localStorage', e);
            return null;
        }
    });

    const login = (userData) => {
        const u = {
            username: userData.username || userData.fullName || 'Alex',
            email: userData.email || 'alex@campus.edu',
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        };
        setUser(u);
        try {
            localStorage.setItem('campus_user', JSON.stringify(u));
        } catch (e) {
            console.error('Failed to save user to localStorage', e);
        }
        return u;
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem('campus_user');
        } catch (e) {
            console.error('Failed to remove user from localStorage', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: Boolean(user), login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
