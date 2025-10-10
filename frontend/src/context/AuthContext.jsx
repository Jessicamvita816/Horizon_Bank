import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, signInWithCustomToken } from '../services/firebase';
import { authAPI } from '../services/api';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Load user profile from localStorage or fetch from API
                const storedProfile = localStorage.getItem('userProfile');
                if (storedProfile) {
                    setUserProfile(JSON.parse(storedProfile));
                }
            } else {
                setCurrentUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Register function
    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Login function
    const login = async (accountNumber, password) => {
        try {
            setError(null);
            // Call backend login API
            const response = await authAPI.login({ accountNumber, password });

            if (response.success && response.token) {
                // Sign in with custom token
                await signInWithCustomToken(auth, response.token);

                // Store user profile
                setUserProfile(response.user);
                localStorage.setItem('userProfile', JSON.stringify(response.user));

                return response;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            // Call backend logout
            await authAPI.logout();

            // Sign out from Firebase
            await signOut(auth);

            // Clear localStorage
            localStorage.removeItem('userProfile');
            setUserProfile(null);
            setCurrentUser(null);
        } catch (err) {
            console.error('Logout error:', err);
            // Force logout even if API call fails
            await signOut(auth);
            localStorage.removeItem('userProfile');
            setUserProfile(null);
            setCurrentUser(null);
        }
    };

    // Get user profile
    const fetchUserProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            if (response.success) {
                setUserProfile(response.user);
                localStorage.setItem('userProfile', JSON.stringify(response.user));
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
        }
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        error,
        register,
        login,
        logout,
        fetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};