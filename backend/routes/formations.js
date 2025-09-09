// Formation/Training System API Routes
const express = require('express');
const { verifyToken } = require('../middleware/auth');
const database = require('../config/database');

const router = express.Router();

// @route   GET /api/formations
// @desc    Get all formations with user progress
// @access  Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.query;
        
        // Build query based on category filter
        let query = `
            SELECT 
                f.*,
                up.id as progress_id,
                up.started_at,
                up.completed_at,
                up.progress_percentage,
                up.quiz_score,
                CASE 
                    WHEN up.completed_at IS NOT NULL THEN 'completed'
                    WHEN up.started_at IS NOT NULL THEN 'in_progress'
                    ELSE 'not_started'
                END as status
            FROM formations f
            LEFT JOIN user_progress up ON f.id = up.formation_id AND up.user_id = ?
            WHERE f.is_active = 1
        `;
        
        let params = [userId];
        
        if (category) {
            query += ' AND f.categorie = ?';
            params.push(category);
        }
        
        query += ' ORDER BY f.ordre_affichage ASC, f.id ASC';
        
        const formations = await database.all(query, params);
        
        // Group by categories
        const categorizedFormations = {};
        formations.forEach(formation => {
            if (!categorizedFormations[formation.categorie]) {
                categorizedFormations[formation.categorie] = [];
            }
            categorizedFormations[formation.categorie].push(formation);
        });
        
        // Calculate overall progress
        const totalFormations = formations.length;
        const completedFormations = formations.filter(f => f.status === 'completed').length;
        const overallProgress = totalFormations > 0 
            ? Math.round((completedFormations / totalFormations) * 100)
            : 0;
        
        res.status(200).json({
            success: true,
            message: 'Formations récupérées avec succès',
            data: {
                formations: formations,
                formations_by_category: categorizedFormations,
                statistics: {
                    total_formations: totalFormations,
                    completed_formations: completedFormations,
                    in_progress: formations.filter(f => f.status === 'in_progress').length,
                    overall_progress_percentage: overallProgress
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Get formations error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des formations'
        });
    }
});

// @route   GET /api/formations/categories
// @desc    Get all formation categories
// @access  Private
router.get('/categories', verifyToken, async (req, res) => {
    try {
        const categories = await database.all(`
            SELECT 
                categorie,
                COUNT(*) as formation_count,
                AVG(duree_minutes) as avg_duration
            FROM formations 
            WHERE is_active = 1
            GROUP BY categorie
            ORDER BY categorie
        `);
        
        res.status(200).json({
            success: true,
            message: 'Catégories récupérées avec succès',
            data: {
                categories: categories
            }
        });
        
    } catch (error) {
        console.error('❌ Get categories error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des catégories'
        });
    }
});

// @route   GET /api/formations/:id
// @desc    Get specific formation with user progress
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const formationId = req.params.id;
        const userId = req.user.id;
        
        // Get formation with user progress
        const formation = await database.get(`
            SELECT 
                f.*,
                up.id as progress_id,
                up.started_at,
                up.completed_at,
                up.progress_percentage,
                up.quiz_score,
                up.notes,
                CASE 
                    WHEN up.completed_at IS NOT NULL THEN 'completed'
                    WHEN up.started_at IS NOT NULL THEN 'in_progress'
                    ELSE 'not_started'
                END as status
            FROM formations f
            LEFT JOIN user_progress up ON f.id = up.formation_id AND up.user_id = ?
            WHERE f.id = ? AND f.is_active = 1
        `, [userId, formationId]);
        
        if (!formation) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Formation non trouvée'
            });
        }
        
        // Get related formations in same category
        const relatedFormations = await database.all(`
            SELECT id, titre, duree_minutes
            FROM formations 
            WHERE categorie = ? AND id != ? AND is_active = 1
            ORDER BY ordre_affichage ASC
            LIMIT 5
        `, [formation.categorie, formationId]);
        
        res.status(200).json({
            success: true,
            message: 'Formation récupérée avec succès',
            data: {
                formation: formation,
                related_formations: relatedFormations
            }
        });
        
    } catch (error) {
        console.error('❌ Get formation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération de la formation'
        });
    }
});

// @route   POST /api/formations/:id/start
// @desc    Start a formation (mark as in progress)
// @access  Private
router.post('/:id/start', verifyToken, async (req, res) => {
    try {
        const formationId = req.params.id;
        const userId = req.user.id;
        
        // Check if formation exists
        const formation = await database.get(
            'SELECT * FROM formations WHERE id = ? AND is_active = 1',
            [formationId]
        );
        
        if (!formation) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Formation non trouvée'
            });
        }
        
        // Check if user already has progress for this formation
        const existingProgress = await database.get(
            'SELECT * FROM user_progress WHERE user_id = ? AND formation_id = ?',
            [userId, formationId]
        );
        
        if (existingProgress) {
            return res.status(400).json({
                error: 'Already started',
                message: 'Formation déjà commencée'
            });
        }
        
        // Create progress record
        const result = await database.run(`
            INSERT INTO user_progress (user_id, formation_id, started_at, progress_percentage)
            VALUES (?, ?, CURRENT_TIMESTAMP, 10)
        `, [userId, formationId]);
        
        // Get created progress
        const progress = await database.get(
            'SELECT * FROM user_progress WHERE id = ?',
            [result.id]
        );
        
        res.status(201).json({
            success: true,
            message: 'Formation commencée avec succès',
            data: {
                progress: progress
            }
        });
        
    } catch (error) {
        console.error('❌ Start formation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors du démarrage de la formation'
        });
    }
});

// @route   PUT /api/formations/:id/progress
// @desc    Update formation progress
// @access  Private
router.put('/:id/progress', verifyToken, async (req, res) => {
    try {
        const formationId = req.params.id;
        const userId = req.user.id;
        const { progress_percentage, notes } = req.body;
        
        // Validation
        if (progress_percentage < 0 || progress_percentage > 100) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Le pourcentage doit être entre 0 et 100'
            });
        }
        
        // Get existing progress
        const existingProgress = await database.get(
            'SELECT * FROM user_progress WHERE user_id = ? AND formation_id = ?',
            [userId, formationId]
        );
        
        if (!existingProgress) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Progression non trouvée. Commencez d\'abord la formation.'
            });
        }
        
        // Update progress
        await database.run(`
            UPDATE user_progress 
            SET progress_percentage = ?, notes = ?
            WHERE user_id = ? AND formation_id = ?
        `, [progress_percentage, notes || existingProgress.notes, userId, formationId]);
        
        // Get updated progress
        const updatedProgress = await database.get(
            'SELECT * FROM user_progress WHERE user_id = ? AND formation_id = ?',
            [userId, formationId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Progression mise à jour avec succès',
            data: {
                progress: updatedProgress
            }
        });
        
    } catch (error) {
        console.error('❌ Update progress error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la mise à jour de la progression'
        });
    }
});

// @route   POST /api/formations/:id/complete
// @desc    Complete a formation
// @access  Private
router.post('/:id/complete', verifyToken, async (req, res) => {
    try {
        const formationId = req.params.id;
        const userId = req.user.id;
        const { quiz_score, notes } = req.body;
        
        // Get existing progress
        const existingProgress = await database.get(
            'SELECT * FROM user_progress WHERE user_id = ? AND formation_id = ?',
            [userId, formationId]
        );
        
        if (!existingProgress) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Formation non commencée'
            });
        }
        
        if (existingProgress.completed_at) {
            return res.status(400).json({
                error: 'Already completed',
                message: 'Formation déjà terminée'
            });
        }
        
        // Mark as completed
        await database.run(`
            UPDATE user_progress 
            SET completed_at = CURRENT_TIMESTAMP, 
                progress_percentage = 100,
                quiz_score = ?,
                notes = ?
            WHERE user_id = ? AND formation_id = ?
        `, [quiz_score, notes || existingProgress.notes, userId, formationId]);
        
        // Get updated progress
        const completedProgress = await database.get(
            'SELECT * FROM user_progress WHERE user_id = ? AND formation_id = ?',
            [userId, formationId]
        );
        
        // Get formation details for response
        const formation = await database.get(
            'SELECT titre FROM formations WHERE id = ?',
            [formationId]
        );
        
        res.status(200).json({
            success: true,
            message: `Formation "${formation.titre}" terminée avec succès!`,
            data: {
                progress: completedProgress
            }
        });
        
    } catch (error) {
        console.error('❌ Complete formation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la completion de la formation'
        });
    }
});

// @route   GET /api/formations/user/progress
// @desc    Get user's overall learning progress
// @access  Private
router.get('/user/progress', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get overall statistics
        const overallStats = await database.get(`
            SELECT 
                COUNT(f.id) as total_formations,
                COUNT(up.id) as started_formations,
                COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) as completed_formations,
                AVG(CASE WHEN up.progress_percentage IS NOT NULL THEN up.progress_percentage ELSE 0 END) as avg_progress,
                AVG(CASE WHEN up.quiz_score IS NOT NULL THEN up.quiz_score END) as avg_quiz_score
            FROM formations f
            LEFT JOIN user_progress up ON f.id = up.formation_id AND up.user_id = ?
            WHERE f.is_active = 1
        `, [userId]);
        
        // Get progress by category
        const categoryProgress = await database.all(`
            SELECT 
                f.categorie,
                COUNT(f.id) as total_formations,
                COUNT(up.id) as started_formations,
                COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) as completed_formations,
                AVG(CASE WHEN up.progress_percentage IS NOT NULL THEN up.progress_percentage ELSE 0 END) as avg_progress
            FROM formations f
            LEFT JOIN user_progress up ON f.id = up.formation_id AND up.user_id = ?
            WHERE f.is_active = 1
            GROUP BY f.categorie
            ORDER BY f.categorie
        `, [userId]);
        
        // Get recent activity
        const recentActivity = await database.all(`
            SELECT 
                f.titre,
                f.categorie,
                up.started_at,
                up.completed_at,
                up.progress_percentage,
                up.quiz_score
            FROM user_progress up
            JOIN formations f ON up.formation_id = f.id
            WHERE up.user_id = ?
            ORDER BY 
                CASE 
                    WHEN up.completed_at IS NOT NULL THEN up.completed_at 
                    ELSE up.started_at 
                END DESC
            LIMIT 10
        `, [userId]);
        
        res.status(200).json({
            success: true,
            message: 'Progression utilisateur récupérée avec succès',
            data: {
                overall_statistics: overallStats,
                category_progress: categoryProgress,
                recent_activity: recentActivity
            }
        });
        
    } catch (error) {
        console.error('❌ Get user progress error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération de la progression'
        });
    }
});

// @route   GET /api/formations/:id/questions
// @desc    Get quiz questions for a specific formation
// @access  Private
router.get('/:id/questions', verifyToken, async (req, res) => {
    try {
        const formationId = req.params.id;
        
        // Check if formation exists
        const formation = await database.get(
            'SELECT id, titre FROM formations WHERE id = ? AND is_active = 1',
            [formationId]
        );
        
        if (!formation) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Formation not found'
            });
        }
        
        // Get quiz questions for this formation
        const questions = await database.all(`
            SELECT 
                id,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                explanation,
                order_number
            FROM quiz_questions 
            WHERE formation_id = ?
            ORDER BY order_number ASC
        `, [formationId]);
        
        if (questions.length === 0) {
            return res.status(404).json({
                error: 'No questions found',
                message: 'No quiz questions available for this formation'
            });
        }
        
        // Don't send correct_answer to frontend for security
        // Frontend will submit answers and backend will validate
        const questionsWithoutAnswers = questions.map(q => ({
            id: q.id,
            question: q.question,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            explanation: q.explanation,
            order_number: q.order_number
        }));
        
        res.status(200).json({
            success: true,
            message: 'Quiz questions retrieved successfully',
            data: {
                formation: {
                    id: formation.id,
                    title: formation.titre
                },
                questions: questionsWithoutAnswers,
                total_questions: questions.length
            }
        });
        
    } catch (error) {
        console.error('❌ Get quiz questions error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Error retrieving quiz questions'
        });
    }
});

// @route   POST /api/formations/:id/quiz
// @desc    Submit quiz answers and calculate score (UPDATED VERSION)
// @access  Private
router.post('/:id/quiz', verifyToken, async (req, res) => {
    try {
        const formationId = req.params.id;
        const userId = req.user.id;
        const { answers } = req.body; // answers should be array like ['A', 'B', 'C', 'A', 'B']
        
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Quiz answers required as array'
            });
        }
        
        // Get quiz questions with correct answers
        const questions = await database.all(`
            SELECT id, correct_answer, order_number
            FROM quiz_questions 
            WHERE formation_id = ?
            ORDER BY order_number ASC
        `, [formationId]);
        
        if (questions.length === 0) {
            return res.status(404).json({
                error: 'No questions found',
                message: 'No quiz questions available for this formation'
            });
        }
        
        if (answers.length !== questions.length) {
            return res.status(400).json({
                error: 'Validation error',
                message: `Expected ${questions.length} answers, got ${answers.length}`
            });
        }
        
        // Calculate score
        let correctAnswers = 0;
        questions.forEach((question, index) => {
            if (answers[index] && answers[index].toUpperCase() === question.correct_answer) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / questions.length) * 100);
        const passed = score >= 70;
        
        // Update user progress with quiz score
        await database.run(`
            UPDATE user_progress 
            SET quiz_score = ?
            WHERE user_id = ? AND formation_id = ?
        `, [score, userId, formationId]);
        
        res.status(200).json({
            success: true,
            message: passed ? 'Quiz passed!' : 'Quiz failed. Review the material and try again.',
            data: {
                quiz_score: score,
                total_questions: questions.length,
                correct_answers: correctAnswers,
                passed: passed,
                passing_score: 70
            }
        });
        
    } catch (error) {
        console.error('❌ Submit quiz error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Error submitting quiz'
        });
    }
});

module.exports = router;