// Backend Database Configuration
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path (points to our database folder)
const DB_PATH = path.join(__dirname, '../../database/ecoloop.db');

class Database {
    constructor() {
        this.db = null;
    }

    // Connect to database
    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('❌ Database connection error:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Connected to SQLite database');
                resolve();
            });
        });
    }

    // Get database instance
    getDb() {
        return this.db;
    }

    // Run a query (INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Database run error:', err.message);
                    reject(err);
                    return;
                }
                resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    // Get single row (SELECT)
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('❌ Database get error:', err.message);
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    // Get multiple rows (SELECT)
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('❌ Database all error:', err.message);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('❌ Database close error:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('✅ Database connection closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Export singleton instance
const database = new Database();
module.exports = database;