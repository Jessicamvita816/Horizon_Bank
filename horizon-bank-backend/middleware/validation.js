const { body, validationResult } = require('express-validator');

/**
 * Sanitize input to prevent SQL injection and XSS
 */
const sanitizeInput = (value) => {
    if (!value) return value;

    // Remove SQL injection patterns
    const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi;

    // Remove script tags and event handlers (XSS prevention)
    const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|on\w+\s*=\s*["'][^"']*["']/gi;

    let sanitized = value.toString().replace(sqlPattern, '');
    sanitized = sanitized.replace(xssPattern, '');

    return sanitized.trim();
};

/**
 * Registration validation rules
 */
const validateRegistration = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces')
        .customSanitizer(sanitizeInput),

    body('idNumber')
        .trim()
        .notEmpty().withMessage('ID number is required')
        .isLength({ min: 13, max: 13 }).withMessage('ID number must be exactly 13 digits')
        .isNumeric().withMessage('ID number must contain only digits')
        .customSanitizer(sanitizeInput),

    body('accountNumber')
        .trim()
        .notEmpty().withMessage('Account number is required')
        .isLength({ min: 8, max: 20 }).withMessage('Account number must be 8-20 characters')
        .isAlphanumeric().withMessage('Account number must be alphanumeric')
        .customSanitizer(sanitizeInput),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain: uppercase, lowercase, number, and special character (@$!%*?&)'),

    // Check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

/**
 * Login validation rules
 */
const validateLogin = [
    body('accountNumber')
        .trim()
        .notEmpty().withMessage('Account number is required')
        .customSanitizer(sanitizeInput),

    body('password')
        .notEmpty().withMessage('Password is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

/**
 * Transaction validation rules
 */
const validateTransaction = [
    body('amount')
        .isFloat({ min: 0.01, max: 1000000 })
        .withMessage('Amount must be between 0.01 and 1,000,000'),

    body('currency')
        .isIn(['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'CNY'])
        .withMessage('Invalid currency code'),

    body('swiftCode')
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
        .withMessage('Invalid SWIFT code format (e.g., ABCDEF2A or ABCDEF2AXXX)')
        .customSanitizer(value => value.toUpperCase()),

    body('recipientAccount')
        .trim()
        .isLength({ min: 8, max: 34 })
        .withMessage('Recipient account must be 8-34 characters')
        .customSanitizer(sanitizeInput),

    body('recipientName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Recipient name must contain only letters and spaces')
        .customSanitizer(sanitizeInput),

    body('provider')
        .equals('SWIFT')
        .withMessage('Only SWIFT provider is supported'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateTransaction
};