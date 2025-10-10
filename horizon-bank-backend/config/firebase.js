const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
require('dotenv').config();

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// Firestore settings for better performance
db.settings({
    ignoreUndefinedProperties: true
});

module.exports = { admin, db, auth };