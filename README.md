Horizon International Bank - Secure Payment Portal
📋 Table of Contents

    Overview

    Features

    Tech Stack

    Security Features

    Project Structure

    Installation

    Configuration

    Running the Application

    API Documentation

    Security Best Practices

    Testing Guide

    Contributing

    License

🎯 Overview

Horizon International Bank Secure Payment Portal is a modern web application that enables customers to securely initiate international SWIFT payments. Built with enterprise-grade security standards, the platform ensures safe and reliable international money transfers for our global customers.
Key Objectives

    Secure Transactions: Implement multiple layers of security for international payments

    User-Friendly Interface: Provide intuitive payment initiation and tracking

    Real-Time Processing: Enable quick and efficient payment processing

    Compliance: Meet international banking security standards

    Audit Trail: Maintain comprehensive transaction records

✨ Features
💳 Payment Management

    SWIFT Payment Processing: Initiate international payments through SWIFT network

    Real-Time Transaction History: View complete payment history with status tracking

    Payment Search: Advanced search and filtering capabilities

    Auto-Complete: Intelligent recipient account number suggestions

    Multi-Currency Support: Process payments in various currencies (USD, EUR, GBP, etc.)

🔐 Authentication & Security

    Secure Registration: Password-protected account creation with strong validation

    Bcrypt Password Hashing: Industry-standard password encryption

    HTTPS/SSL Encryption: End-to-end encryption for all communications

    Session Management: Secure session handling with automatic timeout

    Input Validation: Comprehensive server-side and client-side validation

📊 User Dashboard

    Account Overview: Quick view of account details and recent activity

    Transaction Monitoring: Real-time payment status updates

    Profile Management: Secure personal information management

    Export Capabilities: Download transaction history for record keeping

🛡️ Security Features

    Rate Limiting: Protection against brute force attacks

    SQL Injection Prevention: Input sanitization and parameterized queries

    XSS Protection: Cross-site scripting prevention measures

    CSRF Protection: Cross-site request forgery mitigation

    Clickjacking Prevention: X-Frame-Options implementation

🛠 Tech Stack
Frontend

    React 18+: Modern UI library with hooks

    React Router v6: Client-side routing

    Axios: HTTP client with interceptors

    Tailwind CSS: Utility-first CSS framework

    Lucide React: Modern icon library

    HTTPS: Secure development server

Backend

    Node.js: JavaScript runtime

    Express.js: Web application framework

    Firebase Firestore: NoSQL database

    Firebase Admin SDK: Authentication and database management

    bcryptjs: Password hashing library

    Helmet.js: Security headers middleware

    express-rate-limit: Rate limiting middleware

    express-validator: Input validation middleware

Security & Deployment

    HTTPS/SSL: Self-signed certificates for development

    Environment Variables: Secure configuration management

    CORS: Cross-Origin Resource Sharing configuration

    Firebase Security Rules: Database security rules

🔒 Security Features
1. Authentication Security
Password Security

    Bcrypt Hashing: 12 rounds of salting for maximum security

    Password Peppering: Server-side secret added to passwords before hashing

    Strong Password Requirements:

        Minimum 8 characters

        At least 1 uppercase letter (A-Z)

        At least 1 lowercase letter (a-z)

        At least 1 number (0-9)

        At least 1 special character (@$!%*?&)

javascript

// Password Hashing Implementation
const PEPPER = process.env.PASSWORD_PEPPER;
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  const pepperedPassword = password + PEPPER;
  return await bcrypt.hash(pepperedPassword, SALT_ROUNDS);
}

Session Security

    JWT Tokens: Stateless authentication with Firebase

    HTTPS Encryption: All sessions encrypted in transit

    Automatic Expiration: Token regeneration on login

    Secure Storage: Tokens stored securely in client

2. Data Protection
Input Validation & Sanitization

    RegEx Whitelisting: All inputs validated using regular expressions

    Server-Side Validation: Comprehensive backend validation

    XSS Prevention: Input sanitization to remove script tags

    SQL Injection Protection: No raw SQL queries (Firestore)

javascript

// Input Validation Example
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

Validation Rules Table
Field	RegEx Pattern	Description
Full Name	/^[a-zA-Z\s]{2,100}$/	Letters and spaces only, 2-100 chars
ID Number	/^\d{13}$/	Exactly 13 digits
Account Number	/^[a-zA-Z0-9]{8,20}$/	Alphanumeric, 8-20 characters
SWIFT Code	/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/	8 or 11 characters
Amount	Float (0.01 - 1,000,000)	Positive number validation
3. API Security
Request Security

    HTTPS Only: All API calls encrypted with SSL/TLS

    CORS Configuration: Whitelisted origins only

    Rate Limiting: Protection against DDoS and brute force attacks

    Content Validation: Strict content-type checking

javascript

// Rate Limiting Configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

app.post('/api/auth/login', loginLimiter, loginController);

Rate Limiting Rules

    Login: 5 attempts per 15 minutes

    Registration: 3 attempts per hour

    Transactions: 20 per hour

    API Requests: 100 per 15 minutes

4. Database Security
Firebase Firestore Security

    NoSQL Database: No SQL injection vulnerabilities

    Security Rules: Role-based access control

    Encrypted Connections: TLS for all database communications

    Backup & Recovery: Automated database backups

Database Structure
text

users/ (collection)
  |-- {userId}/ (document)
      |-- fullName: string
      |-- idNumber: string
      |-- accountNumber: string
      |-- passwordHash: string
      |-- email: string
      |-- createdAt: timestamp
      |
      `-- transactions/ (subcollection)
          |-- {transactionId}/ (document)
              |-- senderAccount: string
              |-- recipientAccount: string
              |-- amount: number
              |-- currency: string
              |-- swiftCode: string
              |-- status: string
              `-- createdAt: timestamp

5. SSL/HTTPS Encryption
Configuration

    Frontend: HTTPS on port 3000

    Backend: HTTPS on port 5000

    Certificate: Self-signed for development, trusted CA for production

    Protocol: TLS 1.2+ encryption

javascript

// HTTPS Server Setup
const httpsOptions = {
  key: fs.readFileSync('./ssl/private-key.pem'),
  cert: fs.readFileSync('./ssl/certificate.pem')
};

https.createServer(httpsOptions, app).listen(5000, () => {
  console.log('HTTPS Server running on port 5000');
});

6. Attack Protection
SQL Injection Prevention

    No Raw SQL: Uses Firebase Firestore (NoSQL)

    Parameterized Queries: All queries use Firebase SDK

    Input Sanitization: Removes SQL keywords from inputs

XSS Prevention

    Input Sanitization: Removes <script> tags and event handlers

    React Protection: Built-in XSS protection in React

    Content Security Policy: CSP headers implementation

Session Hijacking Prevention

    HTTPS Encryption: Prevents token interception

    Token Expiration: Automatic token regeneration

    Secure Storage: Proper token storage practices

Clickjacking Prevention
javascript

// X-Frame-Options Header
app.use(helmet.frameguard({ action: 'sameorigin' }));

CSRF Prevention

    SameSite Cookies: sameSite: 'strict' configuration

    Token Authentication: JWT token-based authentication

    Origin Validation: Request origin verification

7. Error Handling & Logging
Secure Error Management

    Generic Error Messages: No system details exposed

    Server-Side Logging: Comprehensive error logging

    Audit Trail: Transaction and authentication logging

    Stack Trace Protection: Hide stack traces in production

javascript

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Server-side logging only
  
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

🚀 Installation
Prerequisites

    Node.js: v18.x or higher

    npm: v9.x or higher

    Firebase Account: For authentication and database

    OpenSSL: For generating SSL certificates

Step 1: Clone the Repository
bash

git clone https://github.com/Jessicamvita816/Horizon_Bank.git
cd horizon-bank-app

Step 2: Backend Setup
bash

cd backend
npm install

# Install dependencies
npm install express cors dotenv firebase-admin helmet \
express-rate-limit express-validator bcryptjs cookie-parser

# Install dev dependencies
npm install nodemon --save-dev

Step 3: Frontend Setup
bash

cd ../frontend
npm install

# Install React dependencies
npm install firebase react-router-dom axios lucide-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

Step 4: Generate SSL Certificates
bash

# Backend SSL
cd ../backend
mkdir ssl
cd ssl

# Generate private key
openssl genrsa -out private-key.pem 2048

# Generate certificate
openssl req -new -key private-key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey private-key.pem -out certificate.pem

# Copy to frontend
cd ../..
cd frontend
mkdir ssl
cp ../backend/ssl/certificate.pem ./ssl/
cp ../backend/ssl/private-key.pem ./ssl/

Certificate Information:

    Country Name: KE

    State: Nairobi

    Locality: Nairobi

    Organization: Horizon Bank

    Common Name: localhost

Step 5: Firebase Configuration

    Create Firebase Project:

        Go to Firebase Console

        Create project: horizon-banking

        Enable Authentication → Email/Password provider

        Create Firestore Database in production mode

    Download Service Account Key:

        Go to Project Settings → Service Accounts

        Generate New Private Key

        Save as serviceAccountKey.json in backend root

⚙️ Configuration
Backend Environment Variables

Create backend/.env file:
bash

# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=horizon-banking-439aa
FIREBASE_DATABASE_URL=https://horizon-banking-439aa-default-rtdb.firebaseio.com

# Security Keys (CHANGE IN PRODUCTION!)
PASSWORD_PEPPER=your_secret_pepper_key_minimum_32_characters
SESSION_SECRET=your_session_secret_key_minimum_32_characters

# CORS Configuration
FRONTEND_URL=https://localhost:3000
ALLOWED_ORIGINS=https://localhost:3000,http://localhost:3000

Frontend Environment Variables

Create frontend/.env.local for HTTPS:
bash

HTTPS=true
SSL_CRT_FILE=./ssl/certificate.pem
SSL_KEY_FILE=./ssl/private-key.pem
PORT=3000

🏃 Running the Application
Development Mode
1. Start Backend Server
bash

cd backend
npm start

# Expected output:
# ========================================
# HORIZON BANK API SERVER
# ========================================
# HTTPS Server: https://localhost:5000
# Health: https://localhost:5000/api/health
# ========================================
# Firebase Admin SDK initialized successfully

2. Start Frontend Development Server
bash

cd frontend
npm start

# Expected output:
# Compiled successfully!
# You can now view frontend in the browser.
#   Local:            https://localhost:3000
#   On Your Network:  https://192.168.x.x:3000

Accessing the Application

    Open web browser

    Navigate to https://localhost:3000

    Accept SSL certificate warning:

        Chrome/Edge: Click "Advanced" → "Proceed to localhost (unsafe)"

        Firefox: Click "Advanced" → "Accept the Risk and Continue"

    You should see the login page

Production Build
bash

# Build frontend
cd frontend
npm run build

# Start production backend
cd ../backend
NODE_ENV=production npm start

📚 API Documentation
Base URL
text

https://localhost:5000/api

Authentication Endpoints
Register User
http

POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "idNumber": "9001015800084",
  "accountNumber": "ACC12345678",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "uid": "firebase-user-id",
    "fullName": "John Doe",
    "accountNumber": "ACC12345678"
  }
}

Login User
http

POST /api/auth/login
Content-Type: application/json

{
  "accountNumber": "ACC12345678",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "token": "firebase-custom-token-here",
  "user": {
    "uid": "user-id",
    "fullName": "John Doe",
    "accountNumber": "ACC12345678"
  }
}

Get User Profile
http

GET /api/auth/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "user": {
    "fullName": "John Doe",
    "accountNumber": "ACC12345678",
    "email": "acc12345678@horizonbank.com",
    "createdAt": "2025-01-04T10:00:00.000Z"
  }
}

Transaction Endpoints
Create SWIFT Payment
http

POST /api/transactions/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1000.50,
  "currency": "USD",
  "swiftCode": "ABCDEF2A",
  "recipientAccount": "REC987654321",
  "recipientName": "Jane Smith",
  "provider": "SWIFT"
}

Response: 201 Created
{
  "success": true,
  "message": "Transaction completed",
  "transaction": {
    "id": "transaction-id",
    "amount": 1000.50,
    "currency": "USD",
    "status": "completed",
    "createdAt": "2025-01-04T10:30:00.000Z"
  }
}

Get Transaction History
http

GET /api/transactions/my-transactions
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "count": 5,
  "transactions": [
    {
      "id": "transaction-1",
      "senderAccount": "ACC12345678",
      "recipientName": "Jane Smith",
      "amount": 1000.50,
      "currency": "USD",
      "status": "completed",
      "createdAt": "2025-01-04T10:30:00.000Z"
    }
  ]
}

Error Responses
400 Bad Request
json

{
  "success": false,
  "message": "Validation error",
  "errors": {
    "fullName": "Name must contain only letters and spaces",
    "idNumber": "ID number must be exactly 13 digits"
  }
}

401 Unauthorized
json

{
  "success": false,
  "message": "Authentication required"
}

403 Forbidden
json

{
  "success": false,
  "message": "Invalid or expired token"
}

429 Too Many Requests
json

{
  "success": false,
  "message": "Too many login attempts. Please try again after 15 minutes."
}

500 Internal Server Error
json

{
  "success": false,
  "message": "Internal server error"
}

🔐 Security Best Practices
For Developers

    Environment Security
    bash

# Secrets not committed
echo ".env" >> .gitignore
echo "serviceAccountKey.json" >> .gitignore
echo "ssl/" >> .gitignore

Dependency Security
bash

# Regular security audits
npm audit
npm audit fix
npm update

HTTPS Enforcement
javascript

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

Security Headers
javascript

const helmet = require('helmet');
app.use(helmet());

    Input Validation

        Always validate on server-side

        Use whitelist approach with RegEx

        Sanitize all user inputs

For Production Deployment

    Certificate Management

        Use trusted CA certificates

        Implement certificate rotation

        Enable HSTS headers

    Database Security

        Enable Firebase security rules

        Regular backup procedures

        Access logging and monitoring

    Monitoring & Logging

        Implement comprehensive logging

        Set up security alerts

        Regular security audits

🧪 Testing Guide
Manual Testing Procedure
Test 1: User Registration

Test Case 1.1: Invalid Name Input

    Navigate to https://localhost:3000/register

    Enter name with numbers: "John123"

    Expected: Error message "Name must contain only letters and spaces"

Test Case 1.2: Invalid ID Number

    Enter ID number with letters: "ABC1234567890"

    Expected: Error message "ID number must be exactly 13 digits"

Test Case 1.3: Weak Password

    Enter password: "weak"

    Expected: Password strength indicator shows "weak" in red

    Expected: Error message about password requirements

Test 2: User Authentication

Test Case 2.1: Successful Login

    Navigate to https://localhost:3000/login

    Enter valid credentials

    Expected: Redirect to dashboard with welcome message

Test Case 2.2: Failed Login

    Enter invalid credentials

    Expected: Error message "Invalid account number or password"

    Expected: Rate limiting after 5 failed attempts

Test 3: Payment Processing

Test Case 3.1: Valid SWIFT Payment

    Navigate to New Transaction page

    Enter valid payment details

    Expected: Success message and transaction recorded

Test Case 3.2: Invalid SWIFT Code

    Enter invalid SWIFT code: "INVALID123"

    Expected: Validation error for SWIFT code format

Security Testing
Test 4: Security Features

Test Case 4.1: SQL Injection Attempt

    Enter SQL injection payload in any field

    Expected: Input rejected or sanitized

Test Case 4.2: XSS Attempt

    Enter script tags in input fields

    Expected: Script tags removed or input rejected

Test Case 4.3: Brute Force Protection

    Attempt multiple rapid logins

    Expected: Rate limiting activates after 5 attempts


Code Standards

    Follow JavaScript/React best practices

    Write comprehensive validation for all inputs

    Include security considerations in all features

    Document all security implementations

Security Review Process

All contributions undergo security review including:

    Code security audit

    Vulnerability assessment

    Penetration testing considerations

    Compliance verification
