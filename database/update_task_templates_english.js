// Script to update task templates from French to English
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'ecoloop.db');

// English translations for all task templates
const englishTaskTemplates = [
    // Week 1 (Days 1-7) - 21 days cycle
    { id: 1, task_title: 'Poultry House Preparation', task_description: 'Clean and disinfect poultry house before chick arrival' },
    { id: 2, task_title: 'Equipment Verification', task_description: 'Check feeders, drinkers and heating system' },
    { id: 3, task_title: 'Chick Arrival', task_description: 'Receive chicks and install them properly' },
    { id: 4, task_title: 'First Feeding', task_description: 'Give first starter feed to chicks' },
    { id: 5, task_title: 'Temperature Control', task_description: 'Maintain temperature at 32-34°C' },
    { id: 6, task_title: 'Feeding 3x/day', task_description: 'Distribute starter feed 3 times per day' },
    { id: 7, task_title: 'Drinker Cleaning', task_description: 'Clean and refill water drinkers' },
    { id: 8, task_title: 'Health Check', task_description: 'Check health status of chicks' },
    { id: 9, task_title: 'Partial Litter Change', task_description: 'Change wet areas of litter' },
    { id: 10, task_title: 'Weekly Weighing', task_description: 'Weigh sample of chicks to monitor growth' },

    // Week 2 (Days 8-14)
    { id: 11, task_title: 'Feed Transition', task_description: 'Start transition to grower feed' },
    { id: 12, task_title: 'Vaccination (if needed)', task_description: 'Administer vaccines according to health program' },
    { id: 13, task_title: 'Temperature Adjustment', task_description: 'Reduce temperature to 28-30°C' },
    { id: 14, task_title: 'Complete Cleaning', task_description: 'Thorough cleaning of poultry house' },
    { id: 15, task_title: 'Growth Control', task_description: 'Check chicken development' },
    { id: 16, task_title: 'Equipment Disinfection', task_description: 'Disinfect feeders and drinkers' },
    { id: 17, task_title: 'Weekly Weighing', task_description: 'Second control weighing' },

    // Week 3 (Days 15-21)
    { id: 18, task_title: 'Finisher Feed', task_description: 'Switch to finisher feed' },
    { id: 19, task_title: 'Sale Preparation', task_description: 'Identify potential buyers' },
    { id: 20, task_title: 'Final Weight Control', task_description: 'Check average weight of chickens' },
    { id: 21, task_title: 'Final Cleaning', task_description: 'Last cleaning before sale' },
    { id: 22, task_title: 'Transport Preparation', task_description: 'Organize transport to market/client' },
    { id: 23, task_title: 'Pre-slaughter Fasting', task_description: 'Stop feeding 12h before sale' },
    { id: 24, task_title: 'Sale/Slaughter', task_description: 'Sell or slaughter chickens' },

    // Extended cycle days (22-30) for 30-day cycle
    { id: 25, task_title: 'Cycle Evaluation', task_description: 'Analyze performance of previous cycle' },
    { id: 26, task_title: 'Equipment Maintenance', task_description: 'Complete maintenance of equipment' },
    { id: 27, task_title: 'Continuous Training', task_description: 'Review good poultry practices' },
    { id: 28, task_title: 'Next Planning', task_description: 'Prepare next farming cycle' },
    { id: 29, task_title: 'Cleaning Disinfection', task_description: 'Complete disinfection of facilities' },
    { id: 30, task_title: 'Sanitary Rest Start', task_description: 'Let poultry house rest' },
    { id: 31, task_title: 'Supply Ordering', task_description: 'Order feed and medicines' },
    { id: 32, task_title: 'Sanitary Rest End', task_description: 'Finalize sanitary rest' },
    { id: 33, task_title: 'New Cycle Preparation', task_description: 'Prepare arrival of new chicks' }
];

function updateTaskTemplates() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Connected to database');
        });

        // Prepare update statement
        const updateStmt = db.prepare(`
            UPDATE task_templates 
            SET task_title = ?, task_description = ? 
            WHERE id = ?
        `);

        let updatedCount = 0;
        const totalTemplates = englishTaskTemplates.length;

        englishTaskTemplates.forEach(template => {
            updateStmt.run([
                template.task_title,
                template.task_description,
                template.id
            ], function(err) {
                if (err) {
                    console.error('Error updating template:', err);
                    return;
                }
                
                if (this.changes > 0) {
                    updatedCount++;
                    console.log(`Updated template ${template.id}: ${template.task_title}`);
                } else {
                    console.log(`No template found with ID ${template.id}`);
                }
                
                // Check if all updates are complete
                if (updatedCount + (totalTemplates - updatedCount) === totalTemplates) {
                    updateStmt.finalize();
                    
                    // Update error messages in tasks.js routes as well
                    console.log('\nTask templates updated to English!');
                    console.log(`Updated ${updatedCount} templates successfully.`);
                    
                    db.close();
                    resolve();
                }
            });
        });
    });
}

// Also update error messages - create a separate function
function updateRouteMessages() {
    console.log('\n📝 Remember to update these error messages in your routes/tasks.js file:');
    console.log('');
    console.log('French → English:');
    console.log('- "Plan d\'élevage non trouvé" → "Farm plan not found"');
    console.log('- "Les tâches ont déjà été générées pour ce plan" → "Tasks have already been generated for this plan"');
    console.log('- "tâches générées avec succès" → "tasks generated successfully"');
    console.log('- "Erreur lors de la génération des tâches" → "Error generating tasks"');
    console.log('- "Tâches récupérées avec succès" → "Tasks retrieved successfully"');
    console.log('- "Tâches du jour récupérées avec succès" → "Today\'s tasks retrieved successfully"');
    console.log('- "Tâches à venir récupérées avec succès" → "Upcoming tasks retrieved successfully"');
    console.log('- "Tâche marquée comme terminée" → "Task marked as completed"');
    console.log('- "Tâche non trouvée" → "Task not found"');
    console.log('- "Tâche déjà terminée" → "Task already completed"');
    console.log('- "Aucun fichier photo fourni" → "No photo file provided"');
    console.log('- "Photo ajoutée avec succès" → "Photo added successfully"');
    console.log('- "Tâche mise à jour avec succès" → "Task updated successfully"');
    console.log('- "Statistiques récupérées avec succès" → "Statistics retrieved successfully"');
}

// Run if called directly
if (require.main === module) {
    console.log('Updating task templates to English...\n');
    updateTaskTemplates()
        .then(() => {
            updateRouteMessages();
            console.log('\n🎉 Task template update completed!');
            console.log('Next step: Update error messages in routes/tasks.js manually');
            process.exit(0);
        })
        .catch((err) => {
            console.error('\n💥 Task template update failed:', err.message);
            process.exit(1);
        });
}

module.exports = { updateTaskTemplates };