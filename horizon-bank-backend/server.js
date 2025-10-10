const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { apiLimiter } = require('./middleware/rateLimiting');

const app = express();

// CORS must be first
const allowedOrigins = ['https://localhost:3000', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

// Handle preflight
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(204).end();
    }

    next();
});

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const sslKeyPath = './ssl/private-key.pem';
const sslCertPath = './ssl/certificate.pem';

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    https.createServer({
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
    }, app).listen(PORT, () => {
        console.log('========================================');
        console.log('HORIZON BANK API SERVER');
        console.log('========================================');
        console.log(`HTTPS Server: https://localhost:${PORT}`);
        console.log(`Health: https://localhost:${PORT}/api/health`);
        console.log('========================================');
    });
} else {
    console.error('SSL certificates not found!');
    process.exit(1);
}