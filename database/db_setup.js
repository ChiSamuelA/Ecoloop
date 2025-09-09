// Database Setup Script for Éco Loop - UPDATED VERSION
// This script creates and initializes the SQLite database
// Modified to preserve existing data by skipping sample data insertion

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'ecoloop.db');

// Read SQL files
const initSchema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
// const sampleData = fs.readFileSync(path.join(__dirname, 'sample_data.sql'), 'utf8'); // Commented out

// Create database and run setup
function setupDatabase(preserveData = false) {
    return new Promise((resolve, reject) => {
        // Only delete existing database if preserveData is false
        if (!preserveData && fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
            console.log('🗑️  Existing database deleted');
        } else if (preserveData && fs.existsSync(DB_PATH)) {
            console.log('📦 Preserving existing database data');
        }

        // Create new database or connect to existing
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Error creating/connecting to database:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Connected to SQLite database');
        });

        if (preserveData) {
            // Only add new tables, don't recreate existing ones
            const newTablesOnly = `
            -- Add new tables for complete training system
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                formation_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer CHAR(1) NOT NULL,
                explanation TEXT,
                order_number INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS formation_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                formation_id INTEGER NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                file_size INTEGER,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS progress_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                formation_id INTEGER NOT NULL,
                old_percentage INTEGER DEFAULT 0,
                new_percentage INTEGER NOT NULL,
                action_type VARCHAR(50) NOT NULL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
            );

            -- Add indexes for new tables
            CREATE INDEX IF NOT EXISTS idx_quiz_questions_formation_id ON quiz_questions(formation_id);
            CREATE INDEX IF NOT EXISTS idx_formation_content_formation_id ON formation_content(formation_id);
            CREATE INDEX IF NOT EXISTS idx_progress_history_user_id ON progress_history(user_id);
            CREATE INDEX IF NOT EXISTS idx_progress_history_formation_id ON progress_history(formation_id);
            `;

            // Execute only new tables
            db.exec(newTablesOnly, (err) => {
                if (err) {
                    console.error('❌ Error adding new tables:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ New tables added successfully');

                // Close database connection
                db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing database:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('✅ Database migration completed successfully');
                    console.log(`📁 Database file updated at: ${DB_PATH}`);
                    resolve();
                });
            });
        } else {
            // Full schema creation (fresh database)
            db.exec(initSchema, (err) => {
                if (err) {
                    console.error('❌ Error creating schema:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Database schema created successfully');

                // Skip sample data insertion - user will have their own real data
                console.log('⚠️  Sample data insertion skipped - preserving real user data');

                // Close database connection
                db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing database:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('✅ Database setup completed successfully');
                    console.log(`📁 Database file created at: ${DB_PATH}`);
                    resolve();
                });
            });
        }
    });
}

// Add function to create fresh database with sample data (for development)
function setupDatabaseWithSamples() {
    return new Promise((resolve, reject) => {
        const sampleData = fs.readFileSync(path.join(__dirname, 'sample_data.sql'), 'utf8');
        
        // Delete existing database
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
            console.log('🗑️  Existing database deleted');
        }

        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Error creating database:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Connected to SQLite database');
        });

        // Execute schema creation
        db.exec(initSchema, (err) => {
            if (err) {
                console.error('❌ Error creating schema:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Database schema created successfully');

            // Execute sample data insertion
            db.exec(sampleData, (err) => {
                if (err) {
                    console.error('❌ Error inserting sample data:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Sample data inserted successfully');

                // Close database connection
                db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing database:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('✅ Database setup with samples completed successfully');
                    console.log(`📁 Database file created at: ${DB_PATH}`);
                    resolve();
                });
            });
        });
    });
}

// Run setup if called directly
if (require.main === module) {
    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'migrate') {
        // Preserve existing data, only add new tables
        console.log('🔄 Running database migration (preserving existing data)...\n');
        setupDatabase(true)
            .then(() => {
                console.log('\n🎉 Database migration completed! Your existing data is preserved.');
                process.exit(0);
            })
            .catch((err) => {
                console.error('\n💥 Database migration failed:', err.message);
                process.exit(1);
            });
    } else if (command === 'fresh') {
        // Create fresh database with sample data
        console.log('🆕 Creating fresh database with sample data...\n');
        setupDatabaseWithSamples()
            .then(() => {
                console.log('\n🎉 Fresh database created with sample data!');
                process.exit(0);
            })
            .catch((err) => {
                console.error('\n💥 Fresh database setup failed:', err.message);
                process.exit(1);
            });
    } else {
        // Default: create database without sample data (preserves existing or creates new)
        console.log('📦 Setting up database (no sample data)...\n');
        setupDatabase(false)
            .then(() => {
                console.log('\n🎉 Database setup completed! Ready for your real data.');
                process.exit(0);
            })
            .catch((err) => {
                console.error('\n💥 Database setup failed:', err.message);
                process.exit(1);
            });
    }
}

module.exports = { setupDatabase, setupDatabaseWithSamples, DB_PATH };