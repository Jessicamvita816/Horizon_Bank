import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sanitizeInput } from '../utils/validation';
import { Eye, EyeOff, Lock, User, Shield, AlertCircle, Building } from 'lucide-react';

const EmployeeLogin = () => {
    const { employeeLogin } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        employeeId: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = sanitizeInput(value);

        setFormData(prev => ({
            ...prev,
            [name]: name === 'employeeId' ? sanitizedValue.toUpperCase() : sanitizedValue
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employeeId || formData.employeeId.trim().length === 0) {
            newErrors.employeeId = 'Employee ID is required';
        } else if (!/^EMP\d{3}$/i.test(formData.employeeId)) {
            newErrors.employeeId = 'Employee ID must be in format EMP001';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 10) {
            newErrors.password = 'Employee password must be at least 10 characters';
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
            await employeeLogin(formData.employeeId, formData.password);
            navigate('/employee/dashboard');
        } catch (error) {
            setApiError(error.message || 'Employee login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                </div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl">
                        <Building className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Employee Portal</h1>
                    <p className="text-purple-200">Secure internal access</p>
                    <div className="flex items-center justify-center mt-3 space-x-2 text-green-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">Restricted Access</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Employee Sign In</h2>
                        <p className="text-purple-200 text-sm">Internal banking system</p>
                    </div>

                    {/* API Error Message */}
                    {apiError && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-fadeIn">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-100 text-sm">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Employee ID */}
                        <div>
                            <label className="block text-sm font-medium text-purple-100 mb-2">
                                Employee ID *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleInputChange}
                                    maxLength="6"
                                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.employeeId ? 'border-red-500' : 'border-white/20'
                                        } rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    placeholder="EMP001"
                                />
                            </div>
                            {errors.employeeId && (
                                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.employeeId}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-purple-100 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/20'
                                        } rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-100 transition-colors"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                'Sign In as Employee'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <h3 className="text-sm font-semibold text-purple-200 mb-2">Demo Credentials:</h3>
                        <div className="text-xs text-purple-300 space-y-1">
                            <p><strong>EMP001</strong> / SecureEmp1@123!</p>
                            <p><strong>EMP002</strong> / SecureEmp2@123!</p>
                        </div>
                    </div>

                    {/* Switch to Customer Login */}
                    <div className="mt-6 text-center">
                        <p className="text-purple-200 text-sm">
                            Customer?{' '}
                            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                Customer Login
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-purple-300/60 text-xs">
                        © 2025 Horizon International Bank. Internal Use Only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;