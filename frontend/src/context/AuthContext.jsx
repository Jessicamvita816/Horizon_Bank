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
                // Load user profile from localStorage
                const storedProfile = localStorage.getItem('userProfile');
                if (storedProfile) {
                    setUserProfile(JSON.parse(storedProfile));
                }
            } else {
                setCurrentUser(null);
                setUserProfile(null);
                localStorage.removeItem('userProfile');
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

    // Customer Login function
    const login = async (accountNumber, password) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await authAPI.login({ accountNumber, password });

            if (response.success && response.token) {
                // Sign in with custom token
                await signInWithCustomToken(auth, response.token);

                // Store user profile
                const userProfileData = {
                    ...response.user,
                    isEmployee: false,
                    role: 'customer'
                };
                setUserProfile(userProfileData);
                localStorage.setItem('userProfile', JSON.stringify(userProfileData));

                return response;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Employee Login function
    const employeeLogin = async (employeeId, password) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await authAPI.employeeLogin({ employeeId, password });

            if (response.success && response.token) {
                // Sign in with custom token
                await signInWithCustomToken(auth, response.token);

                // Store employee profile
                const employeeProfileData = {
                    ...response.user,
                    isEmployee: true,
                    role: 'employee'
                };
                setUserProfile(employeeProfileData);
                localStorage.setItem('userProfile', JSON.stringify(employeeProfileData));

                return response;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Employee login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            // Call backend logout if user is authenticated
            if (currentUser) {
                await authAPI.logout();
            }

            // Sign out from Firebase
            await signOut(auth);

            // Clear localStorage
            localStorage.removeItem('userProfile');
            setUserProfile(null);
            setCurrentUser(null);
            setError(null);
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
                const profileData = {
                    ...response.user,
                    isEmployee: response.user.isAdmin || false,
                    role: response.user.isAdmin ? 'employee' : 'customer'
                };
                setUserProfile(profileData);
                localStorage.setItem('userProfile', JSON.stringify(profileData));
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
        employeeLogin,
        logout,
        fetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};