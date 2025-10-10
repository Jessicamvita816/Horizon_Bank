import React from 'react';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const TransactionCard = ({ transaction, onClick }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'approved':
            case 'submitted':
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-100"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        {transaction.recipientName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {transaction.recipientAccount}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    <div className="flex items-center space-x-1">
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{transaction.status}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                    <span className="font-mono text-sm">{transaction.swiftCode}</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.currency}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    {formatDate(transaction.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default TransactionCard;