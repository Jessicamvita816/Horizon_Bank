import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    validateAmount,
    validateCurrency,
    validateSwiftCode,
    validateRecipientAccount,
    validateRecipientName,
    sanitizeInput
} from '../utils/validation';
import { Send, AlertCircle, CheckCircle, DollarSign, Building2, User, CreditCard } from 'lucide-react';

const NewTransaction = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        swiftCode: '',
        recipientAccount: '',
        recipientName: '',
        provider: 'SWIFT'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState('');

    const currencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'CNY'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let sanitizedValue = value;

        // Don't sanitize amount (needs to allow decimals)
        if (name !== 'amount') {
            sanitizedValue = sanitizeInput(value);
        }

        // Convert SWIFT code to uppercase
        if (name === 'swiftCode') {
            sanitizedValue = sanitizedValue.toUpperCase();
        }

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        const amountValidation = validateAmount(formData.amount);
        if (!amountValidation.valid) {
            newErrors.amount = amountValidation.error;
        }

        const currencyValidation = validateCurrency(formData.currency);
        if (!currencyValidation.valid) {
            newErrors.currency = currencyValidation.error;
        }

        const swiftValidation = validateSwiftCode(formData.swiftCode);
        if (!swiftValidation.valid) {
            newErrors.swiftCode = swiftValidation.error;
        }

        const recipientAccountValidation = validateRecipientAccount(formData.recipientAccount);
        if (!recipientAccountValidation.valid) {
            newErrors.recipientAccount = recipientAccountValidation.error;
        }

        const recipientNameValidation = validateRecipientName(formData.recipientName);
        if (!recipientNameValidation.valid) {
            newErrors.recipientName = recipientNameValidation.error;
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
            const response = await transactionAPI.initiateTransaction(formData);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/history');
                }, 2000);
            }
        } catch (error) {
            setApiError(error.response?.data?.message || 'Transaction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">New International Payment</h1>
                    <p className="text-gray-600 mt-2">Initiate a secure SWIFT payment</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fadeIn">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="text-green-800 font-semibold">Transaction Initiated Successfully!</p>
                                <p className="text-green-700 text-sm">Redirecting to transaction history...</p>
                            </div>
                        </div>
                    )}

                    {/* API Error */}
                    {apiError && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-fadeIn">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <p className="text-red-800">{apiError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Amount and Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0.01"
                                        max="1000000"
                                        className={`w-full pl-10 pr-4 py-3 border ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.amount}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency *
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border ${errors.currency ? 'border-red-500' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                >
                                    {currencies.map(curr => (
                                        <option key={curr} value={curr}>{curr}</option>
                                    ))}
                                </select>
                                {errors.currency && (
                                    <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                                )}
                            </div>
                        </div>

                        {/* SWIFT Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SWIFT Code * (8 or 11 characters)
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="swiftCode"
                                    value={formData.swiftCode}
                                    onChange={handleInputChange}
                                    maxLength="11"
                                    className={`w-full pl-10 pr-4 py-3 border ${errors.swiftCode ? 'border-red-500' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                                    placeholder="ABCDEF2A or ABCDEF2AXXX"
                                />
                            </div>
                            {errors.swiftCode && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.swiftCode}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Example: ABNANL2A (ABN AMRO Bank, Netherlands)
                            </p>
                        </div>

                        {/* Recipient Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="recipientName"
                                    value={formData.recipientName}
                                    onChange={handleInputChange}
                                    maxLength="100"
                                    className={`w-full pl-10 pr-4 py-3 border ${errors.recipientName ? 'border-red-500' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.recipientName && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.recipientName}
                                </p>
                            )}
                        </div>

                        {/* Recipient Account */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Account Number * (8-34 characters)
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="recipientAccount"
                                    value={formData.recipientAccount}
                                    onChange={handleInputChange}
                                    maxLength="34"
                                    className={`w-full pl-10 pr-4 py-3 border ${errors.recipientAccount ? 'border-red-500' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="IBAN or Account Number"
                                />
                            </div>
                            {errors.recipientAccount && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.recipientAccount}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Enter IBAN or international account number
                            </p>
                        </div>

                        {/* Provider (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Provider
                            </label>
                            <input
                                type="text"
                                value={formData.provider}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                All international payments are processed via SWIFT network
                            </p>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Transaction Security</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                        <li>All inputs are validated with RegEx patterns</li>
                                        <li>Transaction will be reviewed by an employee before submission</li>
                                        <li>Data is transmitted over HTTPS/SSL encryption</li>
                                        <li>Rate limited to 20 transactions per hour</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="small" text="" />
                                        <span>Processing...</span>
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Success!</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Initiate Payment</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewTransaction;