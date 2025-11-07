import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, CreditCard, Shield, AlertCircle, Users, Building } from 'lucide-react';

const Login = () => {
    const { login, userProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        accountNumber: '',
        password: '',
        role: 'customer' // default
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Sanitize input - Remove potential malicious characters
    const sanitizeInput = (input) => {
        if (typeof input !== 'string') return input;

        // Remove SQL injection patterns
        let sanitized = input.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi, '');

        // Remove script tags (XSS prevention)
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove event handlers
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

        // Remove HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');

        return sanitized.trim();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = name === 'role' ? value : sanitizeInput(value);

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        setErrors(prev => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        // Simple validation for login - only check if fields are not empty
        if (!formData.accountNumber || formData.accountNumber.trim() === '') {
            newErrors.accountNumber = 'Account number is required';
        }

        if (!formData.password || formData.password.trim() === '') {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            await login(formData.accountNumber, formData.password);

            // Wait for userProfile to be set
            setTimeout(() => {
                if (userProfile?.isAdmin) {
                    navigate('/employee');
                } else {
                    navigate('/dashboard');
                }
            }, 100);

        } catch (error) {
            setApiError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                </div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-2xl">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-blue-200">Sign in to Horizon Bank</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                        <p className="text-blue-200 text-sm">Select your role to continue</p>
                    </div>

                    {apiError && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-100 text-sm">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selector */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">Login As *</label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                    formData.role === 'customer' 
                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                        : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'
                                }`}>
                                    <Users className="w-5 h-5" />
                                    <span>Customer</span>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="customer"
                                        checked={formData.role === 'customer'}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                </label>
                                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                    formData.role === 'employee'
                                        ? 'bg-purple-600 border-purple-500 text-white'
                                        : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'
                                }`}>
                                    <Building className="w-5 h-5" />
                                    <span>Employee</span>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="employee"
                                        checked={formData.role === 'employee'}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Account Number *
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange}
                                    maxLength="34"
                                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                                        errors.accountNumber ? 'border-red-500' : 'border-white/20'
                                    } rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    placeholder="Enter your account number"
                                />
                            </div>
                            {errors.accountNumber && (
                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.accountNumber}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                                        errors.password ? 'border-red-500' : 'border-white/20'
                                    } rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <p className="text-xs text-blue-200 flex items-start gap-2">
                            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Maximum 5 login attempts per 15 minutes.</span>
                        </p>
                    </div>

                    {formData.role === 'customer' && (
                        <div className="mt-6 text-center">
                            <p className="text-blue-200 text-sm">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-blue-300/60 text-xs">© 2025 Horizon International Bank</p>
                </div>
            </div>
        </div>
    );
};

export default Login;