# Horizon International Bank - Secure Payment Portal

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Security Best Practices](#security-best-practices)
- [Testing Guide](#testing-guide)

---

## Overview
Horizon International Bank Secure Payment Portal is a modern, enterprise-grade web application that enables customers to securely initiate international SWIFT payments. It provides a seamless, compliant, and highly secure platform for global money transfers.

### Key Objectives
- Secure transaction processing with end-to-end encryption
- Intuitive user interface for payment initiation and tracking
- Real-time transaction status updates
- Full compliance with international banking standards
- Complete audit trail and transaction logging

---

## Features

### Payment Management
- SWIFT international payment processing
- Real-time transaction history with status tracking
- Advanced search and filtering of transactions
- Recipient auto-complete with account validation
- Multi-currency support (USD, EUR, GBP, ZAR, JPY, CNY)

### Authentication & Security
- Secure user registration with strong password policies
- Bcrypt password hashing with server-side peppering
- HTTPS/SSL encryption for all communications
- Firebase Custom Token authentication
- Session management with automatic token rotation

### User Dashboard
- Account overview and recent activity
- Real-time payment status monitoring
- Secure profile management
- Transaction history export (CSV)

### New: Employee Portal (Admin)
- View all pending SWIFT transactions
- Approve or reject payments
- Submit approved transactions to SWIFT network
- Full audit trail of employee actions

---

## Tech Stack

### Frontend
- **React 18+** with Hooks
- **React Router v6** for navigation
- **Axios** with interceptors for API calls
- **Tailwind CSS** for styling
- **Lucide React** icons

### Backend
- **Node.js** runtime environment
- **Express.js** web framework
- **Firebase Admin SDK** for authentication
- **Firestore** (NoSQL) database
- **bcryptjs** for password hashing
- **Helmet.js** for security headers
- **express-rate-limit** for API protection
- **express-validator** for input validation

### Security & Deployment
- **HTTPS** with self-signed certificates (development)
- **CORS** with origin whitelisting
- Environment variable management
- Firebase Security Rules

---

## Security Features

### Authentication Security
- **Password Hashing**: Bcrypt (12 rounds) + server-side pepper
- **Strong Password Policy**:
  - Minimum 8 characters
  - 1 uppercase, 1 lowercase, 1 number, 1 special character
- **JWT via Firebase Custom Tokens**
- **HTTPS-only communication**

### Data Protection
- **Input Validation**: Client and server-side with RegEx whitelisting
- **XSS Prevention**: Input sanitization removes `<script>` tags and event handlers
- **SQL Injection Prevention**: NoSQL (Firestore) + parameterized queries
- **CSRF Protection**: Token-based auth + SameSite cookies

### API Security
- **Rate Limiting**:
  - Login: 5 attempts / 15 minutes
  - Registration: 3 attempts / hour
  - Transactions: 20 / hour
  - General API: 100 / 15 minutes
- **CORS**: Whitelisted origins only
- **Helmet.js**: Security headers (HSTS, X-Frame-Options, CSP)

### Database Security
- **Firestore Security Rules**: Role-based access control
- **Encrypted connections** (TLS)
- **No raw SQL** — eliminates injection risk

### SSL/HTTPS
- Self-signed certificates for development
- Enforced TLS 1.2+
- Production-ready certificate rotation support

### Attack Protection
- **Brute Force**: Rate limiting + account lockout simulation
- **Session Hijacking**: Token expiration + secure storage
- **Clickjacking**: `X-Frame-Options: SAMEORIGIN`

---

## Project Structure

```
horizon-international-bank/
├── client/                 # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── payments/
│   │   │   └── common/
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── rateLimit.js
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── server.js
├── certificates/          # SSL certificates
├── .env.example          # Environment variables template
├── README.md             # Project documentation
└── package.json          # Root package.json
```

### Key Directories Explained

#### Frontend (`/client`)
- **`/components/auth`**: Login, registration, and authentication components
- **`/components/dashboard`**: User dashboard and transaction overview
- **`/components/payments`**: Payment initiation, history, and management
- **`/components/common`**: Shared UI components (buttons, modals, forms)
- **`/contexts`**: React context for global state management
- **`/services`**: API communication layer with Axios

#### Backend (`/server`)
- **`/controllers`**: Business logic for each route
- **`/middleware`**: Authentication, validation, and security middleware
- **`/models`**: Data models and Firestore schema
- **`/routes`**: API endpoint definitions
- **`/utils`**: Helper functions and security utilities

---

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project with Firestore
- SSL certificates (for HTTPS)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/horizon-international-bank.git
   cd horizon-international-bank
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   
   # Install server dependencies  
   cd horizon-bank-backend && npm install && cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit with your Firebase credentials
   nano .env
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Generate Admin SDK private key
   - Update `.env` with your credentials

5. **SSL Certificate Setup** (Development)
   ```bash
   # Generate self-signed certificates
   openssl req -x509 -newkey rsa:4096 -keyout certificates/key.pem -out certificates/cert.pem -days 365
   ```

---

## Configuration

### Environment Variables

#### Server (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Security
PASSWORD_PEPPER=your-super-secret-pepper
JWT_SECRET=your-jwt-secret-key

# CORS
ALLOWED_ORIGINS=https://localhost:3000
```

#### Client Environment
Create `client/.env`:
```env
REACT_APP_API_URL=https://localhost:3001
REACT_APP_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"..."}
```

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Payments: users see their own, employees see all
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'employee');
      allow create: if request.auth != null;
    }
  }
}
```

---

## Running the Application

### Development Mode

1. **Start the Backend Server**
   ```bash
   cd horizon-bank-backend
   npm run dev
   ```
   Server will start on `https://localhost:3001`

2. **Start the Frontend Client**
   ```bash
   cd client
   npm start
   ```
   Client will start on `https://localhost:3000`

3. **Access the Application**
   - Main Application: `https://localhost:3000`
   - API Server: `https://localhost:3001`

### Production Build

```bash
# Build client
cd client && npm run build && cd ..

# Start production server
cd horizon-bank-backend && npm start
```

---

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "abc123"
}
```

#### POST `/api/auth/login`
Authenticate user and return Firebase token.

**Request Body:**
```json
{
  "email": "user@example.com", 
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "firebase-custom-token",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Payment Endpoints

#### POST `/api/payments/create`
Initiate a new SWIFT payment.

**Request Body:**
```json
{
  "recipientName": "Jane Smith",
  "recipientAccount": "GB29NWBK60161331926819",
  "recipientBank": "BARCLAYS BANK UK PLC",
  "amount": 1500.00,
  "currency": "USD",
  "purpose": "Business Payment"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_123456",
  "status": "pending",
  "swiftReference": "HZBNGB2LXXX123456789"
}
```

#### GET `/api/payments/history`
Retrieve user's payment history.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "payments": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}
```

### Employee Endpoints

#### GET `/api/employee/pending-payments`
Get all pending payments (employee only).

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "payments": [...],
  "totalPending": 12
}
```

#### POST `/api/employee/approve-payment`
Approve a pending payment.

**Request Body:**
```json
{
  "paymentId": "pay_123456",
  "action": "approve",
  "notes": "Payment approved after verification"
}
```

---

## Security Best Practices

### Password Security
```javascript
// Example password validation
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true, 
  requireNumbers: true,
  requireSpecialChars: true
};

// Password hashing with bcrypt and pepper
const hashPassword = async (password) => {
  const pepperedPassword = password + process.env.PASSWORD_PEPPER;
  return await bcrypt.hash(pepperedPassword, 12);
};
```

### Input Validation
```javascript
// Express validator rules
const validatePayment = [
  body('amount').isFloat({ min: 1, max: 1000000 }),
  body('currency').isIn(['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'CNY']),
  body('recipientAccount').matches(/^[A-Z0-9]{8,34}$/),
  body('purpose').isLength({ max: 140 })
];
```

### Rate Limiting Configuration
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});
```

---

## Testing Guide

### Running Tests

```bash
# Backend tests
cd horizon-bank-backend && npm test

# Frontend tests  
cd client && npm test

# End-to-end tests
npm run test:e2e
```

### Test Coverage Areas

#### Authentication Tests
- User registration with valid/invalid data
- Login success and failure cases
- Password strength validation
- Token expiration and refresh

#### Payment Tests
- SWIFT payment creation
- Input validation for payment data
- Transaction status updates
- Error handling for insufficient funds

#### Security Tests
- SQL injection attempts
- XSS payload detection
- Rate limiting enforcement
- Authorization checks

#### Integration Tests
- End-to-end payment flow
- Employee approval workflow
- Real-time status updates
- Error scenarios and recovery

### Manual Testing Checklist

#### Authentication Flow
- [ ] User registration with strong password
- [ ] Login with correct credentials
- [ ] Login failure with wrong password
- [ ] Session persistence
- [ ] Logout functionality

#### Payment Flow  
- [ ] Create new SWIFT payment
- [ ] Input validation for payment fields
- [ ] Payment status updates
- [ ] Transaction history display
- [ ] Search and filter functionality

#### Employee Portal
- [ ] View pending payments
- [ ] Approve/reject payments
- [ ] Audit trail recording
- [ ] Role-based access control

#### Security Testing
- [ ] HTTPS enforcement
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input sanitization
