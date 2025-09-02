const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'ecoloop.db'));

console.log('📋 Checking database contents...\n');

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
        console.error(err.message);
        return;
    }
    
    console.log('🗂️  Tables created:');
    tables.forEach((table) => {
        console.log(`   ✓ ${table.name}`);
    });
    
    // Check sample data counts
    console.log('\n📊 Sample data:');
    
    db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
        if (err) console.error(err);
        else console.log(`   👥 Users: ${row.count}`);
        
        db.get("SELECT COUNT(*) as count FROM task_templates", [], (err, row) => {
            if (err) console.error(err);
            else console.log(`   📋 Task templates: ${row.count}`);
            
            db.get("SELECT COUNT(*) as count FROM formations", [], (err, row) => {
                if (err) console.error(err);
                else console.log(`   📚 Formations: ${row.count}`);
                
                console.log('\n🎉 Database is ready for backend development!');
                db.close();
            });
        });
    });
});