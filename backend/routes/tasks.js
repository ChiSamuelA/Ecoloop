// Task Management API Routes
const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const database = require('../config/database');
const taskGenerator = require('../utils/taskGenerator');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/tasks/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// @route   POST /api/tasks/generate/:farmPlanId
// @desc    Generate tasks for a farm plan
// @access  Private
router.post('/generate/:farmPlanId', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.farmPlanId;
        const userId = req.user.id;
        
        // Check if farm plan exists and belongs to user
        const farmPlan = await database.get(
            'SELECT * FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        if (!farmPlan) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Plan d\'élevage non trouvé'
            });
        }
        
        // Check if tasks already exist
        const existingTasks = await database.get(
            'SELECT COUNT(*) as count FROM daily_tasks WHERE farm_plan_id = ?',
            [farmPlanId]
        );
        
        if (existingTasks.count > 0) {
            return res.status(400).json({
                error: 'Tasks exist',
                message: 'Les tâches ont déjà été générées pour ce plan'
            });
        }
        
        // Generate tasks
        const generatedTasks = await taskGenerator.generateTasksForFarmPlan(farmPlan);
        
        // Get task summary
        const taskSummary = await taskGenerator.getTasksForFarmPlan(farmPlanId);
        
        res.status(201).json({
            success: true,
            message: `${generatedTasks.length} tâches générées avec succès`,
            data: {
                generated_count: generatedTasks.length,
                task_summary: taskSummary
            }
        });
        
    } catch (error) {
        console.error('❌ Task generation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la génération des tâches'
        });
    }
});

// @route   GET /api/tasks/:farmPlanId
// @desc    Get all tasks for a farm plan
// @access  Private
router.get('/:farmPlanId', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.farmPlanId;
        const userId = req.user.id;
        
        // Verify farm plan ownership
        const farmPlan = await database.get(
            'SELECT id FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        if (!farmPlan) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Plan d\'élevage non trouvé'
            });
        }
        
        // Get tasks organized by day
        const tasksData = await taskGenerator.getTasksForFarmPlan(farmPlanId);
        
        // Get statistics
        const statistics = await taskGenerator.getTaskStatistics(farmPlanId);
        
        res.status(200).json({
            success: true,
            message: 'Tâches récupérées avec succès',
            data: {
                ...tasksData,
                statistics
            }
        });
        
    } catch (error) {
        console.error('❌ Get tasks error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des tâches'
        });
    }
});

// @route   GET /api/tasks/:farmPlanId/today
// @desc    Get today's tasks for a farm plan
// @access  Private
router.get('/:farmPlanId/today', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.farmPlanId;
        const userId = req.user.id;
        
        // Verify farm plan ownership
        const farmPlan = await database.get(
            'SELECT id, plan_name FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        if (!farmPlan) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Plan d\'élevage non trouvé'
            });
        }
        
        // Get today's tasks
        const todaysTasks = await taskGenerator.getTodaysTasks(farmPlanId);
        
        res.status(200).json({
            success: true,
            message: 'Tâches du jour récupérées avec succès',
            data: {
                farm_plan: farmPlan,
                date: new Date().toISOString().split('T')[0],
                tasks: todaysTasks,
                total_tasks: todaysTasks.length,
                completed_tasks: todaysTasks.filter(t => t.completed).length,
                pending_tasks: todaysTasks.filter(t => !t.completed).length,
                critical_tasks: todaysTasks.filter(t => t.is_critical).length
            }
        });
        
    } catch (error) {
        console.error('❌ Get today\'s tasks error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des tâches du jour'
        });
    }
});

// @route   GET /api/tasks/:farmPlanId/upcoming
// @desc    Get upcoming tasks (next 7 days)
// @access  Private
router.get('/:farmPlanId/upcoming', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.farmPlanId;
        const userId = req.user.id;
        
        // Verify farm plan ownership
        const farmPlan = await database.get(
            'SELECT id FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        if (!farmPlan) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Plan d\'élevage non trouvé'
            });
        }
        
        // Get upcoming tasks (next 7 days)
        const upcomingTasks = await database.all(`
            SELECT dt.*, tt.estimated_duration_minutes
            FROM daily_tasks dt
            LEFT JOIN task_templates tt ON dt.template_id = tt.id
            WHERE dt.farm_plan_id = ? 
            AND dt.scheduled_date BETWEEN DATE('now') AND DATE('now', '+7 days')
            AND dt.completed = 0
            ORDER BY dt.scheduled_date ASC, dt.is_critical DESC
        `, [farmPlanId]);
        
        res.status(200).json({
            success: true,
            message: 'Tâches à venir récupérées avec succès',
            data: {
                upcoming_tasks: upcomingTasks,
                count: upcomingTasks.length
            }
        });
        
    } catch (error) {
        console.error('❌ Get upcoming tasks error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des tâches à venir'
        });
    }
});

// @route   POST /api/tasks/:taskId/complete
// @desc    Mark a task as completed
// @access  Private
router.post('/:taskId/complete', verifyToken, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user.id;
        const { notes } = req.body;
        
        // Complete the task
        const completedTask = await taskGenerator.completeTask(taskId, userId, notes);
        
        res.status(200).json({
            success: true,
            message: 'Tâche marquée comme terminée',
            data: {
                task: completedTask
            }
        });
        
    } catch (error) {
        console.error('❌ Complete task error:', error);
        
        if (error.message === 'Task not found or access denied') {
            return res.status(404).json({
                error: 'Not found',
                message: 'Tâche non trouvée'
            });
        }
        
        if (error.message === 'Task already completed') {
            return res.status(400).json({
                error: 'Already completed',
                message: 'Tâche déjà terminée'
            });
        }
        
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la completion de la tâche'
        });
    }
});

// @route   POST /api/tasks/:taskId/photo
// @desc    Upload photo for a task
// @access  Private
router.post('/:taskId/photo', verifyToken, upload.single('photo'), async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({
                error: 'No file',
                message: 'Aucun fichier photo fourni'
            });
        }
        
        // Verify task belongs to user
        const task = await database.get(`
            SELECT dt.*, fp.user_id
            FROM daily_tasks dt
            JOIN farm_plans fp ON dt.farm_plan_id = fp.id
            WHERE dt.id = ? AND fp.user_id = ?
        `, [taskId, userId]);
        
        if (!task) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Tâche non trouvée'
            });
        }
        
        // Generate photo URL
        const photoUrl = `/uploads/tasks/${req.file.filename}`;
        
        // Update task with photo URL
        await database.run(
            'UPDATE daily_tasks SET photo_url = ? WHERE id = ?',
            [photoUrl, taskId]
        );
        
        // Get updated task
        const updatedTask = await database.get(
            'SELECT * FROM daily_tasks WHERE id = ?',
            [taskId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Photo ajoutée avec succès',
            data: {
                task: updatedTask,
                photo_url: photoUrl
            }
        });
        
    } catch (error) {
        console.error('❌ Photo upload error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de l\'upload de la photo'
        });
    }
});

// @route   PUT /api/tasks/:taskId
// @desc    Update task notes
// @access  Private
router.put('/:taskId', verifyToken, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user.id;
        const { notes } = req.body;
        
        // Verify task belongs to user
        const task = await database.get(`
            SELECT dt.*, fp.user_id
            FROM daily_tasks dt
            JOIN farm_plans fp ON dt.farm_plan_id = fp.id
            WHERE dt.id = ? AND fp.user_id = ?
        `, [taskId, userId]);
        
        if (!task) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Tâche non trouvée'
            });
        }
        
        // Update task notes
        await database.run(
            'UPDATE daily_tasks SET notes = ? WHERE id = ?',
            [notes, taskId]
        );
        
        // Get updated task
        const updatedTask = await database.get(
            'SELECT * FROM daily_tasks WHERE id = ?',
            [taskId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Tâche mise à jour avec succès',
            data: {
                task: updatedTask
            }
        });
        
    } catch (error) {
        console.error('❌ Update task error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la mise à jour de la tâche'
        });
    }
});

// @route   GET /api/tasks/:farmPlanId/statistics
// @desc    Get detailed task statistics
// @access  Private
router.get('/:farmPlanId/statistics', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.farmPlanId;
        const userId = req.user.id;
        
        // Verify farm plan ownership
        const farmPlan = await database.get(
            'SELECT id FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        if (!farmPlan) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Plan d\'élevage non trouvé'
            });
        }
        
        // Get detailed statistics
        const statistics = await taskGenerator.getTaskStatistics(farmPlanId);
        
        // Get category breakdown
        const categoryStats = await database.all(`
            SELECT 
                category,
                COUNT(*) as total,
                COUNT(CASE WHEN completed = 1 THEN 1 END) as completed
            FROM daily_tasks 
            WHERE farm_plan_id = ?
            GROUP BY category
        `, [farmPlanId]);
        
        res.status(200).json({
            success: true,
            message: 'Statistiques récupérées avec succès',
            data: {
                overall_statistics: statistics,
                category_breakdown: categoryStats
            }
        });
        
    } catch (error) {
        console.error('❌ Get statistics error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

module.exports = router;