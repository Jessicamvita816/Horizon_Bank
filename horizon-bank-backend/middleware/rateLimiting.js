const rateLimit = require('express-rate-limit');

/**
 * Login rate limiter - Prevent brute force attacks
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`⚠️  Rate limit exceeded - Login attempts from IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again after 15 minutes.'
        });
    }
});

/**
 * Registration rate limiter - Prevent username harvesting
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: {
        success: false,
        message: 'Registration limit reached. Please try again in 1 hour.'
    },
    handler: (req, res) => {
        console.warn(`⚠️  Rate limit exceeded - Registration attempts from IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many registration attempts. Please try again later.'
        });
    }
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    },
    handler: (req, res) => {
        console.warn(`⚠️  Rate limit exceeded - API requests from IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Please try again later.'
        });
    }
});

/**
 * Transaction rate limiter - Prevent transaction abuse
 */
const transactionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 transactions per hour
    message: {
        success: false,
        message: 'Transaction limit reached for this hour.'
    },
    handler: (req, res) => {
        console.warn(`⚠️  Rate limit exceeded - Transaction attempts from IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Transaction limit reached. Please try again later.'
        });
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    apiLimiter,
    transactionLimiter
};