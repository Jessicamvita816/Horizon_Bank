import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const EmployeeRoute = ({ children }) => {
    const { userProfile, loading, currentUser } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" text="Checking authorization..." />
            </div>
        );
    }

    // Check if user is authenticated AND is an employee/admin
    if (!currentUser || !userProfile || !userProfile.isAdmin) {
        return <Navigate to="/employee-login" replace />;
    }

    return children;
};

export default EmployeeRoute;