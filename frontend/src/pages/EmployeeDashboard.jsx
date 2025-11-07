import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import EmployeeNavbar from '../components/EmployeeNavbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    Shield, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    Send, 
    Users, 
    Building,
    FileText,
    TrendingUp,
    UserCheck,
    X
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const EmployeeDashboard = ({ initialTab = 'dashboard' }) => {
    const { userProfile } = useAuth();
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [completedTransactions, setCompletedTransactions] = useState([]);
    const [allCustomers, setAllCustomers] = useState([]);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        verified: 0,
        completed: 0,
        totalAmount: 0,
        totalCustomers: 0
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Fetch pending transactions
            const pendingResponse = await transactionAPI.getPendingTransactions();
            const pendingTxns = pendingResponse.transactions || [];
            
            // Fetch completed transactions
            const completedResponse = await transactionAPI.getCompletedTransactions();
            const completedTxns = completedResponse.transactions || [];
            
            // Fetch all customers
            const customersResponse = await transactionAPI.getAllCustomers();
            const customers = customersResponse.customers || [];

            setPendingTransactions(pendingTxns);
            setCompletedTransactions(completedTxns);
            setAllCustomers(customers);

            // Calculate stats
            const verifiedCount = pendingTxns.filter(t => t.status === 'verified').length;
            const totalPendingAmount = pendingTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
            
            setStats({
                pending: pendingTxns.length,
                verified: verifiedCount,
                completed: completedTxns.length,
                totalAmount: totalPendingAmount,
                totalCustomers: customers.length
            });

        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const verifyTransaction = async (id) => {
        try {
            const response = await transactionAPI.verifyTransaction(id);
            if (response.success) {
                setPendingTransactions(prev =>
                    prev.map(t => t.id === id ? { ...t, status: 'verified' } : t)
                );
                setStats(prev => ({
                    ...prev,
                    verified: prev.verified + 1
                }));
                setMessage('Transaction verified successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setMessage('Verification failed: ' + (err.response?.data?.message || err.message));
            console.error(err);
        }
    };

    const rejectTransaction = async (transactionId) => {
        if (!rejectionReason.trim()) {
            setMessage('Please provide a rejection reason');
            return;
        }

        try {
            const response = await transactionAPI.rejectTransaction(transactionId, { reason: rejectionReason });
            if (response.success) {
                setPendingTransactions(prev => prev.filter(t => t.id !== transactionId));
                setStats(prev => ({
                    ...prev,
                    pending: prev.pending - 1
                }));
                setMessage('Transaction rejected successfully');
                setShowRejectModal(null);
                setRejectionReason('');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setMessage('Rejection failed: ' + (err.response?.data?.message || err.message));
            console.error(err);
        }
    };

    const submitToSwift = async () => {
        if (!window.confirm(`Submit ${stats.verified} verified transaction(s) to SWIFT?`)) return;

        try {
            setSubmitting(true);
            setMessage('');
            const response = await transactionAPI.submitToSwift();

            if (response.success) {
                setMessage(`${response.submittedCount} transactions submitted to SWIFT successfully`);
                // Refresh data
                fetchDashboardData();
            }
        } catch (err) {
            setMessage('Submit failed: ' + (err.response?.data?.message || err.message));
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // REMOVED: Dashboard rendering function since we're using tabs only

    const renderPendingTransactions = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Transactions ({stats.pending})</h2>
                {stats.verified > 0 && (
                    <button
                        onClick={submitToSwift}
                        disabled={submitting}
                        className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit {stats.verified} to SWIFT
                            </>
                        )}
                    </button>
                )}
            </div>

            {pendingTransactions.length === 0 ? (
                <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">All clear! No pending transactions.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingTransactions.map((tx) => (
                        <div key={tx.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <p className="font-semibold text-gray-900">{tx.senderName}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            tx.status === 'verified' 
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {tx.status === 'verified' ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        From: {tx.senderAccount} → To: {tx.recipientAccount}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="font-semibold">Amount:</span>{' '}
                                            {formatCurrency(tx.amount, tx.currency)}
                                        </div>
                                        <div>
                                            <span className="font-semibold">SWIFT:</span> {tx.swiftCode}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Recipient:</span> {tx.recipientName}
                                        </div>
                                    </div>
                                    {tx.createdAt && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Created: {new Date(tx.createdAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {tx.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => verifyTransaction(tx.id)}
                                                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Verify
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(tx.id)}
                                                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCompletedTransactions = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Completed Transactions ({stats.completed})</h2>
            
            {completedTransactions.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No completed transactions yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {completedTransactions.map((tx) => (
                        <div key={tx.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <p className="font-semibold text-gray-900">{tx.senderName}</p>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            Completed
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {tx.senderAccount} → {tx.recipientAccount}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="font-semibold">Amount:</span>{' '}
                                            {formatCurrency(tx.amount, tx.currency)}
                                        </div>
                                        <div>
                                            <span className="font-semibold">SWIFT:</span> {tx.swiftCode}</div>
                                        <div>
                                            <span className="font-semibold">Recipient:</span> {tx.recipientName}
                                        </div>
                                    </div>
                                    {tx.swiftReference && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            SWIFT Ref: {tx.swiftReference}
                                        </p>
                                    )}
                                    {tx.submittedAt && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Completed: {new Date(tx.submittedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCustomers = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customers ({stats.totalCustomers})</h2>
            
            {allCustomers.length === 0 ? (
                <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No customers found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allCustomers.map((customer) => (
                        <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{customer.fullName}</p>
                                    <p className="text-sm text-gray-600">{customer.accountNumber}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-semibold">ID:</span> {customer.idNumber}</p>
                                <p><span className="font-semibold">Email:</span> {customer.email}</p>
                                <p><span className="font-semibold">Joined:</span> {new Date(customer.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Rejection Modal
    const RejectModal = ({ transactionId, onClose, onConfirm }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Reject Transaction</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-600 mb-4">Please provide a reason for rejecting this transaction:</p>
                <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(transactionId)}
                        disabled={!rejectionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <EmployeeNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-10 h-10 text-purple-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Employee Portal
                                </h1>
                                <p className="text-gray-600">
                                    Welcome, {userProfile?.fullName} • {userProfile?.accountNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success/Error Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                        message.includes('failed') || message.includes('Rejection') || message.includes('error')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                        {message.includes('failed') || message.includes('Rejection') || message.includes('error') ? (
                            <AlertCircle className="w-5 h-5" />
                        ) : (
                            <CheckCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">{message}</span>
                    </div>
                )}

                {/* Main Content */}
                {loading ? (
                    <div className="py-12">
                        <LoadingSpinner size="large" text="Loading dashboard data..." />
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {activeTab === 'pending' && renderPendingTransactions()}
                        {activeTab === 'completed' && renderCompletedTransactions()}
                        {activeTab === 'customers' && renderCustomers()}
                    </>
                )}

                {/* Rejection Modal */}
                {showRejectModal && (
                    <RejectModal
                        transactionId={showRejectModal}
                        onClose={() => {
                            setShowRejectModal(null);
                            setRejectionReason('');
                        }}
                        onConfirm={rejectTransaction}
                    />
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;