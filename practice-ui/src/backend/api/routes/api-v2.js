// RESTful API Endpoints for Interview Prep Platform
// Database-powered API with pagination, search, and filtering
// Created: December 15, 2025

const express = require('express');
const { db } = require('../../database/models');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ===================================
// CATEGORIES API
// ===================================

// GET /api/v2/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await db.categories.findAll();

        res.json({
            success: true,
            data: categories,
            meta: {
                total: categories.length
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve categories'
        });
    }
});

// GET /api/v2/categories/:slug - Get category by slug
router.get('/categories/:slug', async (req, res) => {
    try {
        const category = await db.categories.findBySlug(req.params.slug);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve category'
        });
    }
});

// ===================================
// TRACKS API
// ===================================

// GET /api/v2/tracks - Get all tracks
router.get('/tracks', async (req, res) => {
    try {
        const tracks = await db.tracks.findAll();

        res.json({
            success: true,
            data: tracks,
            meta: {
                total: tracks.length
            }
        });
    } catch (error) {
        console.error('Get tracks error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tracks'
        });
    }
});

// GET /api/v2/tracks/:slug - Get track with days
router.get('/tracks/:slug', async (req, res) => {
    try {
        const track = await db.tracks.findBySlug(req.params.slug);

        if (!track) {
            return res.status(404).json({
                success: false,
                error: 'Track not found'
            });
        }

        const trackWithDays = await db.tracks.findWithDays(track.id);

        res.json({
            success: true,
            data: trackWithDays
        });
    } catch (error) {
        console.error('Get track error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve track'
        });
    }
});

// GET /api/v2/tracks/:slug/progress - Get user progress for track (authenticated)
router.get('/tracks/:slug/progress', authenticateToken, async (req, res) => {
    try {
        const track = await db.tracks.findBySlug(req.params.slug);

        if (!track) {
            return res.status(404).json({
                success: false,
                error: 'Track not found'
            });
        }

        const progress = await db.tracks.getProgress(req.user.id, track.id);

        res.json({
            success: true,
            data: {
                track,
                progress
            }
        });
    } catch (error) {
        console.error('Get track progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve track progress'
        });
    }
});

// ===================================
// QUESTIONS API WITH PAGINATION
// ===================================

// GET /api/v2/questions - Get paginated questions with filtering
router.get('/questions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
        const offset = (page - 1) * limit;

        const filters = {
            limit,
            offset,
            category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
            difficulty: req.query.difficulty ? parseInt(req.query.difficulty) : null,
            search: req.query.search || null
        };

        // Get questions and total count
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
                hasPrev: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null
            }
        });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve questions'
        });
    }
});

// GET /api/v2/questions/:id - Get single question
router.get('/questions/:id', async (req, res) => {
    try {
        const question = await db.questions.findById(parseInt(req.params.id));

        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve question'
        });
    }
});

// GET /api/v2/categories/:slug/questions - Get questions by category with pagination
router.get('/categories/:slug/questions', async (req, res) => {
    try {
        const category = await db.categories.findBySlug(req.params.slug);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;

        const questions = await db.questions.findByCategory(req.params.slug, { limit, offset });
        const totalCount = await db.questions.getCount({ category_id: category.id });

        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: {
                category,
                questions
            },
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
        console.error('Get category questions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve category questions'
        });
    }
});

// POST /api/v2/questions - Create new question (authenticated)
router.post('/questions', authenticateToken, async (req, res) => {
    try {
        const { category_id, question_text, answer, explanation, difficulty_level, question_type, tags, estimated_time } = req.body;

        if (!category_id || !question_text) {
            return res.status(400).json({
                success: false,
                error: 'Category ID and question text are required'
            });
        }

        const questionData = {
            uuid: uuidv4(),
            category_id: parseInt(category_id),
            question_text,
            answer,
            explanation,
            difficulty_level: difficulty_level ? parseInt(difficulty_level) : 3,
            question_type: question_type || 'theoretical',
            tags: tags || [],
            estimated_time: estimated_time ? parseInt(estimated_time) : 5
        };

        const question = await db.questions.create(questionData);

        res.status(201).json({
            success: true,
            data: question,
            message: 'Question created successfully'
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create question'
        });
    }
});

// ===================================
// USER PROGRESS API
// ===================================

// GET /api/v2/progress - Get all user progress (authenticated)
router.get('/progress', authenticateToken, async (req, res) => {
    try {
        const trackId = req.query.track_id ? parseInt(req.query.track_id) : null;
        const progress = await db.userProgress.getUserProgress(req.user.id, trackId);

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve progress'
        });
    }
});

// POST /api/v2/progress - Update user progress (authenticated)
router.post('/progress', authenticateToken, async (req, res) => {
    try {
        const { track_id, day_number, status, completion_percentage, time_spent, notes } = req.body;

        if (!track_id || !day_number || !status) {
            return res.status(400).json({
                success: false,
                error: 'Track ID, day number, and status are required'
            });
        }

        const progressData = {
            status,
            completion_percentage: completion_percentage || 0,
            time_spent: time_spent || 0,
            notes: notes || null
        };

        await db.userProgress.updateProgress(req.user.id, parseInt(track_id), parseInt(day_number), progressData);

        // Return updated progress
        const updatedProgress = await db.userProgress.getUserProgress(req.user.id, parseInt(track_id));

        res.json({
            success: true,
            data: updatedProgress,
            message: 'Progress updated successfully'
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update progress'
        });
    }
});

// GET /api/v2/stats - Get user statistics (authenticated)
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await db.userProgress.getUserStats(req.user.id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve statistics'
        });
    }
});

// ===================================
// SEARCH API
// ===================================

// GET /api/v2/search - Global search across questions and content
router.get('/search', async (req, res) => {
    try {
        const { q: query, type = 'all', page = 1, limit = 20 } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters'
            });
        }

        const searchTerm = query.trim();
        const pageInt = parseInt(page);
        const limitInt = Math.min(parseInt(limit), 100);
        const offset = (pageInt - 1) * limitInt;

        let results = {};

        if (type === 'all' || type === 'questions') {
            const questions = await db.questions.findAll({
                search: searchTerm,
                limit: limitInt,
                offset: offset
            });

            const questionsCount = await db.questions.getCount({ search: searchTerm });

            results.questions = {
                data: questions,
                total: questionsCount,
                page: pageInt,
                totalPages: Math.ceil(questionsCount / limitInt)
            };
        }

        // Add more search types as needed (categories, tracks, etc.)

        res.json({
            success: true,
            query: searchTerm,
            results,
            meta: {
                searchType: type,
                executedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
});

// ===================================
// HEALTH CHECK API
// ===================================

// GET /api/v2/health - Database health check
router.get('/health', async (req, res) => {
    try {
        const health = await db.healthCheck();

        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            success: false,
            error: 'Database health check failed'
        });
    }
});

// ===================================
// ERROR HANDLING MIDDLEWARE
// ===================================

// Global error handler for API routes
router.use((err, req, res, next) => {
    console.error('API Error:', err);

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