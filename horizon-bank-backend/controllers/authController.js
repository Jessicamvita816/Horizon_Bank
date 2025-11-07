const { auth, db } = require('../config/firebase');
const { hashPassword, verifyPassword } = require('../utils/password');

exports.register = async (req, res) => {
    try {
        const { fullName, idNumber, accountNumber, password } = req.body;

        // Check duplicates
        const accountQuery = await db.collection('users')
            .where('accountNumber', '==', accountNumber)
            .get();

        if (!accountQuery.empty) {
            return res.status(400).json({
                success: false,
                message: 'Account number already exists'
            });
        }

        const idQuery = await db.collection('users')
            .where('idNumber', '==', idNumber)
            .get();

        if (!idQuery.empty) {
            return res.status(400).json({
                success: false,
                message: 'ID number already exists'
            });
        }

        // Create Firebase user
        const email = `${accountNumber}@horizonbank.com`;
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: fullName
        });

        // Hash password
        const passwordHash = await hashPassword(password);

        // Store in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            fullName,
            idNumber,
            accountNumber,
            passwordHash,
            email,
            isAdmin: false,
            createdAt: new Date().toISOString()
        });

        console.log(`User registered: ${accountNumber}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: { uid: userRecord.uid, fullName, accountNumber }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { accountNumber, password } = req.body;

        // Find user
        const userQuery = await db.collection('users')
            .where('accountNumber', '==', accountNumber)
            .limit(1)
            .get();

        if (userQuery.empty) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // Verify password
        const isValid = await verifyPassword(password, userData.passwordHash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create custom token
        const customToken = await auth.createCustomToken(userDoc.id);

        console.log(`User logged in: ${accountNumber}`);

        res.json({
            success: true,
            message: 'Login successful',
            token: customToken,
            user: {
                uid: userDoc.id,
                fullName: userData.fullName,
                accountNumber: userData.accountNumber
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

exports.employeeLogin = async (req, res) => {
    try {
        const { employeeId, password } = req.body;

        console.log(`Employee login attempt: ${employeeId}`);

        // Find employee by accountNumber starting with EMP
        const employeeQuery = await db.collection('users')
            .where('accountNumber', '==', employeeId.toUpperCase())
            .limit(1)
            .get();

        if (employeeQuery.empty) {
            return res.status(401).json({
                success: false,
                message: 'Invalid employee credentials'
            });
        }

        const employeeDoc = employeeQuery.docs[0];
        const employeeData = employeeDoc.data();

        // Check if user is actually an employee
        if (!employeeData.isAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Employee access required'
            });
        }

        // Verify password
        const isValid = await verifyPassword(password, employeeData.passwordHash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid employee credentials'
            });
        }

        // Create custom token
        const customToken = await auth.createCustomToken(employeeDoc.id);

        console.log(`Employee logged in: ${employeeData.accountNumber}`);

        res.json({
            success: true,
            message: 'Employee login successful',
            token: customToken,
            user: {
                uid: employeeDoc.id,
                fullName: employeeData.fullName,
                accountNumber: employeeData.accountNumber,
                email: employeeData.email,
                isAdmin: true,
                role: 'employee'
            }
        });

    } catch (error) {
        console.error('Employee login error:', error);
        res.status(500).json({
            success: false,
            message: 'Employee login failed'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userData = userDoc.data();
        delete userData.passwordHash;

        res.json({ success: true, user: userData });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

exports.logout = (req, res) => {
    res.json({ success: true, message: 'Logged out' });
};

exports.checkAuth = async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.json({ success: true, authenticated: false });
        }

        const userData = userDoc.data();

        res.json({
            success: true,
            authenticated: true,
            user: {
                uid: req.user.uid,
                fullName: userData.fullName,
                accountNumber: userData.accountNumber
            }
        });
    } catch (error) {
        res.json({ success: true, authenticated: false });
    }
};