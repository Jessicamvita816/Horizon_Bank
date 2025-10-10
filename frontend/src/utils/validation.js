/**
 * Input Validation with RegEx patterns (Whitelisting)
 * Prevents SQL Injection, XSS, and other attacks
 */

// Full Name validation - Only letters and spaces
export const validateFullName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,100}$/;

    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Full name is required' };
    }

    if (!nameRegex.test(name)) {
        return { valid: false, error: 'Name must contain only letters and spaces' };
    }

    return { valid: true, error: null };
};

// ID Number validation - Exactly 13 digits
export const validateIdNumber = (idNumber) => {
    const idRegex = /^\d{13}$/;

    if (!idNumber || idNumber.trim().length === 0) {
        return { valid: false, error: 'ID number is required' };
    }

    if (!idRegex.test(idNumber)) {
        return { valid: false, error: 'ID number must be exactly 13 digits' };
    }

    return { valid: true, error: null };
};

// Account Number validation - 8-20 alphanumeric characters
export const validateAccountNumber = (accountNumber) => {
    const accountRegex = /^[a-zA-Z0-9]{8,20}$/;

    if (!accountNumber || accountNumber.trim().length === 0) {
        return { valid: false, error: 'Account number is required' };
    }

    if (!accountRegex.test(accountNumber)) {
        return { valid: false, error: 'Account number must be 8-20 alphanumeric characters' };
    }

    return { valid: true, error: null };
};

// Password validation - Strong password requirements
export const validatePassword = (password) => {
    if (!password || password.length === 0) {
        return { valid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }

    if (!/\d/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' };
    }

    if (!/[@$!%*?&]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character (@$!%*?&)' };
    }

    return { valid: true, error: null };
};

// Amount validation - Positive number between 0.01 and 1,000,000
export const validateAmount = (amount) => {
    const amountNum = parseFloat(amount);

    if (!amount || amount.toString().trim().length === 0) {
        return { valid: false, error: 'Amount is required' };
    }

    if (isNaN(amountNum)) {
        return { valid: false, error: 'Amount must be a valid number' };
    }

    if (amountNum < 0.01) {
        return { valid: false, error: 'Amount must be at least 0.01' };
    }

    if (amountNum > 1000000) {
        return { valid: false, error: 'Amount cannot exceed 1,000,000' };
    }

    return { valid: true, error: null };
};

// SWIFT Code validation - 8 or 11 characters (AAAAAABB or AAAAABBBCCC)
export const validateSwiftCode = (swiftCode) => {
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

    if (!swiftCode || swiftCode.trim().length === 0) {
        return { valid: false, error: 'SWIFT code is required' };
    }

    const upperSwift = swiftCode.toUpperCase();

    if (!swiftRegex.test(upperSwift)) {
        return { valid: false, error: 'Invalid SWIFT code format (e.g., ABCDEF2A or ABCDEF2AXXX)' };
    }

    return { valid: true, error: null };
};

// Recipient Account validation
export const validateRecipientAccount = (account) => {
    const accountRegex = /^[a-zA-Z0-9]{8,34}$/;

    if (!account || account.trim().length === 0) {
        return { valid: false, error: 'Recipient account number is required' };
    }

    if (!accountRegex.test(account)) {
        return { valid: false, error: 'Recipient account must be 8-34 alphanumeric characters' };
    }

    return { valid: true, error: null };
};

// Recipient Name validation
export const validateRecipientName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,100}$/;

    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Recipient name is required' };
    }

    if (!nameRegex.test(name)) {
        return { valid: false, error: 'Recipient name must contain only letters and spaces' };
    }

    return { valid: true, error: null };
};

// Currency validation
export const validateCurrency = (currency) => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'CNY'];

    if (!currency || currency.trim().length === 0) {
        return { valid: false, error: 'Currency is required' };
    }

    if (!validCurrencies.includes(currency.toUpperCase())) {
        return { valid: false, error: 'Invalid currency code' };
    }

    return { valid: true, error: null };
};

// Sanitize input - Remove potential malicious characters
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    // Remove SQL injection patterns
    let sanitized = input.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi, '');

    // Remove script tags (XSS prevention)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    return sanitized.trim();
};

// Password strength checker
export const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', color: 'red', percentage: 40 };
    if (strength <= 3) return { level: 'medium', color: 'yellow', percentage: 60 };
    return { level: 'strong', color: 'green', percentage: 100 };
};