import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import Navbar from '../components/Navbar';
import TransactionCard from './TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { auth } from '../services/firebase';

const TransactionHistory = () => {
    // Store all transactions from database
    const [transactions, setTransactions] = useState([]);

    // Store filtered transactions based on search/filter
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    // Track loading state
    const [loading, setLoading] = useState(true);

    // Store error messages
    const [error, setError] = useState('');

    // Store search input value
    const [searchTerm, setSearchTerm] = useState('');

    // Store selected status filter
    const [statusFilter, setStatusFilter] = useState('all');

    // Load transactions when component mounts
    // Also wait for Firebase auth to be ready
    useEffect(() => {
        // Wait for Firebase auth to initialize before fetching
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is logged in, fetch their transactions
                fetchTransactions();
            } else {
                // User not logged in
                setLoading(false);
                setError('Please log in to view transactions');
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Re-filter transactions when search term, status filter, or transactions change
    useEffect(() => {
        filterTransactions();
    }, [searchTerm, statusFilter, transactions]);

    // Fetch all transactions for the current user from backend
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError('');

            // Make API call to get user's transactions
            const response = await transactionAPI.getMyTransactions();

            if (response.success) {
                // Store transactions in state
                setTransactions(response.transactions || []);
                console.log('Loaded transactions:', response.transactions.length);
            } else {
                setError('Failed to load transactions');
            }
        } catch (err) {
            // Handle errors from API call
            console.error('Error fetching transactions:', err);

            if (err.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else {
                setError('Failed to load transactions. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter transactions based on search term and status filter
    const filterTransactions = () => {
        let filtered = [...transactions];

        // Apply status filter if not "all"
        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        // Apply search filter if search term exists
        if (searchTerm && searchTerm.trim().length > 0) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.recipientName?.toLowerCase().includes(search) ||
                t.recipientAccount?.toLowerCase().includes(search) ||
                t.swiftCode?.toLowerCase().includes(search) ||
                t.senderAccount?.toLowerCase().includes(search)
            );
        }

        // Update filtered transactions
        setFilteredTransactions(filtered);
    };

    // Handle clicking on a transaction card
    const handleTransactionClick = (transaction) => {
        console.log('Transaction clicked:', transaction);
        // Could open a modal or navigate to detail page
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchTransactions();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                            <p className="text-gray-600 mt-2">View and manage your international payments</p>
                        </div>
                        {/* Refresh button */}
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Search and Filter controls */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by recipient, account, or SWIFT code..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status filter dropdown */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">All Transactions</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="submitted">Submitted</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transactions list container */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    {loading ? (
                        // Show loading spinner while fetching data
                        <div className="py-12">
                            <LoadingSpinner size="large" text="Loading transactions..." />
                        </div>
                    ) : error ? (
                        // Show error message if fetch failed
                        <div className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchTransactions}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        // Show empty state if no transactions match filters
                        <div className="py-12 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No transactions match your filters'
                                    : 'No transactions found'}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                {transactions.length === 0
                                    ? 'Create your first transaction to see it here'
                                    : 'Try adjusting your search or filters'}
                            </p>
                            {(searchTerm || statusFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        // Show transactions list
                        <>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    Showing {filteredTransactions.length} of {transactions.length} transactions
                                </p>
                            </div>
                            <div className="space-y-4">
                                {filteredTransactions.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                        onClick={() => handleTransactionClick(transaction)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;