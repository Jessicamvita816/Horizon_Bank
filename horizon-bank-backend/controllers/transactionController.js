const { db } = require('../config/firebase');

exports.initiateTransaction = async (req, res) => {
    try {
        const { amount, currency, swiftCode, recipientAccount, recipientName, provider } = req.body;
        const userId = req.user.uid;

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userData = userDoc.data();

        const transaction = {
            senderAccount: userData.accountNumber,
            senderName: userData.fullName,
            recipientAccount,
            recipientName,
            amount: parseFloat(amount),
            currency,
            swiftCode: swiftCode.toUpperCase(),
            provider,
            status: 'completed',
            createdAt: new Date().toISOString()
        };

        const transactionRef = await db
            .collection('users')
            .doc(userId)
            .collection('transactions')
            .add(transaction);

        console.log(`Transaction created: ${transactionRef.id}`);

        res.status(201).json({
            success: true,
            message: 'Transaction completed',
            transaction: { id: transactionRef.id, ...transaction }
        });

    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.uid;

        const snapshot = await db
            .collection('users')
            .doc(userId)
            .collection('transactions')
            .get();

        const transactions = [];
        snapshot.forEach(doc => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log(`Fetched ${transactions.length} transactions for user`);

        res.json({ success: true, count: transactions.length, transactions });

    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            users.push({ fullName: data.fullName, accountNumber: data.accountNumber });
        });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json({ success: true, users: [] });
        }

        const snapshot = await db.collection('users').get();
        const users = [];
        const search = query.toLowerCase();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.accountNumber.toLowerCase().includes(search) ||
                data.fullName.toLowerCase().includes(search)) {
                users.push({ fullName: data.fullName, accountNumber: data.accountNumber });
            }
        });

        res.json({ success: true, users: users.slice(0, 10) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Search failed' });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.uid;

        const doc = await db
            .collection('users')
            .doc(userId)
            .collection('transactions')
            .doc(transactionId)
            .get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({ success: true, transaction: { id: doc.id, ...doc.data() } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch transaction' });
    }
};

exports.getPendingTransactions = (req, res) => {
    res.json({ success: true, transactions: [] });
};

exports.approveTransaction = (req, res) => {
    res.json({ success: true, message: 'Approved' });
};

exports.submitToSwift = (req, res) => {
    res.json({ success: true, message: 'Submitted' });
};