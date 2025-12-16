-- Advanced Search and Indexing for Interview Prep Platform
-- Full-text search indexes for better query performance
-- Created: December 15, 2025

-- ===============================
-- FULL TEXT SEARCH SETUP
-- ===============================

-- Enable FTS5 extension for full-text search
-- Create virtual table for questions full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts USING fts5(
    question_text,
    answer,
    explanation,
    tags,
    category_name,
    content='questions',
    content_rowid='id',
    tokenize='porter ascii'
);

-- Populate the FTS table with existing data
INSERT INTO questions_fts(rowid, question_text, answer, explanation, tags, category_name)
SELECT
    q.id,
    q.question_text,
    COALESCE(q.answer, ''),
    COALESCE(q.explanation, ''),
    COALESCE(q.tags, ''),
    c.name
FROM questions q
JOIN categories c ON q.category_id = c.id
WHERE q.is_active = TRUE;

-- ===============================
-- TRIGGERS TO MAINTAIN FTS INDEX
-- ===============================

-- Trigger for INSERT
CREATE TRIGGER IF NOT EXISTS questions_fts_insert
AFTER INSERT ON questions
WHEN NEW.is_active = TRUE
BEGIN
    INSERT INTO questions_fts(rowid, question_text, answer, explanation, tags, category_name)
    SELECT
        NEW.id,
        NEW.question_text,
        COALESCE(NEW.answer, ''),
        COALESCE(NEW.explanation, ''),
        COALESCE(NEW.tags, ''),
        c.name
    FROM categories c
    WHERE c.id = NEW.category_id;
END;

-- Trigger for UPDATE
CREATE TRIGGER IF NOT EXISTS questions_fts_update
AFTER UPDATE ON questions
WHEN NEW.is_active = TRUE
BEGIN
    UPDATE questions_fts
    SET
        question_text = NEW.question_text,
        answer = COALESCE(NEW.answer, ''),
        explanation = COALESCE(NEW.explanation, ''),
        tags = COALESCE(NEW.tags, ''),
        category_name = (SELECT name FROM categories WHERE id = NEW.category_id)
    WHERE rowid = NEW.id;
END;

-- Trigger for DELETE/DEACTIVATE
CREATE TRIGGER IF NOT EXISTS questions_fts_delete
AFTER UPDATE ON questions
WHEN NEW.is_active = FALSE OR OLD.is_active = TRUE AND NEW.is_active = FALSE
BEGIN
    DELETE FROM questions_fts WHERE rowid = NEW.id;
END;

-- ===============================
-- SEARCH OPTIMIZATION INDEXES
-- ===============================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_questions_category_difficulty
ON questions(category_id, difficulty_level, is_active);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty_type
ON questions(difficulty_level, question_type, is_active);

CREATE INDEX IF NOT EXISTS idx_questions_created_category
ON questions(created_at DESC, category_id, is_active);

-- User progress search optimization
CREATE INDEX IF NOT EXISTS idx_user_progress_search
ON user_progress(user_id, status, track_id, day_number);

-- Category and track search
CREATE INDEX IF NOT EXISTS idx_categories_search
ON categories(name, slug, is_active);

CREATE INDEX IF NOT EXISTS idx_tracks_search
ON tracks(name, slug, difficulty_level, is_active);

-- Session search for authentication
CREATE INDEX IF NOT EXISTS idx_sessions_search
ON sessions(user_id, is_active, expires_at);

-- ===============================
-- SEARCH HELPER VIEWS
-- ===============================

-- Comprehensive question search view
CREATE VIEW IF NOT EXISTS question_search_view AS
SELECT
    q.id,
    q.uuid,
    q.question_text,
    q.answer,
    q.explanation,
    q.difficulty_level,
    q.question_type,
    q.tags,
    q.estimated_time,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    q.created_at,
    -- Search ranking fields
    CASE
        WHEN q.difficulty_level = 1 THEN 'Beginner'
        WHEN q.difficulty_level = 2 THEN 'Easy'
        WHEN q.difficulty_level = 3 THEN 'Medium'
        WHEN q.difficulty_level = 4 THEN 'Hard'
        WHEN q.difficulty_level = 5 THEN 'Expert'
        ELSE 'Unknown'
    END as difficulty_text,
    -- Question length for ranking
    LENGTH(q.question_text) as question_length,
    -- Has answer for ranking
    CASE WHEN q.answer IS NOT NULL AND LENGTH(q.answer) > 0 THEN 1 ELSE 0 END as has_answer
FROM questions q
JOIN categories c ON q.category_id = c.id
WHERE q.is_active = TRUE AND c.is_active = TRUE;

-- User search summary view
CREATE VIEW IF NOT EXISTS user_search_summary AS
SELECT
    u.id,
    u.username,
    u.name,
    u.experience_level,
    COUNT(DISTINCT up.track_id) as active_tracks,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.id END) as completed_days,
    COUNT(DISTINCT uqp.question_id) as questions_attempted,
    COUNT(DISTINCT CASE WHEN uqp.status = 'correct' THEN uqp.question_id END) as questions_correct,
    MAX(up.updated_at) as last_activity,
    u.created_at as join_date
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_question_progress uqp ON u.id = uqp.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.name, u.experience_level, u.created_at;

-- Popular questions view (for search ranking)
CREATE VIEW IF NOT EXISTS popular_questions AS
SELECT
    q.id,
    q.question_text,
    q.category_id,
    COUNT(uqp.id) as attempt_count,
    COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) as correct_count,
    ROUND(
        (COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) * 100.0) /
        NULLIF(COUNT(uqp.id), 0), 2
    ) as success_rate,
    AVG(uqp.time_spent) as avg_time_spent
FROM questions q
LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id
WHERE q.is_active = TRUE
GROUP BY q.id, q.question_text, q.category_id;

-- ===============================
-- SEARCH FUNCTIONS
-- ===============================

-- Note: These would be implemented in the application layer (models.js)
-- But we define the concepts here for reference:

/*
Advanced Search Features to Implement in Code:

1. Full-Text Search:
   - Use questions_fts virtual table
   - Support phrase queries: "Java collections"
   - Support boolean queries: Java AND collections
   - Rank by relevance (BM25 ranking)

2. Faceted Search:
   - Filter by category
   - Filter by difficulty level
   - Filter by question type
   - Filter by has_answer

3. Smart Search:
   - Autocomplete suggestions
   - Spell correction using soundex/metaphone
   - Related questions based on tags
   - Search within answers/explanations

4. Personalized Search:
   - Show questions user hasn't attempted
   - Prioritize questions in user's experience level
   - Suggest questions based on weak areas

5. Advanced Filters:
   - Questions attempted/not attempted
   - Questions by success rate
   - Questions by estimated time
   - Questions by popularity

6. Search Analytics:
   - Track popular search terms
   - Monitor search performance
   - A/B test search algorithms
*/