const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validateTransaction } = require('../middleware/validation');
const { transactionLimiter } = require('../middleware/rateLimiting');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Route to create a new international payment transaction
// Requires authentication and validates all input fields
// Rate limited to prevent abuse
router.post('/initiate',
    verifyToken,
    transactionLimiter,
    validateTransaction,
    transactionController.initiateTransaction
);

// Get all transactions for the logged-in user
// Returns transactions in descending order (newest first)
router.get('/my-transactions',
    verifyToken,
    transactionController.getUserTransactions
);

// Search for users by account number or name
// Used for autocomplete functionality when selecting recipients
router.get('/search-users',
    verifyToken,
    transactionController.searchUsers
);

// Get complete list of all users
// Used to populate the autocomplete dropdown
router.get('/all-users',
    verifyToken,
    transactionController.getAllUsers
);

// Get details of a specific transaction by ID
// User must own the transaction or be an admin
router.get('/:transactionId',
    verifyToken,
    transactionController.getTransactionById
);

// Admin-only routes for Task 3 (Employee Portal)
// These will be fully implemented later

// Get all transactions awaiting employee approval
router.get('/pending',
    verifyToken,
    isAdmin,
    transactionController.getPendingTransactions
);

// Approve a pending transaction
router.post('/approve/:transactionId',
    verifyToken,
    isAdmin,
    transactionController.approveTransaction
);

// Submit an approved transaction to SWIFT network
router.post('/submit/:transactionId',
    verifyToken,
    isAdmin,
    transactionController.submitToSwift
);

module.exports = router;