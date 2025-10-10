const bcrypt = require('bcryptjs');
require('dotenv').config();

const PEPPER = process.env.PASSWORD_PEPPER;
const SALT_ROUNDS = 12;

/**
 * Hash password with bcrypt + pepper
 * Bcrypt automatically handles salting
 * Pepper adds an extra layer stored in environment
 */
async function hashPassword(password) {
    try {
        if (!password) {
            throw new Error('Password is required');
        }

        if (!PEPPER) {
            throw new Error('PASSWORD_PEPPER not configured in environment');
        }

        // Add pepper to password (server-side secret)
        const pepperedPassword = password + PEPPER;

        // Hash with bcrypt (includes automatic salting)
        const hashedPassword = await bcrypt.hash(pepperedPassword, SALT_ROUNDS);

        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error.message);
        throw new Error('Password hashing failed');
    }
}

/**
 * Verify password against stored hash
 */
async function verifyPassword(password, hashedPassword) {
    try {
        if (!password || !hashedPassword) {
            return false;
        }

        if (!PEPPER) {
            throw new Error('PASSWORD_PEPPER not configured');
        }

        // Add pepper to input password
        const pepperedPassword = password + PEPPER;

        // Compare with bcrypt
        const isMatch = await bcrypt.compare(pepperedPassword, hashedPassword);

        return isMatch;
    } catch (error) {
        console.error('Error verifying password:', error.message);
        return false;
    }
}

module.exports = {
    hashPassword,
    verifyPassword
};