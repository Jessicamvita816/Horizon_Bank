const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiting');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
    registerLimiter,
    validateRegistration,
    authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
    loginLimiter,
    validateLogin,
    authController.login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile',
    verifyToken,
    authController.getProfile
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
    verifyToken,
    authController.logout
);

/**
 * @route   GET /api/auth/check
 * @desc    Check if user is authenticated
 * @access  Private
 */
router.get('/check',
    verifyToken,
    authController.checkAuth
);

module.exports = router;