const { auth, db } = require('../config/firebase');

console.log('Loading auth middleware. auth:', auth ? 'initialized' : 'not initialized');
console.log('Loading db middleware. db:', db ? 'initialized' : 'not initialized');

/**
 * Verify Firebase ID token from Authorization header
 */
async function verifyToken(req, res, next) {
    console.log('Verifying token. Raw Headers:', req.headers);
    try {
        const authHeader = req.headers.authorization;
        console.log('Authorization Header:', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid Authorization header found');
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization required.'
            });
        }

        const token = authHeader.split(' ')[1]; // Use space as separator, not 'Bearer '
        console.log('Extracted Token:', token.substring(0, 10) + '...');

        // Verify token with Firebase Admin
        console.log('Verifying token with Firebase Admin');
        const decodedToken = await auth.verifyIdToken(token);

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        console.log('Token verified. User:', req.user);

        next();
    } catch (error) {
        console.error('Token verification error:', error.code, error.message);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please log in again.'
            });
        }
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Authentication failed. Invalid token.'
        });
    }
}

/**
 * Check if user has admin/employee privileges
 */
async function isAdmin(req, res, next) {
    console.log('Checking admin privileges for user:', req.user?.uid);
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Get user document from Firestore
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const userData = userDoc.data();

        if (!userData.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin privileges required.'
            });
        }

        // Attach admin flag to request
        req.user.isAdmin = true;
        console.log('Admin privileges confirmed');
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed.'
        });
    }
}

module.exports = {
    verifyToken,
    isAdmin
};