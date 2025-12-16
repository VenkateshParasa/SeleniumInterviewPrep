-- Interview Prep Platform - Database Schema
-- SQLite Database Design with Normalized Tables
-- Created: December 15, 2025

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ===============================
-- USERS TABLE
-- ===============================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    experience_level TEXT CHECK(experience_level IN ('beginner', 'intermediate', 'advanced', 'senior')) DEFAULT 'intermediate',
    role TEXT CHECK(role IN ('user', 'admin', 'moderator')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    settings JSON DEFAULT '{}',
    metadata JSON DEFAULT '{}'
);

-- ===============================
-- SESSIONS TABLE
-- ===============================
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    device_info JSON,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- PASSWORD RESET TOKENS TABLE
-- ===============================
CREATE TABLE password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- EMAIL VERIFICATION TOKENS TABLE
-- ===============================
CREATE TABLE email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- CATEGORIES TABLE
-- ===============================
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- TRACKS TABLE
-- ===============================
CREATE TABLE tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK(difficulty_level IN ('fast', 'standard', 'comfortable')) NOT NULL,
    total_days INTEGER NOT NULL,
    estimated_hours_per_day REAL,
    prerequisites TEXT,
    learning_outcomes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- TRACK_DAYS TABLE
-- ===============================
CREATE TABLE track_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    learning_objectives TEXT,
    estimated_duration REAL,
    difficulty_rating INTEGER CHECK(difficulty_rating BETWEEN 1 AND 5),
    prerequisites TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    UNIQUE(track_id, day_number)
);

-- ===============================
-- QUESTIONS TABLE
-- ===============================
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    category_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer TEXT,
    explanation TEXT,
    difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    question_type TEXT CHECK(question_type IN ('mcq', 'coding', 'theoretical', 'practical')) DEFAULT 'theoretical',
    tags TEXT, -- JSON array of tags
    code_snippets TEXT, -- JSON object with code examples
    related_concepts TEXT, -- JSON array of related topics
    estimated_time INTEGER DEFAULT 5, -- minutes
    source TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ===============================
-- PRACTICE_EXERCISES TABLE
-- ===============================
CREATE TABLE practice_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_day_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    exercise_type TEXT CHECK(exercise_type IN ('coding', 'reading', 'research', 'project', 'quiz')) DEFAULT 'coding',
    difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    estimated_time INTEGER DEFAULT 30, -- minutes
    instructions TEXT,
    starter_code TEXT,
    solution_code TEXT,
    test_cases TEXT, -- JSON array of test cases
    resources TEXT, -- JSON array of helpful resources
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_day_id) REFERENCES track_days(id) ON DELETE CASCADE
);

-- ===============================
-- RESOURCES TABLE
-- ===============================
CREATE TABLE resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_day_id INTEGER,
    category_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT CHECK(resource_type IN ('article', 'video', 'documentation', 'tutorial', 'book', 'tool')) NOT NULL,
    url TEXT,
    content TEXT,
    author TEXT,
    duration INTEGER, -- minutes for videos
    difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    tags TEXT, -- JSON array
    is_external BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_day_id) REFERENCES track_days(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ===============================
-- USER_PROGRESS TABLE
-- ===============================
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
    completion_percentage REAL DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- minutes
    started_at DATETIME,
    completed_at DATETIME,
    notes TEXT,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    UNIQUE(user_id, track_id, day_number)
);

-- ===============================
-- USER_QUESTION_PROGRESS TABLE
-- ===============================
CREATE TABLE user_question_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('not_attempted', 'attempted', 'correct', 'incorrect', 'skipped')) DEFAULT 'not_attempted',
    attempts_count INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    user_answer TEXT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    confidence_level INTEGER CHECK(confidence_level BETWEEN 1 AND 5),
    notes TEXT,
    first_attempted_at DATETIME,
    last_attempted_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE(user_id, question_id)
);

-- ===============================
-- USER_EXERCISE_PROGRESS TABLE
-- ===============================
CREATE TABLE user_exercise_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
    completion_percentage REAL DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- minutes
    submission_code TEXT,
    test_results TEXT, -- JSON object with test case results
    feedback TEXT,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES practice_exercises(id) ON DELETE CASCADE,
    UNIQUE(user_id, exercise_id)
);

-- ===============================
-- USER_ACHIEVEMENTS TABLE
-- ===============================
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_data JSON DEFAULT '{}',
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_displayed BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- USER_STUDY_SESSIONS TABLE
-- ===============================
CREATE TABLE user_study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_type TEXT CHECK(session_type IN ('questions', 'exercises', 'reading', 'mixed')) NOT NULL,
    track_id INTEGER,
    day_number INTEGER,
    duration INTEGER NOT NULL, -- seconds
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    focus_time INTEGER DEFAULT 0, -- seconds of focused study
    break_time INTEGER DEFAULT 0, -- seconds of breaks
    session_data JSON DEFAULT '{}',
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

-- ===============================
-- INDEXES FOR PERFORMANCE
-- ===============================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_active ON users(is_active);

-- Session indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_active ON sessions(is_active);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Question indexes
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_questions_uuid ON questions(uuid);

-- Progress indexes
CREATE INDEX idx_user_progress_user_track ON user_progress(user_id, track_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_completion ON user_progress(completion_percentage);

-- Question progress indexes
CREATE INDEX idx_user_question_progress_user ON user_question_progress(user_id);
CREATE INDEX idx_user_question_progress_question ON user_question_progress(question_id);
CREATE INDEX idx_user_question_progress_status ON user_question_progress(status);
CREATE INDEX idx_user_question_progress_bookmarked ON user_question_progress(is_bookmarked);

-- Study session indexes
CREATE INDEX idx_study_sessions_user ON user_study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON user_study_sessions(started_at);
CREATE INDEX idx_study_sessions_track ON user_study_sessions(track_id);

-- ===============================
-- TRIGGERS FOR AUTO-UPDATE
-- ===============================

-- Update timestamp triggers
CREATE TRIGGER update_users_timestamp
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_categories_timestamp
    AFTER UPDATE ON categories
    BEGIN
        UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_tracks_timestamp
    AFTER UPDATE ON tracks
    BEGIN
        UPDATE tracks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_track_days_timestamp
    AFTER UPDATE ON track_days
    BEGIN
        UPDATE track_days SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_questions_timestamp
    AFTER UPDATE ON questions
    BEGIN
        UPDATE questions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_user_progress_timestamp
    AFTER UPDATE ON user_progress
    BEGIN
        UPDATE user_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_user_question_progress_timestamp
    AFTER UPDATE ON user_question_progress
    BEGIN
        UPDATE user_question_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- ===============================
-- VIEWS FOR COMMON QUERIES
-- ===============================

-- User dashboard view
CREATE VIEW user_dashboard_stats AS
SELECT
    u.id as user_id,
    u.username,
    COUNT(DISTINCT up.track_id) as active_tracks,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.id END) as completed_days,
    COUNT(DISTINCT CASE WHEN uqp.status IN ('correct', 'completed') THEN uqp.question_id END) as questions_solved,
    COALESCE(SUM(uss.duration), 0) / 60 as total_study_minutes,
    COUNT(DISTINCT uss.id) as study_sessions,
    MAX(uss.started_at) as last_study_session
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_question_progress uqp ON u.id = uqp.user_id
LEFT JOIN user_study_sessions uss ON u.id = uss.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username;

-- Question statistics view
CREATE VIEW question_stats AS
SELECT
    q.id,
    q.question_text,
    c.name as category_name,
    COUNT(uqp.id) as total_attempts,
    COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) as correct_attempts,
    ROUND(
        (COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) * 100.0) /
        NULLIF(COUNT(uqp.id), 0), 2
    ) as success_rate,
    AVG(uqp.time_spent) as avg_time_spent,
    COUNT(CASE WHEN uqp.is_bookmarked = TRUE THEN 1 END) as bookmarks_count
FROM questions q
LEFT JOIN categories c ON q.category_id = c.id
LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id
GROUP BY q.id, q.question_text, c.name;

-- Track progress view
CREATE VIEW track_progress_overview AS
SELECT
    t.id as track_id,
    t.name as track_name,
    t.difficulty_level,
    COUNT(DISTINCT td.id) as total_days,
    COUNT(DISTINCT up.user_id) as enrolled_users,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.user_id END) as completed_users,
    ROUND(
        (COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.user_id END) * 100.0) /
        NULLIF(COUNT(DISTINCT up.user_id), 0), 2
    ) as completion_rate
FROM tracks t
LEFT JOIN track_days td ON t.id = td.track_id
LEFT JOIN user_progress up ON t.id = up.track_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.difficulty_level;