import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import Navbar from '../components/Navbar';
import TransactionCard from './TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { TrendingUp, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const Dashboard = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        totalAmount: 0
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionAPI.getMyTransactions();

            if (response.success) {
                const txns = response.transactions || [];
                setTransactions(txns.slice(0, 5)); // Show only latest 5

                // Calculate stats
                const statsData = {
                    total: txns.length,
                    pending: txns.filter(t => t.status === 'pending').length,
                    completed: txns.filter(t => t.status === 'completed' || t.status === 'submitted').length,
                    totalAmount: txns.reduce((sum, t) => sum + (t.amount || 0), 0)
                };
                setStats(statsData);
            }
        } catch (err) {
            setError('Failed to load transactions');
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTransactionClick = (transaction) => {
        console.log('Transaction clicked:', transaction);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {userProfile?.fullName}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Account: {userProfile?.accountNumber}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                            <Clock className="w-10 h-10 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.totalAmount, 'USD')}
                                </p>
                            </div>
                            <Send className="w-10 h-10 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-8 text-white">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/new-transaction')}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all flex items-center space-x-3"
                        >
                            <Send className="w-6 h-6" />
                            <div className="text-left">
                                <p className="font-semibold">New Payment</p>
                                <p className="text-sm text-blue-100">Initiate international transfer</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/history')}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all flex items-center space-x-3"
                        >
                            <Clock className="w-6 h-6" />
                            <div className="text-left">
                                <p className="font-semibold">View History</p>
                                <p className="text-sm text-blue-100">See all transactions</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                        <button
                            onClick={() => navigate('/history')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            View All →
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-12">
                            <LoadingSpinner size="large" text="Loading transactions..." />
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600">{error}</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="py-12 text-center">
                            <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No transactions yet</p>
                            <button
                                onClick={() => navigate('/new-transaction')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Create Your First Transaction
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <TransactionCard
                                    key={transaction.id}
                                    transaction={transaction}
                                    onClick={() => handleTransactionClick(transaction)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;