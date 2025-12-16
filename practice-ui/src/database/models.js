// Database Connection and ORM Layer
// Interview Prep Platform - SQLite Database Interface
// Created: December 15, 2025

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'interview_prep.db');
        this.db = null;
        this.isConnected = false;
    }

    // Initialize database connection
    async connect() {
        if (this.isConnected) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    this.isConnected = true;

                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');

                    // Enable WAL mode for better concurrent access
                    this.db.run('PRAGMA journal_mode = WAL');

                    resolve(this.db);
                }
            });
        });
    }

    // Close database connection
    async close() {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    this.isConnected = false;
                    console.log('✅ Database connection closed');
                    resolve();
                }
            });
        });
    }

    // Execute query with parameters
    async run(sql, params = []) {
        await this.connect();

        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Database query failed:', err);
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    // Get single row
    async get(sql, params = []) {
        await this.connect();

        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('❌ Database query failed:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get multiple rows
    async all(sql, params = []) {
        await this.connect();

        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('❌ Database query failed:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Begin transaction
    async beginTransaction() {
        await this.run('BEGIN TRANSACTION');
    }

    // Commit transaction
    async commit() {
        await this.run('COMMIT');
    }

    // Rollback transaction
    async rollback() {
        await this.run('ROLLBACK');
    }

    // Execute multiple queries in a transaction
    async transaction(queries) {
        try {
            await this.beginTransaction();

            const results = [];
            for (const { sql, params } of queries) {
                const result = await this.run(sql, params);
                results.push(result);
            }

            await this.commit();
            return results;
        } catch (error) {
            await this.rollback();
            throw error;
        }
    }
}

// User Model
class UserModel {
    constructor(db) {
        this.db = db;
    }

    async create(userData) {
        const { uuid, username, email, password_hash, name, experience_level, role } = userData;

        const result = await this.db.run(`
            INSERT INTO users (uuid, username, email, password_hash, name, experience_level, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [uuid, username, email, password_hash, name, experience_level || 'intermediate', role || 'user']);

        return this.findById(result.id);
    }

    async findById(id) {
        return await this.db.get('SELECT * FROM users WHERE id = ? AND is_active = TRUE', [id]);
    }

    async findByUuid(uuid) {
        return await this.db.get('SELECT * FROM users WHERE uuid = ? AND is_active = TRUE', [uuid]);
    }

    async findByUsername(username) {
        return await this.db.get('SELECT * FROM users WHERE username = ? AND is_active = TRUE', [username]);
    }

    async findByEmail(email) {
        return await this.db.get('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
    }

    async update(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await this.db.run(`UPDATE users SET ${fields} WHERE id = ?`, values);
        return this.findById(id);
    }

    async delete(id) {
        return await this.db.run('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
    }

    async getStats() {
        return await this.db.get(`
            SELECT
                COUNT(*) as total_users,
                COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users,
                COUNT(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 END) as new_users_week
            FROM users
        `);
    }
}

// Category Model
class CategoryModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        return await this.db.all(`
            SELECT * FROM categories
            WHERE is_active = TRUE
            ORDER BY sort_order, name
        `);
    }

    async findBySlug(slug) {
        return await this.db.get('SELECT * FROM categories WHERE slug = ? AND is_active = TRUE', [slug]);
    }

    async create(categoryData) {
        const { slug, name, description, icon, color, sort_order } = categoryData;

        const result = await this.db.run(`
            INSERT INTO categories (slug, name, description, icon, color, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [slug, name, description, icon, color, sort_order || 0]);

        return this.findById(result.id);
    }

    async findById(id) {
        return await this.db.get('SELECT * FROM categories WHERE id = ? AND is_active = TRUE', [id]);
    }
}

// Track Model
class TrackModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        return await this.db.all(`
            SELECT * FROM tracks
            WHERE is_active = TRUE
            ORDER BY sort_order, name
        `);
    }

    async findBySlug(slug) {
        return await this.db.get('SELECT * FROM tracks WHERE slug = ? AND is_active = TRUE', [slug]);
    }

    async findWithDays(trackId) {
        const track = await this.db.get('SELECT * FROM tracks WHERE id = ? AND is_active = TRUE', [trackId]);
        if (!track) return null;

        const days = await this.db.all(`
            SELECT * FROM track_days
            WHERE track_id = ? AND is_active = TRUE
            ORDER BY day_number
        `, [trackId]);

        return { ...track, days };
    }

    async getProgress(userId, trackId) {
        return await this.db.all(`
            SELECT
                td.day_number,
                td.title,
                td.description,
                COALESCE(up.status, 'not_started') as status,
                COALESCE(up.completion_percentage, 0) as completion_percentage,
                up.time_spent,
                up.completed_at
            FROM track_days td
            LEFT JOIN user_progress up ON td.track_id = up.track_id AND td.day_number = up.day_number AND up.user_id = ?
            WHERE td.track_id = ? AND td.is_active = TRUE
            ORDER BY td.day_number
        `, [userId, trackId]);
    }
}

// Question Model
class QuestionModel {
    constructor(db) {
        this.db = db;
    }

    async findAll(options = {}) {
        const { limit = 20, offset = 0, category_id, difficulty, search } = options;

        let sql = `
            SELECT
                q.*,
                c.name as category_name,
                c.slug as category_slug
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.is_active = TRUE
        `;

        const params = [];

        if (category_id) {
            sql += ' AND q.category_id = ?';
            params.push(category_id);
        }

        if (difficulty) {
            sql += ' AND q.difficulty_level = ?';
            params.push(difficulty);
        }

        if (search) {
            sql += ' AND (q.question_text LIKE ? OR q.answer LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await this.db.all(sql, params);
    }

    async findById(id) {
        return await this.db.get(`
            SELECT
                q.*,
                c.name as category_name,
                c.slug as category_slug
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.id = ? AND q.is_active = TRUE
        `, [id]);
    }

    async findByCategory(categorySlug, options = {}) {
        const { limit = 20, offset = 0 } = options;

        return await this.db.all(`
            SELECT
                q.*,
                c.name as category_name,
                c.slug as category_slug
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE c.slug = ? AND q.is_active = TRUE
            ORDER BY q.created_at DESC
            LIMIT ? OFFSET ?
        `, [categorySlug, limit, offset]);
    }

    async getCount(options = {}) {
        const { category_id, difficulty, search } = options;

        let sql = 'SELECT COUNT(*) as count FROM questions WHERE is_active = TRUE';
        const params = [];

        if (category_id) {
            sql += ' AND category_id = ?';
            params.push(category_id);
        }

        if (difficulty) {
            sql += ' AND difficulty_level = ?';
            params.push(difficulty);
        }

        if (search) {
            sql += ' AND (question_text LIKE ? OR answer LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const result = await this.db.get(sql, params);
        return result.count;
    }

    async create(questionData) {
        const { uuid, category_id, question_text, answer, explanation, difficulty_level, question_type, tags, estimated_time } = questionData;

        const result = await this.db.run(`
            INSERT INTO questions (uuid, category_id, question_text, answer, explanation,
                                 difficulty_level, question_type, tags, estimated_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [uuid, category_id, question_text, answer, explanation, difficulty_level || 3,
            question_type || 'theoretical', JSON.stringify(tags || []), estimated_time || 5]);

        return this.findById(result.id);
    }

    // Enhanced search methods with full-text search
    async searchFullText(query, options = {}) {
        const { limit = 20, offset = 0, category_id, difficulty } = options;

        let sql = `
            SELECT
                q.*,
                c.name as category_name,
                c.slug as category_slug,
                snippet(questions_fts, 0, '<mark>', '</mark>', '...', 32) as snippet,
                bm25(questions_fts) as relevance_score
            FROM questions_fts fts
            JOIN questions q ON q.id = fts.rowid
            JOIN categories c ON q.category_id = c.id
            WHERE fts MATCH ? AND q.is_active = TRUE
        `;

        const params = [query];

        if (category_id) {
            sql += ' AND q.category_id = ?';
            params.push(category_id);
        }

        if (difficulty) {
            sql += ' AND q.difficulty_level = ?';
            params.push(difficulty);
        }

        sql += ' ORDER BY bm25(questions_fts) LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await this.db.all(sql, params);
    }

    async getSuggestions(partialQuery, limit = 10) {
        // Get autocomplete suggestions based on question content
        const sql = `
            SELECT DISTINCT
                substr(question_text, 1, 100) as suggestion,
                category_name,
                COUNT(*) as frequency
            FROM questions_fts
            WHERE questions_fts MATCH ?
            GROUP BY substr(question_text, 1, 100), category_name
            ORDER BY frequency DESC, length(suggestion) ASC
            LIMIT ?
        `;

        return await this.db.all(sql, [`${partialQuery}*`, limit]);
    }

    async getRelatedQuestions(questionId, limit = 5) {
        // Find questions with similar tags or in the same category
        const sql = `
            SELECT
                q2.*,
                c.name as category_name,
                c.slug as category_slug
            FROM questions q1
            JOIN questions q2 ON q1.category_id = q2.category_id AND q1.id != q2.id
            JOIN categories c ON q2.category_id = c.id
            WHERE q1.id = ? AND q2.is_active = TRUE
            ORDER BY
                CASE WHEN q1.difficulty_level = q2.difficulty_level THEN 1 ELSE 2 END,
                RANDOM()
            LIMIT ?
        `;

        return await this.db.all(sql, [questionId, limit]);
    }
}

// User Progress Model
class UserProgressModel {
    constructor(db) {
        this.db = db;
    }

    async updateProgress(userId, trackId, dayNumber, progressData) {
        const { status, completion_percentage, time_spent, notes } = progressData;

        const existing = await this.db.get(`
            SELECT id FROM user_progress
            WHERE user_id = ? AND track_id = ? AND day_number = ?
        `, [userId, trackId, dayNumber]);

        if (existing) {
            return await this.db.run(`
                UPDATE user_progress
                SET status = ?, completion_percentage = ?, time_spent = ?, notes = ?,
                    completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
                WHERE id = ?
            `, [status, completion_percentage, time_spent, notes, status, existing.id]);
        } else {
            return await this.db.run(`
                INSERT INTO user_progress (user_id, track_id, day_number, status,
                                         completion_percentage, time_spent, notes,
                                         started_at, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?,
                        CASE WHEN ? != 'not_started' THEN CURRENT_TIMESTAMP END,
                        CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP END)
            `, [userId, trackId, dayNumber, status, completion_percentage, time_spent, notes, status, status]);
        }
    }

    async getUserProgress(userId, trackId = null) {
        let sql = `
            SELECT
                up.*,
                t.name as track_name,
                t.slug as track_slug,
                td.title as day_title
            FROM user_progress up
            JOIN tracks t ON up.track_id = t.id
            JOIN track_days td ON up.track_id = td.track_id AND up.day_number = td.day_number
            WHERE up.user_id = ?
        `;

        const params = [userId];

        if (trackId) {
            sql += ' AND up.track_id = ?';
            params.push(trackId);
        }

        sql += ' ORDER BY up.track_id, up.day_number';

        return await this.db.all(sql, params);
    }

    async getUserStats(userId) {
        return await this.db.get(`
            SELECT
                COUNT(*) as total_days,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_days,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_days,
                COALESCE(SUM(time_spent), 0) as total_time_spent,
                COUNT(DISTINCT track_id) as active_tracks
            FROM user_progress
            WHERE user_id = ?
        `, [userId]);
    }
}

// Session Model
class SessionModel {
    constructor(db) {
        this.db = db;
    }

    async create(sessionData) {
        const { session_id, user_id, token, device_info, ip_address, user_agent, expires_at } = sessionData;

        const result = await this.db.run(`
            INSERT INTO sessions (session_id, user_id, token, device_info, ip_address,
                                user_agent, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [session_id, user_id, token, JSON.stringify(device_info), ip_address, user_agent, expires_at]);

        return this.findById(result.id);
    }

    async findById(id) {
        return await this.db.get('SELECT * FROM sessions WHERE id = ?', [id]);
    }

    async findByToken(token) {
        return await this.db.get(`
            SELECT * FROM sessions
            WHERE token = ? AND is_active = TRUE AND expires_at > CURRENT_TIMESTAMP
        `, [token]);
    }

    async deactivate(sessionId) {
        return await this.db.run('UPDATE sessions SET is_active = FALSE WHERE session_id = ?', [sessionId]);
    }

    async cleanupExpired() {
        return await this.db.run('UPDATE sessions SET is_active = FALSE WHERE expires_at <= CURRENT_TIMESTAMP');
    }
}

// ===============================
// PASSWORD RESET MODEL
// ===============================
class PasswordResetModel extends BaseModel {
    constructor(db) {
        super(db, 'password_reset_tokens');
    }

    async createToken(userId, email, token, expiresInMinutes = 30) {
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

        // Invalidate any existing tokens for this user
        await this.query(`
            UPDATE password_reset_tokens
            SET used_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND used_at IS NULL
        `, [userId]);

        // Create new token
        return this.create({
            user_id: userId,
            token: token,
            email: email,
            expires_at: expiresAt
        });
    }

    async findValidToken(token) {
        return this.query(`
            SELECT prt.*, u.email as current_email, u.username
            FROM password_reset_tokens prt
            JOIN users u ON prt.user_id = u.id
            WHERE prt.token = ?
              AND prt.used_at IS NULL
              AND prt.expires_at > CURRENT_TIMESTAMP
        `, [token]);
    }

    async markTokenUsed(token) {
        return this.query(`
            UPDATE password_reset_tokens
            SET used_at = CURRENT_TIMESTAMP
            WHERE token = ?
        `, [token]);
    }

    async cleanupExpiredTokens() {
        return this.query(`
            DELETE FROM password_reset_tokens
            WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL
        `);
    }
}

// ===============================
// EMAIL VERIFICATION MODEL
// ===============================
class EmailVerificationModel extends BaseModel {
    constructor(db) {
        super(db, 'email_verification_tokens');
    }

    async createToken(userId, email, token, expiresInHours = 24) {
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

        // Invalidate any existing tokens for this user
        await this.query(`
            UPDATE email_verification_tokens
            SET verified_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND verified_at IS NULL
        `, [userId]);

        // Create new token
        return this.create({
            user_id: userId,
            token: token,
            email: email,
            expires_at: expiresAt
        });
    }

    async findValidToken(token) {
        return this.query(`
            SELECT evt.*, u.username, u.email_verified
            FROM email_verification_tokens evt
            JOIN users u ON evt.user_id = u.id
            WHERE evt.token = ?
              AND evt.verified_at IS NULL
              AND evt.expires_at > CURRENT_TIMESTAMP
        `, [token]);
    }

    async markTokenVerified(token) {
        return this.query(`
            UPDATE email_verification_tokens
            SET verified_at = CURRENT_TIMESTAMP
            WHERE token = ?
        `, [token]);
    }

    async cleanupExpiredTokens() {
        return this.query(`
            DELETE FROM email_verification_tokens
            WHERE expires_at < CURRENT_TIMESTAMP OR verified_at IS NOT NULL
        `);
    }
}

// Main Database Manager
class DatabaseManager {
    constructor() {
        this.db = new Database();
        this.users = new UserModel(this.db);
        this.categories = new CategoryModel(this.db);
        this.tracks = new TrackModel(this.db);
        this.questions = new QuestionModel(this.db);
        this.userProgress = new UserProgressModel(this.db);
        this.sessions = new SessionModel(this.db);
        this.passwordResets = new PasswordResetModel(this.db);
        this.emailVerifications = new EmailVerificationModel(this.db);
    }

    async connect() {
        return await this.db.connect();
    }

    async close() {
        return await this.db.close();
    }

    async healthCheck() {
        try {
            await this.db.get('SELECT 1');
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
        }
    }
}

// Export singleton instance
const dbManager = new DatabaseManager();

module.exports = {
    DatabaseManager,
    Database,
    UserModel,
    CategoryModel,
    TrackModel,
    QuestionModel,
    UserProgressModel,
    SessionModel,
    PasswordResetModel,
    EmailVerificationModel,
    db: dbManager
};