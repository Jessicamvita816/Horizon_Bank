const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validateTransaction } = require('../middleware/validation');
const { transactionLimiter } = require('../middleware/rateLimiting');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Route to create a new international payment transaction
router.post('/initiate',
    verifyToken,
    transactionLimiter,
    validateTransaction,
    transactionController.initiateTransaction
);

// Get all transactions for the logged-in user
router.get('/my-transactions',
    verifyToken,
    transactionController.getUserTransactions
);

// Search for users by account number or name
router.get('/search-users',
    verifyToken,
    transactionController.searchUsers
);

// Get complete list of all users
router.get('/all-users',
    verifyToken,
    transactionController.getAllUsers
);

// Get all pending transactions for employee review
router.get('/pending',
    verifyToken,
    isAdmin,
    transactionController.getPendingTransactions
);

// Get all completed transactions
router.get('/completed',
    verifyToken,
    isAdmin,
    transactionController.getCompletedTransactions
);

// Get all customers
router.get('/customers',
    verifyToken,
    isAdmin,
    transactionController.getAllCustomers
);

// Submit verified transactions to SWIFT
router.post('/submit-to-swift',
    verifyToken,
    isAdmin,
    transactionController.submitToSwift
);

// Verify a pending transaction
router.post('/:transactionId/verify',
    verifyToken,
    isAdmin,
    transactionController.verifyTransaction
);

// Reject a pending transaction
router.post('/:transactionId/reject',
    verifyToken,
    isAdmin,
    transactionController.rejectTransaction
);

//Get details of a specific transaction by ID
router.get('/:transactionId',
    verifyToken,
    transactionController.getTransactionById
);

module.exports = router;