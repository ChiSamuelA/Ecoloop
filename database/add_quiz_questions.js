// Script to update formations to English and add English quiz questions
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'ecoloop.db');

// First, update existing formations to English
const formationUpdates = [
    {
        id: 1,
        titre: "Poultry Farming Phases",
        description: "Understanding the different phases: starter, grower, finisher"
    },
    {
        id: 2,
        titre: "Choosing the Right Chick Breed",
        description: "Guide for selecting the breed adapted to your objectives"
    },
    {
        id: 3,
        titre: "Vaccination Program",
        description: "Complete schedule of essential vaccinations"
    },
    {
        id: 4,
        titre: "Balanced Nutrition",
        description: "Composing an optimal feed ration according to age"
    },
    {
        id: 5,
        titre: "Essential Equipment",
        description: "Feeders, drinkers, heating: how to choose properly"
    },
    {
        id: 6,
        titre: "Biosecurity in Farming",
        description: "Preventive measures against diseases"
    }
];

// English quiz questions for each formation
const quizQuestions = [
    // Formation 1: Poultry farming phases
    {
        formation_id: 1,
        questions: [
            {
                question: "What is the optimal temperature for chicks during the first week?",
                option_a: "25-27°C",
                option_b: "32-34°C", 
                option_c: "28-30°C",
                option_d: "35-37°C",
                correct_answer: "B",
                explanation: "Chicks need a high temperature of 32-34°C to start well.",
                order_number: 1
            },
            {
                question: "How many main phases does broiler chicken farming include?",
                option_a: "2 phases",
                option_b: "3 phases",
                option_c: "4 phases", 
                option_d: "5 phases",
                correct_answer: "B",
                explanation: "Farming includes 3 phases: starter, grower, and finisher.",
                order_number: 2
            },
            {
                question: "At what age does the finisher phase generally begin?",
                option_a: "3 weeks",
                option_b: "4 weeks",
                option_c: "5 weeks",
                option_d: "6 weeks",
                correct_answer: "C",
                explanation: "The finisher phase begins around 5 weeks of age.",
                order_number: 3
            },
            {
                question: "What is the average duration of a complete farming cycle?",
                option_a: "4-5 weeks",
                option_b: "6-7 weeks",
                option_c: "8-9 weeks",
                option_d: "10-12 weeks",
                correct_answer: "B",
                explanation: "A complete cycle generally lasts 6 to 7 weeks.",
                order_number: 4
            },
            {
                question: "During which phase do chickens consume the most feed?",
                option_a: "Starter",
                option_b: "Grower", 
                option_c: "Finisher",
                option_d: "All phases equally",
                correct_answer: "C",
                explanation: "In the finisher phase, chickens consume the most feed to reach their optimal weight.",
                order_number: 5
            }
        ]
    },
    // Formation 2: Choosing the right chick breed
    {
        formation_id: 2,
        questions: [
            {
                question: "Which breed is most suitable for meat production?",
                option_a: "Leghorn",
                option_b: "Cobb 500",
                option_c: "Rhode Island",
                option_d: "Sussex",
                correct_answer: "B",
                explanation: "Cobb 500 is a breed specifically developed for meat production with fast growth.",
                order_number: 1
            },
            {
                question: "What is the average feed conversion ratio for broiler chickens?",
                option_a: "1.5:1",
                option_b: "1.8:1",
                option_c: "2.2:1",
                option_d: "3.0:1",
                correct_answer: "B",
                explanation: "Modern broiler breeds typically have a feed conversion ratio of about 1.8:1.",
                order_number: 2
            },
            {
                question: "Which factor is most important when selecting chicks?",
                option_a: "Color",
                option_b: "Size",
                option_c: "Health status",
                option_d: "Price",
                correct_answer: "C",
                explanation: "Health status is the most critical factor to ensure successful farming.",
                order_number: 3
            },
            {
                question: "At what age should day-old chicks be vaccinated?",
                option_a: "Immediately",
                option_b: "Day 7",
                option_c: "Day 14",
                option_d: "Day 21",
                correct_answer: "A",
                explanation: "Day-old chicks should receive their first vaccinations immediately.",
                order_number: 4
            },
            {
                question: "What is the ideal stocking density for broilers?",
                option_a: "8-10 birds/m²",
                option_b: "12-15 birds/m²",
                option_c: "18-20 birds/m²",
                option_d: "25-30 birds/m²",
                correct_answer: "A",
                explanation: "8-10 birds per square meter provides adequate space for healthy growth.",
                order_number: 5
            }
        ]
    },
    // Formation 3: Vaccination programs
    {
        formation_id: 3,
        questions: [
            {
                question: "What is the most common vaccination method for day-old chicks?",
                option_a: "Injection",
                option_b: "Drinking water",
                option_c: "Spray",
                option_d: "Eye drop",
                correct_answer: "C",
                explanation: "Spray vaccination is commonly used for day-old chicks in hatcheries.",
                order_number: 1
            },
            {
                question: "Which disease does Newcastle vaccine protect against?",
                option_a: "Salmonella",
                option_b: "Coccidiosis",
                option_c: "Newcastle disease",
                option_d: "Fowl pox",
                correct_answer: "C",
                explanation: "Newcastle vaccine specifically protects against Newcastle disease virus.",
                order_number: 2
            },
            {
                question: "When should the second vaccination typically be given?",
                option_a: "Day 7",
                option_b: "Day 14",
                option_c: "Day 21",
                option_d: "Day 28",
                correct_answer: "B",
                explanation: "The second vaccination is typically given around day 14.",
                order_number: 3
            },
            {
                question: "Which vaccine route is most effective for large flocks?",
                option_a: "Individual injection",
                option_b: "Drinking water",
                option_c: "Eye drop",
                option_d: "Wing web",
                correct_answer: "B",
                explanation: "Drinking water vaccination is most practical for large flocks.",
                order_number: 4
            },
            {
                question: "What should be avoided 24 hours before and after vaccination?",
                option_a: "Feeding",
                option_b: "Antibiotics",
                option_c: "Water",
                option_d: "Light",
                correct_answer: "B",
                explanation: "Antibiotics should be avoided as they can interfere with vaccine effectiveness.",
                order_number: 5
            }
        ]
    },
    // Formation 4: Nutrition and feeding
    {
        formation_id: 4,
        questions: [
            {
                question: "What protein percentage is recommended for starter feed?",
                option_a: "18-20%",
                option_b: "20-22%",
                option_c: "22-24%",
                option_d: "24-26%",
                correct_answer: "C",
                explanation: "Starter feed should contain 22-24% protein for proper early growth.",
                order_number: 1
            },
            {
                question: "How many times per day should young chicks be fed?",
                option_a: "2 times",
                option_b: "3 times",
                option_c: "4 times",
                option_d: "Free choice",
                correct_answer: "D",
                explanation: "Young chicks should have free access to feed for optimal growth.",
                order_number: 2
            },
            {
                question: "Which nutrient is most important for bone development?",
                option_a: "Protein",
                option_b: "Calcium",
                option_c: "Vitamins",
                option_d: "Carbohydrates",
                correct_answer: "B",
                explanation: "Calcium is essential for proper bone development in growing chickens.",
                order_number: 3
            },
            {
                question: "When should feed be switched from starter to grower?",
                option_a: "Day 7",
                option_b: "Day 14",
                option_c: "Day 21",
                option_d: "Day 28",
                correct_answer: "C",
                explanation: "Feed should typically be switched from starter to grower around day 21.",
                order_number: 4
            },
            {
                question: "What is the recommended water to feed ratio?",
                option_a: "1:1",
                option_b: "1.5:1",
                option_c: "2:1",
                option_d: "3:1",
                correct_answer: "C",
                explanation: "Chickens typically consume 2 liters of water for every 1 kg of feed.",
                order_number: 5
            }
        ]
    },
    // Formation 5: Essential equipment
    {
        formation_id: 5,
        questions: [
            {
                question: "What type of drinker is best for day-old chicks?",
                option_a: "Bell drinkers",
                option_b: "Nipple drinkers",
                option_c: "Trough drinkers",
                option_d: "Shallow pan drinkers",
                correct_answer: "D",
                explanation: "Shallow pan drinkers are safest for day-old chicks to prevent drowning.",
                order_number: 1
            },
            {
                question: "What is the ideal height for feeders?",
                option_a: "Ground level",
                option_b: "Back height",
                option_c: "Head height",
                option_d: "Above head",
                correct_answer: "B",
                explanation: "Feeders should be at back height to prevent waste and contamination.",
                order_number: 2
            },
            {
                question: "Which heating system is most energy efficient?",
                option_a: "Electric heaters",
                option_b: "Gas brooders",
                option_c: "Infrared lamps",
                option_d: "Hot water systems",
                correct_answer: "B",
                explanation: "Gas brooders are generally more energy efficient for large-scale operations.",
                order_number: 3
            },
            {
                question: "What ventilation rate is needed per kg of bird weight?",
                option_a: "1 m³/hour",
                option_b: "3 m³/hour",
                option_c: "5 m³/hour",
                option_d: "10 m³/hour",
                correct_answer: "C",
                explanation: "Approximately 5 m³/hour per kg of bird weight is needed for proper ventilation.",
                order_number: 4
            },
            {
                question: "How often should equipment be cleaned and disinfected?",
                option_a: "Daily",
                option_b: "Weekly",
                option_c: "Between flocks",
                option_d: "Monthly",
                correct_answer: "C",
                explanation: "Equipment should be thoroughly cleaned and disinfected between each flock.",
                order_number: 5
            }
        ]
    },
    // Formation 6: Biosecurity and health
    {
        formation_id: 6,
        questions: [
            {
                question: "What is the most important biosecurity measure?",
                option_a: "Disinfection",
                option_b: "Vaccination",
                option_c: "Quarantine",
                option_d: "Hand washing",
                correct_answer: "A",
                explanation: "Regular disinfection is the most fundamental biosecurity measure.",
                order_number: 1
            },
            {
                question: "How long should a poultry house rest between flocks?",
                option_a: "1 week",
                option_b: "2 weeks",
                option_c: "3 weeks",
                option_d: "4 weeks",
                correct_answer: "B",
                explanation: "A minimum 2-week rest period allows for proper cleaning and pathogen elimination.",
                order_number: 2
            },
            {
                question: "Which sign indicates possible respiratory disease?",
                option_a: "Diarrhea",
                option_b: "Coughing",
                option_c: "Reduced appetite",
                option_d: "All of the above",
                correct_answer: "D",
                explanation: "All these signs can indicate health problems and should be monitored closely.",
                order_number: 3
            },
            {
                question: "What temperature should disinfectant solution be?",
                option_a: "Cold",
                option_b: "Room temperature",
                option_c: "Warm (40-50°C)",
                option_d: "Hot (80°C+)",
                correct_answer: "C",
                explanation: "Warm disinfectant solutions (40-50°C) are more effective than cold solutions.",
                order_number: 4
            },
            {
                question: "How should dead birds be disposed of?",
                option_a: "Burial",
                option_b: "Burning",
                option_c: "Composting",
                option_d: "Any approved method",
                correct_answer: "D",
                explanation: "Dead birds should be disposed of using any method approved by local authorities.",
                order_number: 5
            }
        ]
    }
];

function updateDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Connected to database');
        });

        // Step 1: Update formations to English
        console.log('Step 1: Updating formations to English...');
        
        const updateFormationStmt = db.prepare(`
            UPDATE formations 
            SET titre = ?, description = ? 
            WHERE id = ?
        `);

        let updatedFormations = 0;
        formationUpdates.forEach(formation => {
            updateFormationStmt.run([
                formation.titre,
                formation.description,
                formation.id
            ], function(err) {
                if (err) {
                    console.error('Error updating formation:', err);
                    return;
                }
                
                updatedFormations++;
                console.log(`Updated formation ${updatedFormations}/${formationUpdates.length}: ${formation.titre}`);
                
                if (updatedFormations === formationUpdates.length) {
                    updateFormationStmt.finalize();
                    console.log('\nStep 2: Adding English quiz questions...');
                    addQuizQuestions(db, resolve, reject);
                }
            });
        });
    });
}

function addQuizQuestions(db, resolve, reject) {
    // Prepare insert statement for quiz questions
    const stmt = db.prepare(`
        INSERT INTO quiz_questions (
            formation_id, question, option_a, option_b, option_c, option_d, 
            correct_answer, explanation, order_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let insertedCount = 0;
    const totalQuestions = quizQuestions.reduce((sum, formation) => sum + formation.questions.length, 0);

    // Insert questions for each formation
    quizQuestions.forEach(formation => {
        formation.questions.forEach(q => {
            stmt.run([
                formation.formation_id,
                q.question,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                q.explanation,
                q.order_number
            ], function(err) {
                if (err) {
                    console.error('Error inserting question:', err);
                    return;
                }
                
                insertedCount++;
                console.log(`Inserted question ${insertedCount}/${totalQuestions}`);
                
                if (insertedCount === totalQuestions) {
                    stmt.finalize();
                    db.close();
                    console.log(`\nSuccessfully updated database:`);
                    console.log(`- Updated ${formationUpdates.length} formations to English`);
                    console.log(`- Added ${insertedCount} English quiz questions`);
                    resolve();
                }
            });
        });
    });
}

// Run if called directly
if (require.main === module) {
    console.log('Updating database to English...\n');
    updateDatabase()
        .then(() => {
            console.log('\nDatabase fully updated to English!');
            console.log('Your app is now completely consistent in English.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('\nFailed to update database:', err.message);
            process.exit(1);
        });
}

module.exports = { updateDatabase };