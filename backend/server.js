// Éco Loop Backend Server - FIXED VERSION
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Éco Loop API is running!', 
        timestamp: new Date().toISOString(),
        status: 'healthy'
    });
});

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Éco Loop API',
        version: '1.0.0'
    });
});

// Import and use routes (only after creating the files)
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
} catch (err) {
    console.log('⚠️  Auth routes not found, skipping...');
}

try {
    const farmPlanRoutes = require('./routes/farmPlans');
    app.use('/api/farm-plans', farmPlanRoutes);
} catch (err) {
    console.log('⚠️  Farm plan routes not found, skipping...');
}

try {
    const taskRoutes = require('./routes/tasks');
    app.use('/api/tasks', taskRoutes);
} catch (err) {
    console.log('⚠️  Task routes not found, skipping...');
}

try {
    const formationRoutes = require('./routes/formations');
    app.use('/api/formations', formationRoutes);
} catch (err) {
    console.log('⚠️  Formation routes not found, skipping...');
}

try {
    const forumRoutes = require('./routes/forum');
    app.use('/api/forum', forumRoutes);
} catch (err) {
    console.log('⚠️  Forum routes not found, skipping...');
}

// 404 handler - FIXED: Use app.all instead of app.use
app.all('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            'GET /',
            'GET /api/health',
            'GET /api/auth',
            'GET /api/farm-plans',
            'GET /api/tasks',
            'GET /api/formations',
            'GET /api/forum'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
async function startServer() {
    try {
        // Connect to database
        await database.connect();
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Éco Loop API server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🏠 Home: http://localhost:${PORT}/`);
            console.log(`🗂️  Database: Connected to SQLite`);
            console.log(`⏰ Started at: ${new Date().toISOString()}`);
        });
    } catch (error) {
        console.error('💥 Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await database.close();
    process.exit(0);
});

// Start the server
startServer();