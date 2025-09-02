// Database Setup Script for Éco Loop
// This script creates and initializes the SQLite database

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'ecoloop.db');

// Read SQL files
const initSchema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
const sampleData = fs.readFileSync(path.join(__dirname, 'sample_data.sql'), 'utf8');

// Create database and run setup
function setupDatabase() {
    return new Promise((resolve, reject) => {
        // Delete existing database if it exists
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
            console.log('🗑️  Existing database deleted');
        }

        // Create new database
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
                    console.log('✅ Database setup completed successfully');
                    console.log(`📁 Database file created at: ${DB_PATH}`);
                    resolve();
                });
            });
        });
    });
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('\n🎉 Database setup completed! You can now start building your backend.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('\n💥 Database setup failed:', err.message);
            process.exit(1);
        });
}

module.exports = { setupDatabase, DB_PATH };