-- Éco Loop Database Schema
-- SQLite Database Initialization Script

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- 1. USERS TABLE
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'farmer', -- 'farmer', 'admin'
    avatar_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. FARM PLANS TABLE
CREATE TABLE farm_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_name VARCHAR(200) NOT NULL,
    budget DECIMAL(12,2) NOT NULL,
    espace_m2 DECIMAL(8,2) NOT NULL,
    experience_level VARCHAR(50) NOT NULL, -- 'debutant', 'intermediaire', 'avance'
    duration_days INTEGER NOT NULL, -- 21, 30, 45, or custom
    nb_poulets_recommande INTEGER,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. TASK TEMPLATES TABLE
CREATE TABLE task_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duration_type VARCHAR(20) NOT NULL, -- '21_days', '30_days', '45_days'
    day_number INTEGER NOT NULL,
    task_title VARCHAR(200) NOT NULL,
    task_description TEXT,
    category VARCHAR(100) NOT NULL, -- 'alimentation', 'nettoyage', 'sante', 'surveillance'
    is_critical BOOLEAN DEFAULT 0,
    experience_level VARCHAR(50), -- NULL = all levels, or specific level
    estimated_duration_minutes INTEGER, -- How long task takes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. DAILY TASKS TABLE
CREATE TABLE daily_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_plan_id INTEGER NOT NULL,
    template_id INTEGER, -- Link back to template (can be NULL for custom tasks)
    day_number INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    task_title VARCHAR(200) NOT NULL,
    task_description TEXT,
    category VARCHAR(100) NOT NULL,
    is_critical BOOLEAN DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    completion_date DATETIME,
    photo_url VARCHAR(500),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_plan_id) REFERENCES farm_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES task_templates(id)
);

-- 5. FORMATIONS TABLE
CREATE TABLE formations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    categorie VARCHAR(100) NOT NULL, -- 'phases', 'souches', 'vaccins', 'alimentation', 'equipement'
    contenu_type VARCHAR(50) NOT NULL, -- 'video', 'pdf', 'text', 'quiz'
    contenu_url VARCHAR(500),
    contenu_text TEXT,
    duree_minutes INTEGER,
    ordre_affichage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. USER PROGRESS TABLE
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    formation_id INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    progress_percentage INTEGER DEFAULT 0,
    quiz_score INTEGER,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
    UNIQUE(user_id, formation_id)
);

-- 7. FORUM POSTS TABLE
CREATE TABLE forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100), -- 'general', 'technique', 'marketplace'
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT 0,
    is_locked BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. FORUM COMMENTS TABLE
CREATE TABLE forum_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id INTEGER, -- For replies to comments
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES forum_comments(id)
);

-- CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_farm_plans_user_id ON farm_plans(user_id);
CREATE INDEX idx_daily_tasks_farm_plan_id ON daily_tasks(farm_plan_id);
CREATE INDEX idx_daily_tasks_scheduled_date ON daily_tasks(scheduled_date);
CREATE INDEX idx_task_templates_duration_type ON task_templates(duration_type);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);