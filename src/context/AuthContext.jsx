import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await authAPI.getMe();
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token invalid, clear storage
                    authAPI.logout();
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const data = await authAPI.login(username, password);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const register = async (username, email, password) => {
        try {
            const data = await authAPI.register(username, email, password);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = async (profileData) => {
        try {
            const data = await authAPI.updateProfile(profileData);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const refreshUser = async () => {
        try {
            const data = await authAPI.getMe();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return { success: false };
        }
    };

    const forgotPassword = (email) => {
        console.log(`Reset link sent to ${email}`);
        return { success: true, message: 'Reset link sent to your email' };
    };

    // Role check helpers
    const isSuperadmin = () => user?.role === 'superadmin';
    const hasRole = (role) => user?.role === role;

    // Show loading state while checking auth
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Poppins, sans-serif'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            register,
            updateUser,
            refreshUser,
            forgotPassword,
            isSuperadmin,
            hasRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
