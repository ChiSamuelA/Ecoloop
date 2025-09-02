// JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const database = require('../config/database');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'ecoloop_secret_key_2024';

// Generate JWT Token
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        nom: user.nom,
        role: user.role
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: '7d' // Token expires in 7 days
    });
};

// Verify JWT Token Middleware
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'No token provided'
            });
        }
        
        // Extract token (format: "Bearer TOKEN")
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;
        
        if (!token) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'Invalid token format'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get fresh user data from database
        const user = await database.get(
            'SELECT id, nom, prenom, email, role, created_at FROM users WHERE id = ?',
            [decoded.id]
        );
        
        if (!user) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'User not found'
            });
        }
        
        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Access denied',
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Access denied',
                message: 'Token expired'
            });
        }
        
        return res.status(500).json({
            error: 'Server error',
            message: 'Token verification failed'
        });
    }
};

// Admin only middleware
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'Authentication required'
            });
        }
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Admin privileges required'
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            error: 'Server error',
            message: 'Authorization check failed'
        });
    }
};

module.exports = {
    generateToken,
    verifyToken,
    requireAdmin,
    JWT_SECRET
};