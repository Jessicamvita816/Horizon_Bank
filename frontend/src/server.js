const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { apiLimiter } = require('./middleware/rateLimiting');

const app = express();

// CORS configuration
const allowedOrigins = [
    'https://localhost:3000',
    'http://localhost:3000'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
}));

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API routes
app.get('/api/health', (req, res) => {
    console.log('💚 Health check');
    res.json({
        success: true,
        message: 'Horizon Bank API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        cors: 'enabled'
    });
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
    console.log('❌ 404 Not Found:', req.path);
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// HTTPS server
const PORT = process.env.PORT || 5000;
const sslKeyPath = './ssl/private-key.pem';
const sslCertPath = './ssl/certificate.pem';

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log('===========================================');
        console.log('🔒 HORIZON BANK SECURE API SERVER');
        console.log('===========================================');
        console.log(`✅ HTTPS Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 URL: https://localhost:${PORT}`);
        console.log(`🏥 Health check: https://localhost:${PORT}/api/health`);
        console.log('===========================================');
        console.log('📋 Available Endpoints:');
        console.log('   POST   /api/auth/register');
        console.log('   POST   /api/auth/login');
        console.log('   GET    /api/auth/profile');
        console.log('   POST   /api/auth/logout');
        console.log('   GET    /api/auth/check');
        console.log('   POST   /api/transactions/initiate');
        console.log('   GET    /api/transactions/my-transactions');
        console.log('   GET    /api/transactions/pending (Admin)');
        console.log('   POST   /api/transactions/approve/:id (Admin)');
        console.log('   POST   /api/transactions/submit/:id (Admin)');
        console.log('   GET    /api/transactions/:id');
        console.log('===========================================');
        console.log(`🔐 CORS enabled for: ${allowedOrigins.join(', ')}`);
        console.log('===========================================');
    });
} else {
    console.error('❌ SSL certificates not found!');
    console.error('Generate certificates with:');
    console.error('  cd ssl');
    console.error('  openssl genrsa -out private-key.pem 2048');
    console.error('  openssl req -new -x509 -key private-key.pem -out certificate.pem -days 365');
    process.exit(1);
}

module.exports = app;