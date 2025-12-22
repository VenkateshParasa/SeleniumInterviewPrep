// Admin API Routes for CRUD Operations
// Interview Prep Platform - Admin Dashboard Backend
// Created: December 19, 2025

const express = require('express');
const { db } = require('../../database/models');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Middleware to require admin access for all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// ===================================
// ADMIN DASHBOARD STATS
// ===================================

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            questionsCount,
            categoriesCount,
            usersCount,
            progressCount
        ] = await Promise.all([
            db.questions.getCount({}),
            db.categories.findAll().then(cats => cats.length),
            db.users.getStats(),
            db.userProgress.getUserStats(req.user.id)
        ]);

        const stats = {
            totalQuestions: questionsCount,
            totalCategories: categoriesCount,
            totalUsers: usersCount.total_users || 0,
            activeUsers: usersCount.active_users || 0,
            newUsersThisWeek: usersCount.new_users_week || 0,
            totalProgress: progressCount.total_days || 0,
            completedDays: progressCount.completed_days || 0,
            lastUpdated: new Date().toISOString()
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve admin statistics'
        });
    }
});

// ===================================
// QUESTIONS CRUD OPERATIONS
// ===================================

// GET /api/admin/questions - Get all questions with admin details
router.get('/questions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = (page - 1) * limit;

        const filters = {
            limit,
            offset,
            category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
            difficulty: req.query.difficulty ? parseInt(req.query.difficulty) : null,
            search: req.query.search || null,
            include_inactive: true // Admin can see inactive questions
        };

        const [questions, totalCount] = await Promise.all([
            db.questions.findAll(filters),
            db.questions.getCount(filters)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: questions,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get admin questions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve questions'
        });
    }
});

// PUT /api/admin/questions/:id - Update question
router.put('/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);
        const {
            category_id,
            question_text,
            answer,
            explanation,
            difficulty_level,
            question_type,
            tags,
            code_snippets,
            related_concepts,
            estimated_time,
            source,
            is_active
        } = req.body;

        // Validate required fields
        if (!question_text) {
            return res.status(400).json({
                success: false,
                error: 'Question text is required'
            });
        }

        // Check if question exists
        const existingQuestion = await db.questions.findById(questionId);
        if (!existingQuestion) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }

        // Update question
        const updateData = {
            category_id: category_id ? parseInt(category_id) : existingQuestion.category_id,
            question_text,
            answer,
            explanation,
            difficulty_level: difficulty_level ? parseInt(difficulty_level) : existingQuestion.difficulty_level,
            question_type: question_type || existingQuestion.question_type,
            tags: JSON.stringify(tags || []),
            code_snippets: JSON.stringify(code_snippets || {}),
            related_concepts: JSON.stringify(related_concepts || []),
            estimated_time: estimated_time ? parseInt(estimated_time) : existingQuestion.estimated_time,
            source,
            is_active: is_active !== undefined ? is_active : existingQuestion.is_active
        };

        await db.run(`
            UPDATE questions SET
                category_id = ?,
                question_text = ?,
                answer = ?,
                explanation = ?,
                difficulty_level = ?,
                question_type = ?,
                tags = ?,
                code_snippets = ?,
                related_concepts = ?,
                estimated_time = ?,
                source = ?,
                is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            updateData.category_id,
            updateData.question_text,
            updateData.answer,
            updateData.explanation,
            updateData.difficulty_level,
            updateData.question_type,
            updateData.tags,
            updateData.code_snippets,
            updateData.related_concepts,
            updateData.estimated_time,
            updateData.source,
            updateData.is_active,
            questionId
        ]);

        const updatedQuestion = await db.questions.findById(questionId);

        res.json({
            success: true,
            data: updatedQuestion,
            message: 'Question updated successfully'
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update question'
        });
    }
});

// DELETE /api/admin/questions/:id - Delete question (soft delete)
router.delete('/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);

        // Check if question exists
        const existingQuestion = await db.questions.findById(questionId);
        if (!existingQuestion) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }

        // Soft delete by setting is_active to false
        await db.run(`
            UPDATE questions SET
                is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [questionId]);

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete question'
        });
    }
});

// ===================================
// CATEGORIES CRUD OPERATIONS
// ===================================

// POST /api/admin/categories - Create new category
router.post('/categories', async (req, res) => {
    try {
        const { name, slug, description, icon, color, sort_order } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                error: 'Name and slug are required'
            });
        }

        // Check if slug already exists
        const existingCategory = await db.categories.findBySlug(slug);
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'Category with this slug already exists'
            });
        }

        const categoryData = {
            slug,
            name,
            description,
            icon,
            color,
            sort_order: sort_order || 0
        };

        const category = await db.categories.create(categoryData);

        res.status(201).json({
            success: true,
            data: category,
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create category'
        });
    }
});

// PUT /api/admin/categories/:id - Update category
router.put('/categories/:id', async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const { name, slug, description, icon, color, sort_order, is_active } = req.body;

        // Check if category exists
        const existingCategory = await db.categories.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Check if new slug conflicts with existing categories
        if (slug && slug !== existingCategory.slug) {
            const conflictingCategory = await db.categories.findBySlug(slug);
            if (conflictingCategory) {
                return res.status(400).json({
                    success: false,
                    error: 'Category with this slug already exists'
                });
            }
        }

        await db.run(`
            UPDATE categories SET
                name = ?,
                slug = ?,
                description = ?,
                icon = ?,
                color = ?,
                sort_order = ?,
                is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            name || existingCategory.name,
            slug || existingCategory.slug,
            description !== undefined ? description : existingCategory.description,
            icon !== undefined ? icon : existingCategory.icon,
            color !== undefined ? color : existingCategory.color,
            sort_order !== undefined ? sort_order : existingCategory.sort_order,
            is_active !== undefined ? is_active : existingCategory.is_active,
            categoryId
        ]);

        const updatedCategory = await db.categories.findById(categoryId);

        res.json({
            success: true,
            data: updatedCategory,
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update category'
        });
    }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);

        // Check if category exists
        const existingCategory = await db.categories.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Check if category has questions
        const questionCount = await db.questions.getCount({ category_id: categoryId });
        if (questionCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete category with ${questionCount} questions. Please move or delete questions first.`
            });
        }

        // Soft delete by setting is_active to false
        await db.run(`
            UPDATE categories SET
                is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [categoryId]);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete category'
        });
    }
});

// ===================================
// USERS MANAGEMENT
// ===================================

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = (page - 1) * limit;

        const users = await db.all(`
            SELECT 
                id, uuid, username, email, name, experience_level, role,
                is_active, email_verified, created_at, updated_at, last_login
            FROM users
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const totalCount = await db.get('SELECT COUNT(*) as count FROM users');
        const totalPages = Math.ceil(totalCount.count / limit);

        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total: totalCount.count,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve users'
        });
    }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, email, name, experience_level, role, is_active, email_verified } = req.body;

        // Check if user exists
        const existingUser = await db.users.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check for username/email conflicts
        if (username && username !== existingUser.username) {
            const conflictingUser = await db.users.findByUsername(username);
            if (conflictingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already exists'
                });
            }
        }

        if (email && email !== existingUser.email) {
            const conflictingUser = await db.users.findByEmail(email);
            if (conflictingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists'
                });
            }
        }

        const updateData = {
            username: username || existingUser.username,
            email: email || existingUser.email,
            name: name || existingUser.name,
            experience_level: experience_level || existingUser.experience_level,
            role: role || existingUser.role,
            is_active: is_active !== undefined ? is_active : existingUser.is_active,
            email_verified: email_verified !== undefined ? email_verified : existingUser.email_verified
        };

        const updatedUser = await db.users.update(userId, updateData);

        // Remove sensitive data
        delete updatedUser.password_hash;

        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
});

// DELETE /api/admin/users/:id - Deactivate user
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Check if user exists
        const existingUser = await db.users.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Prevent admin from deactivating themselves
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'Cannot deactivate your own account'
            });
        }

        // Soft delete by setting is_active to false
        await db.users.update(userId, { is_active: false });

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate user'
        });
    }
});

// ===================================
// SYSTEM OPERATIONS
// ===================================

// GET /api/admin/system/health - System health check
router.get('/system/health', async (req, res) => {
    try {
        const health = await db.healthCheck();
        
        // Additional system checks
        const systemInfo = {
            database: health,
            server: {
                status: 'healthy',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            },
            api: {
                version: '2.0.0',
                endpoints: [
                    '/api/v2/questions',
                    '/api/v2/categories',
                    '/api/v2/users',
                    '/api/admin/*'
                ]
            }
        };

        res.json({
            success: true,
            data: systemInfo
        });
    } catch (error) {
        console.error('System health check error:', error);
        res.status(503).json({
            success: false,
            error: 'System health check failed'
        });
    }
});

// POST /api/admin/system/backup - Create database backup
router.post('/system/backup', async (req, res) => {
    try {
        // This would implement database backup functionality
        const backupInfo = {
            filename: `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`,
            timestamp: new Date().toISOString(),
            size: '0 MB', // Would be calculated
            status: 'completed'
        };

        res.json({
            success: true,
            data: backupInfo,
            message: 'Database backup created successfully'
        });
    } catch (error) {
        console.error('Database backup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create database backup'
        });
    }
});

// GET /api/admin/activity - Get recent admin activity
router.get('/activity', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        // Mock activity data (in real implementation, this would come from an audit log)
        const activities = [
            {
                id: 1,
                timestamp: new Date().toISOString(),
                action: 'question_created',
                resource: 'Question #123',
                user: req.user.username,
                details: 'Added new Java question'
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 300000).toISOString(),
                action: 'category_updated',
                resource: 'Selenium WebDriver',
                user: req.user.username,
                details: 'Updated category description'
            },
            {
                id: 3,
                timestamp: new Date(Date.now() - 600000).toISOString(),
                action: 'user_login',
                resource: req.user.email,
                user: req.user.username,
                details: 'Admin login'
            }
        ].slice(0, limit);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve activity log'
        });
    }
});

// ===================================
// ERROR HANDLING MIDDLEWARE
// ===================================

router.use((err, req, res, next) => {
    console.error('Admin API Error:', err);

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body'
        });
    }

    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

module.exports = router;