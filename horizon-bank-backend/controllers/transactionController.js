const { db } = require('../config/firebase');

/* ---------- CUSTOMER ---------- */
exports.initiateTransaction = async (req, res) => {
    try {
        const { amount, currency, swiftCode, recipientAccount, recipientName, provider } = req.body;
        const userId = req.user.uid;

        const userSnap = await db.collection('users').doc(userId).get();
        if (!userSnap.exists) return res.status(404).json({ success: false, message: 'User not found' });
        const user = userSnap.data();

        const transaction = {
            senderAccount: user.accountNumber,
            senderName: user.fullName,
            senderId: userId,
            recipientAccount,
            recipientName,
            amount: parseFloat(amount),
            currency,
            swiftCode: swiftCode.toUpperCase(),
            provider: provider || 'SWIFT',
            status: 'pending',
            createdAt: new Date().toISOString(),
            verified: false,
            verifiedBy: null,
            verifiedAt: null,
            submittedToSwift: false
        };

        // Store in global transactions collection for employees
        const transactionRef = await db.collection('transactions').add(transaction);

        // Also store in user's personal transaction history
        await db.collection('users')
            .doc(userId)
            .collection('transactions')
            .add({
                ...transaction,
                globalTransactionId: transactionRef.id
            });

        console.log(`Transaction created with ID: ${transactionRef.id}, Status: pending`);

        res.status(201).json({
            success: true,
            message: 'Transaction initiated and pending employee verification',
            transaction: { id: transactionRef.id, ...transaction }
        });

    } catch (err) {
        console.error('initiateTransaction error:', err);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const snap = await db.collection('users')
            .doc(req.user.uid)
            .collection('transactions')
            .orderBy('createdAt', 'desc')
            .get();

        const transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ success: true, count: transactions.length, transactions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.uid;

        const doc = await db.collection('users')
            .doc(userId)
            .collection('transactions')
            .doc(transactionId)
            .get();

        if (!doc.exists) return res.status(404).json({ success: false, message: 'Transaction not found' });

        res.json({ success: true, transaction: { id: doc.id, ...doc.data() } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch transaction' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) return res.json({ success: true, users: [] });

        const snap = await db.collection('users').get();
        const lower = query.toLowerCase();
        const users = [];

        snap.forEach(d => {
            const data = d.data();
            if (data.accountNumber.toLowerCase().includes(lower) ||
                data.fullName.toLowerCase().includes(lower)) {
                users.push({ fullName: data.fullName, accountNumber: data.accountNumber });
            }
        });

        res.json({ success: true, users: users.slice(0, 10) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const snap = await db.collection('users').get();
        const users = snap.docs.map(d => {
            const data = d.data();
            return { fullName: data.fullName, accountNumber: data.accountNumber };
        });
        res.json({ success: true, users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

/* ---------- EMPLOYEE (admin) ---------- */

// Get all pending transactions for employee review
exports.getPendingTransactions = async (req, res) => {
    try {
        const snap = await db.collection('transactions')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'asc')
            .get();

        const transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ success: true, transactions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch pending transactions' });
    }
};

// Get all completed transactions
exports.getCompletedTransactions = async (req, res) => {
    try {
        const snap = await db.collection('transactions')
            .where('status', '==', 'completed')
            .orderBy('createdAt', 'desc')
            .get();

        const transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ success: true, transactions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch completed transactions' });
    }
};

// Get all customers (non-employees)
exports.getAllCustomers = async (req, res) => {
    try {
        const snap = await db.collection('users').get();
        const customers = [];
        
        snap.forEach(doc => {
            const data = doc.data();
            // Only return customer data (non-employees)
            if (!data.isAdmin) {
                customers.push({ 
                    id: doc.id,
                    fullName: data.fullName, 
                    accountNumber: data.accountNumber,
                    email: data.email,
                    idNumber: data.idNumber,
                    createdAt: data.createdAt
                });
            }
        });
        
        res.json({ success: true, customers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch customers' });
    }
};

// Verify a pending transaction
exports.verifyTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const employeeId = req.user.uid;

        const transactionRef = db.collection('transactions').doc(transactionId);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const transaction = transactionDoc.data();

        if (transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction already processed' });
        }

        // Update transaction status to verified
        await transactionRef.update({
            status: 'verified',
            verified: true,
            verifiedBy: employeeId,
            verifiedAt: new Date().toISOString()
        });

        // Also update in user's transaction history
        const userTransactionSnapshot = await db
            .collection('users')
            .doc(transaction.senderId)
            .collection('transactions')
            .where('globalTransactionId', '==', transactionId)
            .get();

        if (!userTransactionSnapshot.empty) {
            const userTransactionDoc = userTransactionSnapshot.docs[0];
            await userTransactionDoc.ref.update({
                status: 'verified',
                verified: true,
                verifiedBy: employeeId,
                verifiedAt: new Date().toISOString()
            });
        }

        console.log(`Transaction ${transactionId} verified by employee ${employeeId}`);

        res.json({ 
            success: true, 
            message: 'Transaction verified successfully'
        });

    } catch (err) {
        console.error('Verify transaction error:', err);
        res.status(500).json({ success: false, message: 'Failed to verify transaction' });
    }
};

// Reject a pending transaction
exports.rejectTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const employeeId = req.user.uid;

        const transactionRef = db.collection('transactions').doc(transactionId);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const transaction = transactionDoc.data();

        if (transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction already processed' });
        }

        // Update transaction status to rejected
        await transactionRef.update({
            status: 'rejected',
            rejectedBy: employeeId,
            rejectedAt: new Date().toISOString(),
            rejectionReason: req.body.reason || 'No reason provided'
        });

        // Also update in user's transaction history
        const userTransactionSnapshot = await db
            .collection('users')
            .doc(transaction.senderId)
            .collection('transactions')
            .where('globalTransactionId', '==', transactionId)
            .get();

        if (!userTransactionSnapshot.empty) {
            const userTransactionDoc = userTransactionSnapshot.docs[0];
            await userTransactionDoc.ref.update({
                status: 'rejected',
                rejectedBy: employeeId,
                rejectedAt: new Date().toISOString(),
                rejectionReason: req.body.reason || 'No reason provided'
            });
        }

        console.log(`Transaction ${transactionId} rejected by employee ${employeeId}`);

        res.json({ 
            success: true, 
            message: 'Transaction rejected successfully'
        });

    } catch (err) {
        console.error('Reject transaction error:', err);
        res.status(500).json({ success: false, message: 'Failed to reject transaction' });
    }
};

// Submit verified transactions to SWIFT
exports.submitToSwift = async (req, res) => {
    try {
        const employeeId = req.user.uid;

        // Get all verified transactions
        const snapshot = await db
            .collection('transactions')
            .where('status', '==', 'verified')
            .get();

        if (snapshot.empty) {
            return res.status(400).json({ success: false, message: 'No verified transactions to submit' });
        }

        const batch = db.batch();
        const submittedTransactions = [];

        snapshot.forEach(doc => {
            const transactionRef = db.collection('transactions').doc(doc.id);
            batch.update(transactionRef, {
                status: 'completed',
                submittedToSwift: true,
                submittedBy: employeeId,
                submittedAt: new Date().toISOString(),
                swiftReference: `SWIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            });
            submittedTransactions.push(doc.id);
        });

        await batch.commit();

        // Also update in users' transaction histories
        for (const transactionId of submittedTransactions) {
            const transactionDoc = await db.collection('transactions').doc(transactionId).get();
            const transaction = transactionDoc.data();

            const userTransactionSnapshot = await db
                .collection('users')
                .doc(transaction.senderId)
                .collection('transactions')
                .where('globalTransactionId', '==', transactionId)
                .get();

            if (!userTransactionSnapshot.empty) {
                const userTransactionDoc = userTransactionSnapshot.docs[0];
                await userTransactionDoc.ref.update({
                    status: 'completed',
                    submittedToSwift: true,
                    submittedBy: employeeId,
                    submittedAt: new Date().toISOString(),
                    swiftReference: `SWIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                });
            }
        }

        console.log(`Submitted ${submittedTransactions.length} transactions to SWIFT by employee ${employeeId}`);

        res.json({ 
            success: true, 
            message: `${submittedTransactions.length} transactions submitted to SWIFT successfully`,
            submittedCount: submittedTransactions.length
        });

    } catch (err) {
        console.error('Submit to SWIFT error:', err);
        res.status(500).json({ success: false, message: 'Failed to submit transactions to SWIFT' });
    }
};