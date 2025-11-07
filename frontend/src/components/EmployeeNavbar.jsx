import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Building,
    Clock,
    CheckCircle,
    Users,
    LogOut,
    User,
    Menu,
    X,
    Shield,
    Home
} from 'lucide-react';

const EmployeeNavbar = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/employee-login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Employee-specific navigation links
    const employeeNavLinks = [
        { path: '/employee/dashboard', label: 'Dashboard', icon: Home },
        { path: '/employee/pending', label: 'Pending Payments', icon: Clock },
        { path: '/employee/completed', label: 'Completed', icon: CheckCircle },
        { path: '/employee/customers', label: 'Customers', icon: Users }
    ];

    return (
        <nav className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/employee/dashboard" className="flex items-center space-x-2">
                        <Building className="w-8 h-8 text-white" />
                        <span className="text-white font-bold text-xl">Horizon Bank - Employee</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {employeeNavLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive(link.path)
                                        ? 'bg-white text-purple-600'
                                        : 'text-white hover:bg-purple-700'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {userProfile && (
                            <div className="flex items-center space-x-2 text-white">
                                <User className="w-5 h-5" />
                                <div className="text-right">
                                    <span className="text-sm block">{userProfile.fullName}</span>
                                    <span className="text-xs text-purple-200">Employee ID: {userProfile.accountNumber}</span>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-white p-2"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-purple-700">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {employeeNavLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isActive(link.path)
                                        ? 'bg-white text-purple-600'
                                        : 'text-white hover:bg-purple-600'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {userProfile && (
                            <div className="px-3 py-2 text-white border-t border-purple-600 mt-2 pt-3">
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-5 h-5" />
                                    <div>
                                        <span className="text-sm block">{userProfile.fullName}</span>
                                        <span className="text-xs text-purple-200">Employee ID: {userProfile.accountNumber}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default EmployeeNavbar;