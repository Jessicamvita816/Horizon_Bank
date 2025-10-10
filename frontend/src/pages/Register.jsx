import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    validateFullName,
    validateIdNumber,
    validateAccountNumber,
    validatePassword,
    checkPasswordStrength
} from '../utils/validation';
import { Eye, EyeOff, Lock, User, CreditCard, Hash, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        accountNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState('');

    const passwordStrength = checkPasswordStrength(formData.password);

    // Custom sanitize function that preserves spaces for names
    const sanitizeName = (name) => {
        if (!name) return name;
        // Remove dangerous patterns but keep spaces
        let sanitized = name.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi, '');
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        return sanitized;
    };

    // Regular sanitize for other fields
    const sanitizeInput = (input) => {
        if (!input) return input;
        let sanitized = input.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '');
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        return sanitized.trim();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Use different sanitization based on field
        const sanitizedValue = name === 'fullName' ? sanitizeName(value) : sanitizeInput(value);

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        // Clear error for this field
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate full name
        const nameValidation = validateFullName(formData.fullName);
        if (!nameValidation.valid) {
            newErrors.fullName = nameValidation.error;
        }

        // Validate ID number
        const idValidation = validateIdNumber(formData.idNumber);
        if (!idValidation.valid) {
            newErrors.idNumber = idValidation.error;
        }

        // Validate account number
        const accountValidation = validateAccountNumber(formData.accountNumber);
        if (!accountValidation.valid) {
            newErrors.accountNumber = accountValidation.error;
        }

        // Validate password
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            newErrors.password = passwordValidation.error;
        }

        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                fullName: formData.fullName.trim(), // Trim only leading/trailing spaces
                idNumber: formData.idNumber,
                accountNumber: formData.accountNumber,
                password: formData.password
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setApiError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                </div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-2xl">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Horizon Bank</h1>
                    <p className="text-blue-200">Secure International Payments</p>
                    <div className="flex items-center justify-center mt-3 space-x-2 text-green-400">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs">Secured with HTTPS/SSL</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-blue-200 text-sm">Join us for secure international transactions</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <p className="text-green-100 text-sm">Registration successful! Redirecting to login...</p>
                        </div>
                    )}

                    {/* API Error Message */}
                    {apiError && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-100 text-sm">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.fullName ? 'border-red-500' : 'border-white/20'
                                        } rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    placeholder="John Doe"
                                    maxLength="100"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* ID Number */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                ID Number * (13 digits)
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    name="idNumber"
                                    value={formData.idNumber}
                                    onChange={handleInputChange}
                                    maxLength="13"
                                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.idNumber ? 'border-red-500' : 'border-white/20'
                                        } rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    placeholder="1234567890123"
                                />
                            </div>
                            {errors.idNumber && (
                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.idNumber}
                                </p>
                            )}
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Account Number * (8-20 characters)
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange}
                                    maxLength="20"
                                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.accountNumber ? 'border-red-500' : 'border-white/20'
                                        } rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    placeholder="ACC12345678"
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
                                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/20'
                                        } rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-blue-200">Password Strength</span>
                                        <span className="text-xs text-blue-200 capitalize">{passwordStrength.level}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength.color === 'red' ? 'bg-red-500' :
                                                passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                            style={{ width: `${passwordStrength.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-2">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                                        } rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : success ? (
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Success!</span>
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Security Features Notice */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <p className="text-xs text-blue-200 flex items-start gap-2">
                            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Your data is protected with HTTPS/SSL encryption, bcrypt password hashing, and RegEx input validation.</span>
                        </p>
                    </div>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-blue-200 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-blue-300/60 text-xs">
                        © 2025 Horizon International Bank. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;