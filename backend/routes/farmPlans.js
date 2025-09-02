// Complete Farm Planning API Routes with Auto Task Generation
const express = require('express');
const { verifyToken } = require('../middleware/auth');
const database = require('../config/database');
const farmCalculator = require('../utils/farmCalculator');
const taskGenerator = require('../utils/taskGenerator');

const router = express.Router();

// Input validation helper
const validateFarmPlanInput = (data) => {
    const errors = [];
    
    if (!data.budget || data.budget <= 0) {
        errors.push('Budget doit être supérieur à 0');
    }
    
    if (!data.espace_m2 || data.espace_m2 <= 0) {
        errors.push('Espace doit être supérieur à 0 m²');
    }
    
    if (!data.experience_level || !['debutant', 'intermediaire', 'avance'].includes(data.experience_level)) {
        errors.push('Niveau d\'expérience invalide');
    }
    
    if (!data.duration_days || data.duration_days < 21 || data.duration_days > 60) {
        errors.push('Durée doit être entre 21 et 60 jours');
    }
    
    return errors;
};

// @route   POST /api/farm-plans/calculate
// @desc    Get farm recommendations without saving
// @access  Private
router.post('/calculate', verifyToken, async (req, res) => {
    try {
        const { budget, espace_m2, experience_level, duration_days } = req.body;
        
        // Validation
        const validationErrors = validateFarmPlanInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Données invalides',
                details: validationErrors
            });
        }
        
        // Calculate recommendations using our AI brain
        const recommendations = farmCalculator.calculateRecommendations({
            budget: parseFloat(budget),
            espace_m2: parseFloat(espace_m2),
            experience_level,
            duration_days: parseInt(duration_days)
        });
        
        if (!recommendations.success) {
            return res.status(400).json(recommendations);
        }
        
        res.status(200).json({
            success: true,
            message: 'Recommandations calculées avec succès',
            data: recommendations.data
        });
        
    } catch (error) {
        console.error('❌ Calculation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors du calcul des recommandations'
        });
    }
});

// @route   POST /api/farm-plans/create
// @desc    Create and save a farm plan with auto task generation
// @access  Private
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { 
            plan_name, 
            budget, 
            espace_m2, 
            experience_level, 
            duration_days,
            notes 
        } = req.body;
        
        const userId = req.user.id;
        
        // Validation
        if (!plan_name) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Nom du plan requis'
            });
        }
        
        const validationErrors = validateFarmPlanInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Données invalides',
                details: validationErrors
            });
        }
        
        // Calculate recommendations
        const recommendations = farmCalculator.calculateRecommendations({
            budget: parseFloat(budget),
            espace_m2: parseFloat(espace_m2),
            experience_level,
            duration_days: parseInt(duration_days)
        });
        
        if (!recommendations.success) {
            return res.status(400).json(recommendations);
        }
        
        const optimalChickens = recommendations.data.summary.nb_poulets_optimal;
        const startDate = new Date().toISOString().split('T')[0]; // Today
        const endDate = new Date(Date.now() + (duration_days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        // Save farm plan to database
        const result = await database.run(
            `INSERT INTO farm_plans (
                user_id, plan_name, budget, espace_m2, experience_level, 
                duration_days, nb_poulets_recommande, start_date, end_date, 
                status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, plan_name, budget, espace_m2, experience_level,
                duration_days, optimalChickens, startDate, endDate,
                'active', notes || null
            ]
        );
        
        // Get the created farm plan
        const farmPlan = await database.get(
            'SELECT * FROM farm_plans WHERE id = ?',
            [result.id]
        );
        
        // Auto-generate tasks for the farm plan
        let tasksGenerated = false;
        let taskCount = 0;
        try {
            const generatedTasks = await taskGenerator.generateTasksForFarmPlan(farmPlan);
            tasksGenerated = true;
            taskCount = generatedTasks.length;
            console.log(`✅ Auto-generated ${generatedTasks.length} tasks for farm plan ${farmPlan.id}`);
        } catch (taskError) {
            console.error('⚠️  Task generation failed, but farm plan created:', taskError.message);
            tasksGenerated = false;
        }
        
        res.status(201).json({
            success: true,
            message: 'Plan d\'élevage créé avec succès',
            data: {
                farm_plan: farmPlan,
                recommendations: recommendations.data,
                tasks_generated: tasksGenerated,
                tasks_count: taskCount
            }
        });
        
    } catch (error) {
        console.error('❌ Farm plan creation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la création du plan'
        });
    }
});

// @route   GET /api/farm-plans
// @desc    Get all farm plans for authenticated user
// @access  Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const farmPlans = await database.all(
            `SELECT 
                fp.*,
                COUNT(dt.id) as total_tasks,
                COUNT(CASE WHEN dt.completed = 1 THEN 1 END) as completed_tasks
             FROM farm_plans fp
             LEFT JOIN daily_tasks dt ON fp.id = dt.farm_plan_id
             WHERE fp.user_id = ?
             GROUP BY fp.id
             ORDER BY fp.created_at DESC`,
            [userId]
        );
        
        // Calculate progress percentage for each plan
        const enrichedPlans = farmPlans.map(plan => ({
            ...plan,
            progress_percentage: plan.total_tasks > 0 
                ? Math.round((plan.completed_tasks / plan.total_tasks) * 100)
                : 0
        }));
        
        res.status(200).json({
            success: true,
            message: 'Plans d\'élevage récupérés avec succès',
            data: {
                farm_plans: enrichedPlans,
                total_count: enrichedPlans.length
            }
        });
        
    } catch (error) {
        console.error('❌ Get farm plans error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération des plans'
        });
    }
});

// @route   GET /api/farm-plans/:id
// @desc    Get specific farm plan with details
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.id;
        const userId = req.user.id;
        
        // Get farm plan
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
        
        // Get task statistics
        const taskStats = await database.get(
            `SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN is_critical = 1 THEN 1 END) as critical_tasks,
                COUNT(CASE WHEN is_critical = 1 AND completed = 1 THEN 1 END) as completed_critical_tasks
             FROM daily_tasks 
             WHERE farm_plan_id = ?`,
            [farmPlanId]
        );
        
        // Calculate fresh recommendations for current plan
        const recommendations = farmCalculator.calculateRecommendations({
            budget: farmPlan.budget,
            espace_m2: farmPlan.espace_m2,
            experience_level: farmPlan.experience_level,
            duration_days: farmPlan.duration_days
        });
        
        res.status(200).json({
            success: true,
            message: 'Plan d\'élevage récupéré avec succès',
            data: {
                farm_plan: farmPlan,
                task_statistics: {
                    ...taskStats,
                    progress_percentage: taskStats.total_tasks > 0 
                        ? Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100)
                        : 0,
                    critical_progress_percentage: taskStats.critical_tasks > 0
                        ? Math.round((taskStats.completed_critical_tasks / taskStats.critical_tasks) * 100)
                        : 0
                },
                recommendations: recommendations.success ? recommendations.data : null
            }
        });
        
    } catch (error) {
        console.error('❌ Get farm plan error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la récupération du plan'
        });
    }
});

// @route   PUT /api/farm-plans/:id
// @desc    Update farm plan
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.id;
        const userId = req.user.id;
        const { plan_name, notes, status } = req.body;
        
        // Check if farm plan exists and belongs to user
        const existingPlan = await database.get(
            'SELECT * FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        if (!existingPlan) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Plan d\'élevage non trouvé'
            });
        }
        
        // Update farm plan
        await database.run(
            `UPDATE farm_plans 
             SET plan_name = ?, notes = ?, status = ?
             WHERE id = ? AND user_id = ?`,
            [
              plan_name || existingPlan.plan_name,
              (notes !== undefined ? notes : existingPlan.notes),
              status || existingPlan.status,
              farmPlanId,
              userId
            ]
        );          
        
        // Get updated farm plan
        const updatedPlan = await database.get(
            'SELECT * FROM farm_plans WHERE id = ?',
            [farmPlanId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Plan d\'élevage mis à jour avec succès',
            data: {
                farm_plan: updatedPlan
            }
        });
        
    } catch (error) {
        console.error('❌ Update farm plan error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la mise à jour du plan'
        });
    }
});

// @route   DELETE /api/farm-plans/:id
// @desc    Delete farm plan
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const farmPlanId = req.params.id;
        const userId = req.user.id;
        
        // Check if farm plan exists and belongs to user
        const existingPlan = await database.get(
            'SELECT * FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        if (!existingPlan) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Plan d\'élevage non trouvé'
            });
        }
        
        // Delete farm plan (will cascade delete related tasks due to foreign key)
        await database.run(
            'DELETE FROM farm_plans WHERE id = ? AND user_id = ?',
            [farmPlanId, userId]
        );
        
        res.status(200).json({
            success: true,
            message: 'Plan d\'élevage supprimé avec succès'
        });
        
    } catch (error) {
        console.error('❌ Delete farm plan error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Erreur lors de la suppression du plan'
        });
    }
});

module.exports = router;