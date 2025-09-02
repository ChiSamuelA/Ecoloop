# Éco Loop - Database Setup Guide

## Overview

This guide explains how to set up and run the SQLite database for the Éco Loop platform.

## Database Structure

The database contains 8 main tables:
- **users** - User accounts and profiles
- **farm_plans** - Farm planning configurations
- **task_templates** - Predefined tasks for different cycles
- **daily_tasks** - Generated tasks for specific farm plans
- **formations** - Training content and materials
- **user_progress** - Training progress tracking
- **forum_posts** - Forum discussions
- **forum_comments** - Forum replies and comments

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

From the project root directory:

```bash
npm init -y
```

```bash
npm install sqlite3
```

### 2. Database Setup

Navigate to the database folder and run the setup script:

```bash
cd database
node db_setup.js
```

### 3. Expected Output

You should see:

```
🗑️  Existing database deleted (if it existed)
✅ Connected to SQLite database
✅ Database schema created successfully
✅ Sample data inserted successfully
✅ Database setup completed successfully
📁 Database file created at: /your/path/database/ecoloop.db
🎉 Database setup completed! You can now start building your backend.
```

## Database Files

After setup, you'll have these files in the `database/` folder:

```
database/
├── ecoloop.db          # The actual SQLite database file
├── init.sql            # Database schema creation script
├── sample_data.sql     # Sample data for testing
├── db_setup.js         # Database setup script
└── README.md           # This file
```

## Verification

To verify the database was created correctly, create and run this test file:

**`database/verify_setup.js`:**

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'ecoloop.db'));

console.log('📋 Verifying database setup...\n');

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error('❌ Error:', err.message);
        return;
    }
    
    console.log('🗂️  Tables created:');
    tables.forEach((table) => {
        if (table.name !== 'sqlite_sequence') {
            console.log(`   ✓ ${table.name}`);
        }
    });
    
    // Check sample data
    console.log('\n📊 Sample data counts:');
    
    const queries = [
        { table: 'users', label: '👥 Users' },
        { table: 'task_templates', label: '📋 Task templates' },
        { table: 'formations', label: '📚 Formations' },
        { table: 'forum_posts', label: '💬 Forum posts' }
    ];
    
    let completed = 0;
    
    queries.forEach((query) => {
        db.get(`SELECT COUNT(*) as count FROM ${query.table}`, [], (err, row) => {
            if (err) {
                console.error(`❌ Error checking ${query.table}:`, err.message);
            } else {
                console.log(`   ${query.label}: ${row.count}`);
            }
            
            completed++;
            if (completed === queries.length) {
                console.log('\n✅ Database verification complete!');
                db.close();
            }
        });
    });
});
```

**Run verification:**

```bash
node verify_setup.js
```

## Sample Data

The database comes pre-populated with:

### Users (3 accounts)
- **Test Farmer 1:** jean.kouam@gmail.com
- **Test Farmer 2:** marie.mballa@gmail.com  
- **Admin User:** admin@ecoloop.cm

### Task Templates
- **21-day cycle:** 21 predefined tasks
- **30-day cycle:** 30 predefined tasks
- Tasks cover: feeding, cleaning, health monitoring, surveillance

### Training Content
- 6 formation modules covering essential poultry topics
- Categories: phases, breeds, vaccines, feeding, equipment, health

### Forum Content
- Sample forum posts and comments for testing

## Troubleshooting

### Database File Not Found

If you get "database file not found" errors:

1. Make sure you ran the setup script from the `database/` folder
2. Check that `ecoloop.db` file exists in the `database/` folder
3. Verify the path in your backend configuration

### Permission Errors

On Windows, if you get permission errors:

1. Run command prompt as Administrator
2. Or change folder permissions for your project directory

### SQLite3 Module Not Found

If you get "Cannot find module 'sqlite3'":

```bash
# From project root
npm install sqlite3

# If still having issues, try rebuilding
npm rebuild sqlite3
```

## Resetting the Database

To completely reset the database with fresh data:

```bash
cd database
node db_setup.js
```

This will:
1. Delete the existing database file
2. Create a new database with fresh schema
3. Insert sample data

## Database Schema

### Key Relationships

```
users (1) -----> (many) farm_plans
farm_plans (1) -----> (many) daily_tasks
task_templates (1) -----> (many) daily_tasks
users (1) -----> (many) user_progress
formations (1) -----> (many) user_progress
users (1) -----> (many) forum_posts
forum_posts (1) -----> (many) forum_comments
```

### Important Fields

**farm_plans table:**
- `duration_days`: 21, 30, 45, or custom values
- `experience_level`: 'debutant', 'intermediaire', 'avance'
- `nb_poulets_recommande`: Calculated by recommendation algorithm

**task_templates table:**
- `duration_type`: '21_days', '30_days', '45_days'
- `day_number`: Which day of the cycle (1-45)
- `is_critical`: Boolean for essential tasks

## Next Steps

After database setup:

1. **Start the backend server:** `cd backend && npm run dev`
2. **Test API endpoints** using Postman or similar tool
3. **Build frontend** to connect to the APIs

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify Node.js and npm versions
3. Ensure all dependencies are installed
4. Check file and folder permissions

---

**Database setup complete! Ready to build amazing features! 🚀**