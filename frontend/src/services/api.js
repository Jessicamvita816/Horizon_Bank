import axios from 'axios';
import { auth } from './firebase';

// Get the API base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:5000/api';

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Request interceptor to add authentication token to each request
api.interceptors.request.use(
    async (config) => {
        console.log('API Request:', config.method.toUpperCase(), config.url);
        console.log('Request Headers Before:', config.headers);
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Auth token added to request, UID:', user.uid);
            console.log('Request Headers After:', config.headers);
        } else {
            console.warn('No authenticated user found. Request will proceed without token.');
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle API responses and errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url, response.data);
        return response;
    },
    (error) => {
        console.error('API Error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            if (error.response.status === 401) {
                console.log('Unauthorized - logging instead of redirect for debug');
            }
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Authentication API endpoints
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    employeeLogin: async (credentials) => {
        const response = await api.post('/auth/employee-login', credentials);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },
    checkAuth: async () => {
        const response = await api.get('/auth/check');
        return response.data;
    }
};

// Transaction API endpoints
export const transactionAPI = {
    // Customer endpoints
    initiateTransaction: async (transactionData) => {
        const response = await api.post('/transactions/initiate', transactionData);
        return response.data;
    },
    getMyTransactions: async () => {
        const response = await api.get('/transactions/my-transactions');
        return response.data;
    },
    getTransactionById: async (transactionId) => {
        const response = await api.get(`/transactions/${transactionId}`);
        return response.data;
    },
    searchUsers: async (query) => {
        const response = await api.get(`/transactions/search-users?query=${encodeURIComponent(query)}`);
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/transactions/all-users');
        return response.data;
    },

    // Employee endpoints
    getPendingTransactions: async () => {
        const response = await api.get('/transactions/pending');
        return response.data;
    },
    getCompletedTransactions: async () => {
        const response = await api.get('/transactions/completed');
        return response.data;
    },
    getAllCustomers: async () => {
        const response = await api.get('/transactions/customers');
        return response.data;
    },
    verifyTransaction: async (transactionId) => {
        const response = await api.post(`/transactions/${transactionId}/verify`);
        return response.data;
    },
    rejectTransaction: async (transactionId, reason) => {
        const response = await api.post(`/transactions/${transactionId}/reject`, { reason });
        return response.data;
    },
    submitToSwift: async () => {
        const response = await api.post('/transactions/submit-to-swift');
        return response.data;
    }
};

export default api;