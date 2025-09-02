// Authentication Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../middleware/auth');
const database = require('../config/database');

const router = express.Router();

// Input validation helper
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, password, telephone } = req.body;
        
        // Validation
        if (!nom || !email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Nom, email et mot de passe sont requis',
                fields: { nom: !nom, email: !email, password: !password }
            });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Format d\'email invalide'
            });
        }
        
        if (!validatePassword(password)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }
        
        // Check if user already exists
        const existingUser = await database.get(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );
        
        if (existingUser) {
            return res.status(400).json({
                error: 'User exists',
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }
        
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const result = await database.run(
            `INSERT INTO users (nom, prenom, email, password, telephone, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nom, prenom || null, email.toLowerCase(), hashedPassword, telephone || null, 'farmer']
        );
        
        // Get the created user (without password)
        const newUser = await database.get(
            'SELECT id, nom, prenom, email, telephone, role, created_at FROM users WHERE id = ?',
            [result.id]
        );
        
        // Generate JWT token
        const token = generateToken(newUser);
        
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                user: newUser,
                token: token
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la création du compte'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email et mot de passe requis'
            });
        }
        
        // Find user by email
        const user = await database.get(
            'SELECT * FROM users WHERE email = ?',
            [email.toLowerCase()]
        );
        
        if (!user) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Email ou mot de passe incorrect'
            });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Email ou mot de passe incorrect'
            });
        }
        
        // Remove password from user object
        const { password: userPassword, ...userWithoutPassword } = user;
        
        // Generate JWT token
        const token = generateToken(userWithoutPassword);
        
        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: userWithoutPassword,
                token: token
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la connexion'
        });
    }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Profil récupéré avec succès',
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('❌ Profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération du profil'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { nom, prenom, telephone } = req.body;
        const userId = req.user.id;
        
        // Validation
        if (!nom) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Le nom est requis'
            });
        }
        
        // Update user
        await database.run(
            'UPDATE users SET nom = ?, prenom = ?, telephone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [nom, prenom || null, telephone || null, userId]
        );
        
        // Get updated user
        const updatedUser = await database.get(
            'SELECT id, nom, prenom, email, telephone, role, created_at, updated_at FROM users WHERE id = ?',
            [userId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                user: updatedUser
            }
        });
        
    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Mot de passe actuel et nouveau mot de passe requis'
            });
        }
        
        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
            });
        }
        
        // Get user with password
        const user = await database.get('SELECT password FROM users WHERE id = ?', [userId]);
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Mot de passe actuel incorrect'
            });
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password
        await database.run(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedNewPassword, userId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Mot de passe modifié avec succès'
        });
        
    } catch (error) {
        console.error('❌ Change password error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors du changement de mot de passe'
        });
    }
});

// @route   GET /api/auth/test
// @desc    Test route
// @access  Public
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes are working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;