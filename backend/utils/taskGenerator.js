// Dynamic Task Generation System
// Creates personalized daily task calendars based on farm plans
const database = require('../config/database');

class TaskGenerator {
    constructor() {
        // Experience level adjustments
        this.experienceAdjustments = {
            'debutant': {
                additionalTasks: true,
                detailedDescriptions: true,
                safetyReminders: true,
                frequencyMultiplier: 1.2  // 20% more frequent checks
            },
            'intermediaire': {
                additionalTasks: false,
                detailedDescriptions: true,
                safetyReminders: false,
                frequencyMultiplier: 1.0  // Standard frequency
            },
            'avance': {
                additionalTasks: false,
                detailedDescriptions: false,
                safetyReminders: false,
                frequencyMultiplier: 0.8  // 20% less frequent checks
            }
        };
    }

    /**
     * Generate complete task calendar for a farm plan
     * @param {Object} farmPlan - The farm plan object
     * @returns {Array} Array of generated tasks
     */
    async generateTasksForFarmPlan(farmPlan) {
        try {
            const { id: farmPlanId, duration_days, experience_level, start_date, nb_poulets_recommande } = farmPlan;
            
            // Determine cycle type and get task templates
            const cycleType = this.determineCycleType(duration_days);
            const taskTemplates = await this.getTaskTemplates(cycleType, experience_level);
            
            if (!taskTemplates || taskTemplates.length === 0) {
                throw new Error('No task templates found for cycle type: ' + cycleType);
            }
            
            // Generate personalized tasks
            const personalizedTasks = this.personalizeTasksForUser(
                taskTemplates, 
                experience_level,
                nb_poulets_recommande
            );
            
            // Create scheduled tasks with dates
            const scheduledTasks = this.createScheduledTasks(
                personalizedTasks,
                start_date,
                duration_days,
                farmPlanId
            );
            
            // Save tasks to database
            const savedTasks = await this.saveTasksToDatabase(scheduledTasks);
            
            console.log(`✅ Generated ${savedTasks.length} tasks for farm plan ${farmPlanId}`);
            return savedTasks;
            
        } catch (error) {
            console.error('❌ Task generation error:', error);
            throw error;
        }
    }

    /**
     * Determine cycle type from duration
     */
    determineCycleType(durationDays) {
        if (durationDays <= 21) return '21_days';
        if (durationDays <= 30) return '30_days';
        return '45_days';
    }

    /**
     * Get task templates from database
     */
    async getTaskTemplates(cycleType, experienceLevel) {
        try {
            // Get base templates for cycle type
            let query = `
                SELECT * FROM task_templates 
                WHERE duration_type = ?
                AND (experience_level IS NULL OR experience_level = ?)
                ORDER BY day_number ASC, is_critical DESC
            `;
            
            const templates = await database.all(query, [cycleType, experienceLevel]);
            
            // If specific templates not found, get general ones
            if (templates.length === 0) {
                query = `
                    SELECT * FROM task_templates 
                    WHERE duration_type = ?
                    AND experience_level IS NULL
                    ORDER BY day_number ASC, is_critical DESC
                `;
                return await database.all(query, [cycleType]);
            }
            
            return templates;
        } catch (error) {
            console.error('❌ Error getting task templates:', error);
            throw error;
        }
    }

    /**
     * Personalize tasks based on user experience and farm size
     */
    personalizeTasksForUser(templates, experienceLevel, nbChickens) {
        const adjustments = this.experienceAdjustments[experienceLevel];
        const personalizedTasks = [];
        
        templates.forEach(template => {
            const personalizedTask = {
                ...template,
                task_description: this.adjustTaskDescription(
                    template.task_description, 
                    experienceLevel,
                    nbChickens
                )
            };
            
            // Add beginner-specific additional checks
            if (adjustments.additionalTasks && template.is_critical) {
                personalizedTasks.push(personalizedTask);
                
                // Add extra monitoring task for beginners on critical days
                if (template.category === 'surveillance' && template.day_number <= 7) {
                    const extraTask = {
                        ...template,
                        id: null, // Will be auto-generated
                        task_title: `Double vérification - ${template.task_title}`,
                        task_description: `Vérification supplémentaire recommandée pour débutants: ${template.task_description}`,
                        is_critical: false
                    };
                    personalizedTasks.push(extraTask);
                }
            } else {
                personalizedTasks.push(personalizedTask);
            }
        });
        
        return personalizedTasks;
    }

    /**
     * Adjust task descriptions based on experience and farm size
     */
    adjustTaskDescription(description, experienceLevel, nbChickens) {
        if (!description) return description;
        
        let adjustedDescription = description;
        
        // Add specific numbers for farm size
        if (nbChickens) {
            adjustedDescription = adjustedDescription.replace(
                /poulets?/gi, 
                `${nbChickens} poulets`
            );
        }
        
        // Add extra details for beginners
        if (experienceLevel === 'debutant') {
            const beginnerTips = {
                'température': '💡 Conseil: Utilisez un thermomètre fiable et vérifiez plusieurs zones du poulailler.',
                'alimentation': '💡 Conseil: Distribuez la nourriture de manière uniforme pour éviter la compétition.',
                'nettoyage': '💡 Conseil: Portez des gants et désinfectez vos mains après manipulation.',
                'vaccination': '💡 Conseil: Respectez scrupuleusement les doses et consultez un vétérinaire si nécessaire.'
            };
            
            Object.keys(beginnerTips).forEach(keyword => {
                if (adjustedDescription.toLowerCase().includes(keyword)) {
                    adjustedDescription += `\n\n${beginnerTips[keyword]}`;
                }
            });
        }
        
        return adjustedDescription;
    }

    /**
     * Create scheduled tasks with specific dates
     */
    createScheduledTasks(personalizedTasks, startDate, durationDays, farmPlanId) {
        const scheduledTasks = [];
        const startDateTime = new Date(startDate);
        
        personalizedTasks.forEach(template => {
            // Calculate task date
            const taskDate = new Date(startDateTime);
            taskDate.setDate(startDateTime.getDate() + (template.day_number - 1));
            
            // Skip tasks beyond the planned duration
            if (template.day_number > durationDays) {
                return;
            }
            
            const scheduledTask = {
                farm_plan_id: farmPlanId,
                template_id: template.id,
                day_number: template.day_number,
                scheduled_date: taskDate.toISOString().split('T')[0], // YYYY-MM-DD format
                task_title: template.task_title,
                task_description: template.task_description,
                category: template.category,
                is_critical: template.is_critical || false,
                completed: false,
                completion_date: null,
                photo_url: null,
                notes: null
            };
            
            scheduledTasks.push(scheduledTask);
        });
        
        return scheduledTasks.sort((a, b) => a.day_number - b.day_number);
    }

    /**
     * Save generated tasks to database
     */
    async saveTasksToDatabase(scheduledTasks) {
        try {
            const savedTasks = [];
            
            for (const task of scheduledTasks) {
                const result = await database.run(`
                    INSERT INTO daily_tasks (
                        farm_plan_id, template_id, day_number, scheduled_date,
                        task_title, task_description, category, is_critical,
                        completed, completion_date, photo_url, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    task.farm_plan_id, task.template_id, task.day_number, task.scheduled_date,
                    task.task_title, task.task_description, task.category, task.is_critical,
                    task.completed, task.completion_date, task.photo_url, task.notes
                ]);
                
                savedTasks.push({
                    id: result.id,
                    ...task
                });
            }
            
            return savedTasks;
        } catch (error) {
            console.error('❌ Error saving tasks to database:', error);
            throw error;
        }
    }

    /**
     * Get tasks for a specific farm plan
     */
    async getTasksForFarmPlan(farmPlanId) {
        try {
            const tasks = await database.all(`
                SELECT dt.*, tt.estimated_duration_minutes
                FROM daily_tasks dt
                LEFT JOIN task_templates tt ON dt.template_id = tt.id
                WHERE dt.farm_plan_id = ?
                ORDER BY dt.day_number ASC, dt.is_critical DESC
            `, [farmPlanId]);
            
            // Group tasks by day
            const tasksByDay = {};
            tasks.forEach(task => {
                if (!tasksByDay[task.day_number]) {
                    tasksByDay[task.day_number] = {
                        day: task.day_number,
                        date: task.scheduled_date,
                        tasks: []
                    };
                }
                tasksByDay[task.day_number].tasks.push(task);
            });
            
            return {
                total_tasks: tasks.length,
                completed_tasks: tasks.filter(t => t.completed).length,
                critical_tasks: tasks.filter(t => t.is_critical).length,
                upcoming_tasks: tasks.filter(t => !t.completed && new Date(t.scheduled_date) >= new Date()).length,
                tasks_by_day: Object.values(tasksByDay)
            };
        } catch (error) {
            console.error('❌ Error getting tasks for farm plan:', error);
            throw error;
        }
    }

    /**
     * Get today's tasks for a farm plan
     */
    async getTodaysTasks(farmPlanId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const tasks = await database.all(`
                SELECT dt.*, tt.estimated_duration_minutes
                FROM daily_tasks dt
                LEFT JOIN task_templates tt ON dt.template_id = tt.id
                WHERE dt.farm_plan_id = ? AND dt.scheduled_date = ?
                ORDER BY dt.is_critical DESC, dt.id ASC
            `, [farmPlanId, today]);
            
            return tasks;
        } catch (error) {
            console.error('❌ Error getting today\'s tasks:', error);
            throw error;
        }
    }

    /**
     * Mark task as completed
     */
    async completeTask(taskId, userId, notes = null, photoUrl = null) {
        try {
            // Verify task belongs to user's farm plan
            const task = await database.get(`
                SELECT dt.*, fp.user_id
                FROM daily_tasks dt
                JOIN farm_plans fp ON dt.farm_plan_id = fp.id
                WHERE dt.id = ? AND fp.user_id = ?
            `, [taskId, userId]);
            
            if (!task) {
                throw new Error('Task not found or access denied');
            }
            
            if (task.completed) {
                throw new Error('Task already completed');
            }
            
            // Update task as completed
            await database.run(`
                UPDATE daily_tasks 
                SET completed = 1, 
                    completion_date = CURRENT_TIMESTAMP,
                    notes = ?,
                    photo_url = ?
                WHERE id = ?
            `, [notes, photoUrl, taskId]);
            
            // Get updated task
            const updatedTask = await database.get(
                'SELECT * FROM daily_tasks WHERE id = ?',
                [taskId]
            );
            
            return updatedTask;
        } catch (error) {
            console.error('❌ Error completing task:', error);
            throw error;
        }
    }

    /**
     * Get task statistics for a farm plan
     */
    async getTaskStatistics(farmPlanId) {
        try {
            const stats = await database.get(`
                SELECT 
                    COUNT(*) as total_tasks,
                    COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_tasks,
                    COUNT(CASE WHEN is_critical = 1 THEN 1 END) as critical_tasks,
                    COUNT(CASE WHEN is_critical = 1 AND completed = 1 THEN 1 END) as completed_critical_tasks,
                    COUNT(CASE WHEN scheduled_date < DATE('now') AND completed = 0 THEN 1 END) as overdue_tasks,
                    COUNT(CASE WHEN scheduled_date = DATE('now') AND completed = 0 THEN 1 END) as today_pending_tasks
                FROM daily_tasks 
                WHERE farm_plan_id = ?
            `, [farmPlanId]);
            
            return {
                ...stats,
                completion_percentage: stats.total_tasks > 0 
                    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
                    : 0,
                critical_completion_percentage: stats.critical_tasks > 0
                    ? Math.round((stats.completed_critical_tasks / stats.critical_tasks) * 100)
                    : 0
            };
        } catch (error) {
            console.error('❌ Error getting task statistics:', error);
            throw error;
        }
    }
}

// Export singleton instance
const taskGenerator = new TaskGenerator();
module.exports = taskGenerator;