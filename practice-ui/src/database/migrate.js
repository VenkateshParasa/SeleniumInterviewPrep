// Database Migration and Seeding Script
// Interview Prep Platform - SQLite Setup
// Created: December 15, 2025

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class DatabaseManager {
    constructor() {
        this.dbPath = path.join(__dirname, 'interview_prep.db');
        this.schemaPath = path.join(__dirname, 'schema.sql');
        this.seedDataPath = path.join(__dirname, '../public/data');
        this.db = null;
    }

    // Initialize database connection
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    resolve(this.db);
                }
            });
        });
    }

    // Close database connection
    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('✅ Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // Run SQL queries
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Get single result
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get multiple results
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Create database schema
    async createSchema() {
        try {
            console.log('📋 Creating database schema...');
            const schema = await fs.readFile(this.schemaPath, 'utf8');

            // Split schema into individual statements, handling triggers properly
            const statements = [];
            let currentStatement = '';
            let inTrigger = false;

            const lines = schema.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();

                // Skip comments and empty lines
                if (trimmedLine.startsWith('--') || trimmedLine === '') {
                    continue;
                }

                currentStatement += line + '\n';

                // Check for CREATE TRIGGER
                if (trimmedLine.toUpperCase().includes('CREATE TRIGGER')) {
                    inTrigger = true;
                }

                // Check for END (trigger end)
                if (inTrigger && trimmedLine.toUpperCase() === 'END;') {
                    statements.push(currentStatement.trim());
                    currentStatement = '';
                    inTrigger = false;
                    continue;
                }

                // Regular statement end
                if (!inTrigger && trimmedLine.endsWith(';') && !trimmedLine.toUpperCase().includes('CREATE TRIGGER')) {
                    statements.push(currentStatement.trim());
                    currentStatement = '';
                }
            }

            // Execute each statement
            for (const statement of statements) {
                if (statement.length > 0) {
                    try {
                        await this.run(statement);
                    } catch (error) {
                        console.error(`❌ Failed to execute statement: ${statement.substring(0, 100)}...`);
                        throw error;
                    }
                }
            }

            console.log('✅ Database schema created successfully');
        } catch (error) {
            console.error('❌ Schema creation failed:', error);
            throw error;
        }
    }

    // Seed categories data
    async seedCategories() {
        console.log('🏷️ Seeding categories...');

        const categories = [
            {
                slug: 'java',
                name: 'Java Programming',
                description: 'Core Java concepts, OOP, collections, concurrency, and advanced features',
                icon: '☕',
                color: '#ED8B00',
                sort_order: 1
            },
            {
                slug: 'selenium',
                name: 'Selenium WebDriver',
                description: 'Web automation testing with Selenium WebDriver, page objects, and best practices',
                icon: '🔧',
                color: '#43B02A',
                sort_order: 2
            },
            {
                slug: 'api-testing',
                name: 'API Testing',
                description: 'REST API testing, HTTP methods, status codes, authentication, and tools',
                icon: '🌐',
                color: '#0EA5E9',
                sort_order: 3
            },
            {
                slug: 'testng',
                name: 'TestNG Framework',
                description: 'TestNG annotations, test suites, data providers, and parallel execution',
                icon: '🧪',
                color: '#DC2626',
                sort_order: 4
            },
            {
                slug: 'framework',
                name: 'Test Framework Design',
                description: 'Test automation frameworks, design patterns, and architecture',
                icon: '🏗️',
                color: '#7C3AED',
                sort_order: 5
            },
            {
                slug: 'leadership',
                name: 'Leadership & Management',
                description: 'Team leadership, project management, and career development',
                icon: '👑',
                color: '#F59E0B',
                sort_order: 6
            }
        ];

        for (const category of categories) {
            await this.run(`
                INSERT INTO categories (slug, name, description, icon, color, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [category.slug, category.name, category.description, category.icon, category.color, category.sort_order]);
        }

        console.log('✅ Categories seeded successfully');
    }

    // Seed tracks data
    async seedTracks() {
        console.log('🛤️ Seeding tracks...');

        const tracks = [
            {
                slug: 'fast',
                name: 'Fast Track (3 Days)',
                description: 'Intensive preparation for experienced professionals with limited time',
                difficulty_level: 'fast',
                total_days: 3,
                estimated_hours_per_day: 4.0,
                prerequisites: 'Strong programming background, 3+ years experience',
                learning_outcomes: 'Quick review of key concepts, advanced topics, interview simulation'
            },
            {
                slug: 'standard',
                name: 'Standard Track (14 Days)',
                description: 'Comprehensive preparation covering all essential topics systematically',
                difficulty_level: 'standard',
                total_days: 14,
                estimated_hours_per_day: 2.0,
                prerequisites: 'Basic programming knowledge, some testing experience',
                learning_outcomes: 'Complete coverage of Java, Selenium, API testing, frameworks'
            },
            {
                slug: 'comfortable',
                name: 'Comfortable Track (21 Days)',
                description: 'Relaxed pace with detailed explanations and extra practice time',
                difficulty_level: 'comfortable',
                total_days: 21,
                estimated_hours_per_day: 1.5,
                prerequisites: 'Programming basics, willing to learn',
                learning_outcomes: 'Thorough understanding with hands-on practice and projects'
            }
        ];

        for (const track of tracks) {
            await this.run(`
                INSERT INTO tracks (slug, name, description, difficulty_level, total_days,
                                  estimated_hours_per_day, prerequisites, learning_outcomes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [track.slug, track.name, track.description, track.difficulty_level,
                track.total_days, track.estimated_hours_per_day, track.prerequisites, track.learning_outcomes]);
        }

        console.log('✅ Tracks seeded successfully');
    }

    // Seed track days
    async seedTrackDays() {
        console.log('📅 Seeding track days...');

        // Get track IDs
        const tracks = await this.all('SELECT id, slug, total_days FROM tracks');

        for (const track of tracks) {
            for (let day = 1; day <= track.total_days; day++) {
                let title, description, objectives;

                if (track.slug === 'fast') {
                    const dayTitles = [
                        'Java & Selenium Fundamentals Review',
                        'API Testing & Framework Design',
                        'Advanced Topics & Mock Interviews'
                    ];
                    title = dayTitles[day - 1];
                    description = `Intensive ${title.toLowerCase()} session`;
                    objectives = `Master ${title.toLowerCase()} in accelerated format`;
                } else if (track.slug === 'standard') {
                    const dayMap = {
                        1: 'Java Basics & OOP Concepts',
                        2: 'Collections & Exception Handling',
                        3: 'Multithreading & Concurrency',
                        4: 'Selenium WebDriver Setup',
                        5: 'Element Identification & Actions',
                        6: 'Page Object Model',
                        7: 'TestNG Framework Basics',
                        8: 'Data-Driven Testing',
                        9: 'API Testing Fundamentals',
                        10: 'REST API Automation',
                        11: 'Framework Architecture',
                        12: 'CI/CD Integration',
                        13: 'Leadership & Communication',
                        14: 'Mock Interviews & Review'
                    };
                    title = dayMap[day];
                    description = `Comprehensive study of ${title.toLowerCase()}`;
                    objectives = `Understand and practice ${title.toLowerCase()}`;
                } else { // comfortable
                    // Similar to standard but with more days for practice
                    title = `Day ${day} - Gradual Learning`;
                    description = `Comfortable pace learning session`;
                    objectives = `Gradual mastery with extra practice time`;
                }

                await this.run(`
                    INSERT INTO track_days (track_id, day_number, title, description,
                                          learning_objectives, estimated_duration, difficulty_rating)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [track.id, day, title, description, objectives, 2.0, 3]);
            }
        }

        console.log('✅ Track days seeded successfully');
    }

    // Seed users (migrate from existing credentials)
    async seedUsers() {
        console.log('👥 Seeding users...');

        try {
            // Read existing credentials
            const credentialsPath = path.join(__dirname, '../server/config/credentials.json');
            const credentialsData = await fs.readFile(credentialsPath, 'utf8');
            const credentials = JSON.parse(credentialsData);

            for (const user of credentials.users) {
                // Map experience level to valid values
                let experienceLevel = user.experienceLevel || 'intermediate';
                const validLevels = ['beginner', 'intermediate', 'advanced', 'senior'];
                if (!validLevels.includes(experienceLevel)) {
                    experienceLevel = 'intermediate'; // Default fallback
                }

                await this.run(`
                    INSERT INTO users (uuid, username, email, password_hash, name,
                                     experience_level, role, is_active, email_verified, last_login)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    uuidv4(),
                    user.username,
                    user.email,
                    user.password, // Already bcrypt hashed from Phase 1
                    user.name,
                    experienceLevel,
                    user.role || 'user',
                    user.isActive,
                    false,
                    user.lastLogin || null
                ]);
            }

            console.log('✅ Users migrated successfully');
        } catch (error) {
            console.error('❌ User migration failed:', error);
            // Create default admin user if credentials file doesn't exist
            const adminPassword = await bcrypt.hash('admin123', 12);
            await this.run(`
                INSERT INTO users (uuid, username, email, password_hash, name,
                                 experience_level, role, is_active, email_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                uuidv4(),
                'admin',
                'admin@interview-prep.com',
                adminPassword,
                'Administrator',
                'senior',
                'admin',
                true,
                true
            ]);
            console.log('✅ Default admin user created');
        }
    }

    // Seed questions from existing JSON files
    async seedQuestions() {
        console.log('❓ Seeding questions...');

        try {
            // Read the clean questions file
            const questionsPath = path.join(this.seedDataPath, 'questions/interview-questions-fixed.json');
            const questionsData = await fs.readFile(questionsPath, 'utf8');
            const questions = JSON.parse(questionsData);

            // Get category mappings
            const categories = await this.all('SELECT id, slug FROM categories');
            const categoryMap = {};
            categories.forEach(cat => {
                categoryMap[cat.slug] = cat.id;
            });

            // Insert questions
            for (const category of questions.categories) {
                const categoryId = categoryMap[category.id];
                if (!categoryId) {
                    console.warn(`⚠️ Category ${category.id} not found, skipping questions`);
                    continue;
                }

                for (const question of category.questions || []) {
                    // Map difficulty to numeric value
                    let difficultyLevel = 3; // Default to medium
                    if (question.difficulty) {
                        const difficultyMap = {
                            'Easy': 2,
                            'easy': 2,
                            'Medium': 3,
                            'medium': 3,
                            'Hard': 4,
                            'hard': 4,
                            'Expert': 5,
                            'expert': 5,
                            'Beginner': 1,
                            'beginner': 1
                        };
                        difficultyLevel = difficultyMap[question.difficulty] || 3;
                    }

                    await this.run(`
                        INSERT INTO questions (uuid, category_id, question_text, answer,
                                             explanation, difficulty_level, question_type,
                                             tags, estimated_time)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        uuidv4(),
                        categoryId,
                        question.question,
                        question.answer || null,
                        question.explanation || null,
                        difficultyLevel,
                        question.type || 'theoretical',
                        JSON.stringify(question.tags || []),
                        question.estimatedTime || 5
                    ]);
                }
            }

            console.log('✅ Questions seeded successfully');
        } catch (error) {
            console.error('❌ Questions seeding failed:', error);
            throw error;
        }
    }

    // Run complete migration
    async migrate() {
        try {
            console.log('🚀 Starting database migration...\n');

            // Connect to database
            await this.connect();

            // Create schema
            await this.createSchema();

            // Seed data
            await this.seedCategories();
            await this.seedTracks();
            await this.seedTrackDays();
            await this.seedUsers();
            await this.seedQuestions();

            console.log('\n✅ Database migration completed successfully!');
            console.log('📊 Database statistics:');

            const stats = await this.getDatabaseStats();
            console.table(stats);

        } catch (error) {
            console.error('\n❌ Migration failed:', error);
            throw error;
        } finally {
            await this.close();
        }
    }

    // Get database statistics
    async getDatabaseStats() {
        const stats = {
            users: await this.get('SELECT COUNT(*) as count FROM users'),
            categories: await this.get('SELECT COUNT(*) as count FROM categories'),
            tracks: await this.get('SELECT COUNT(*) as count FROM tracks'),
            track_days: await this.get('SELECT COUNT(*) as count FROM track_days'),
            questions: await this.get('SELECT COUNT(*) as count FROM questions')
        };

        return Object.entries(stats).map(([table, result]) => ({
            Table: table,
            Records: result.count
        }));
    }

    // Backup existing data before migration
    async backup() {
        console.log('💾 Creating backup...');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, 'backups');

        try {
            await fs.mkdir(backupDir, { recursive: true });

            // Backup existing JSON files
            const sourceDir = path.join(__dirname, '../server');
            const backupPath = path.join(backupDir, `backup-${timestamp}`);

            await fs.mkdir(backupPath, { recursive: true });

            // Copy critical files
            const filesToBackup = [
                'config/credentials.json',
                'practice-data.json',
                'practice-data-senior.json'
            ];

            for (const file of filesToBackup) {
                const sourcePath = path.join(sourceDir, file);
                const destPath = path.join(backupPath, file);

                try {
                    await fs.mkdir(path.dirname(destPath), { recursive: true });
                    await fs.copyFile(sourcePath, destPath);
                } catch (err) {
                    console.warn(`⚠️ Could not backup ${file}:`, err.message);
                }
            }

            console.log(`✅ Backup created: ${backupPath}`);
        } catch (error) {
            console.error('❌ Backup failed:', error);
            throw error;
        }
    }
}

// Migration script execution
async function runMigration() {
    const dbManager = new DatabaseManager();

    try {
        // Create backup first
        await dbManager.backup();

        // Run migration
        await dbManager.migrate();

    } catch (error) {
        console.error('💥 Migration process failed:', error);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = DatabaseManager;

// Run migration if script is executed directly
if (require.main === module) {
    console.log('🎯 Interview Prep Platform - Database Migration');
    console.log('================================================\n');

    runMigration();
}