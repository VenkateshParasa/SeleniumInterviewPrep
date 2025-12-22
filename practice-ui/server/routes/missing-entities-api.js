// Missing Entities API Routes
// Practice Exercises, Resources, Achievements, and Study Sessions
// Created: December 19, 2025

const express = require('express');
const { db } = require('../../database/models');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ===================================
// PRACTICE EXERCISES ROUTES
// ===================================

// GET /api/v2/exercises - List practice exercises with filtering
router.get('/exercises', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;

        const options = {
            limit,
            offset,
            exercise_type: req.query.exercise_type,
            difficulty: req.query.difficulty ? parseInt(req.query.difficulty) : null
        };

        const exercises = await db.practiceExercises.findAll(options);

        res.json({
            success: true,
            data: exercises,
            pagination: {
                page,
                limit,
                total: exercises.length,
                hasNext: exercises.length === limit,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve practice exercises'
        });
    }
});

// GET /api/v2/exercises/:id - Get single practice exercise
router.get('/exercises/:id', async (req, res) => {
    try {
        const exerciseId = parseInt(req.params.id);
        const exercise = await db.practiceExercises.findById(exerciseId);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Practice exercise not found'
            });
        }

        res.json({
            success: true,
            data: exercise
        });
    } catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve practice exercise'
        });
    }
});

// POST /api/v2/exercises - Create new practice exercise (admin only)
router.post('/exercises', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const exerciseData = req.body;
        const exercise = await db.practiceExercises.create(exerciseData);

        res.status(201).json({
            success: true,
            data: exercise,
            message: 'Practice exercise created successfully'
        });
    } catch (error) {
        console.error('Create exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create practice exercise'
        });
    }
});

// PUT /api/v2/exercises/:id - Update practice exercise (admin only)
router.put('/exercises/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const exerciseId = parseInt(req.params.id);
        const updates = req.body;

        const exercise = await db.practiceExercises.update(exerciseId, updates);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Practice exercise not found'
            });
        }

        res.json({
            success: true,
            data: exercise,
            message: 'Practice exercise updated successfully'
        });
    } catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update practice exercise'
        });
    }
});

// DELETE /api/v2/exercises/:id - Delete practice exercise (admin only)
router.delete('/exercises/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const exerciseId = parseInt(req.params.id);
        await db.practiceExercises.delete(exerciseId);

        res.json({
            success: true,
            message: 'Practice exercise deleted successfully'
        });
    } catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete practice exercise'
        });
    }
});

// ===================================
// RESOURCES ROUTES
// ===================================

// GET /api/v2/resources - List learning resources
router.get('/resources', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;

        const options = {
            limit,
            offset,
            resource_type: req.query.resource_type,
            difficulty: req.query.difficulty ? parseInt(req.query.difficulty) : null,
            category_id: req.query.category_id ? parseInt(req.query.category_id) : null
        };

        const resources = await db.resources.findAll(options);

        res.json({
            success: true,
            data: resources,
            pagination: {
                page,
                limit,
                total: resources.length,
                hasNext: resources.length === limit,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve resources'
        });
    }
});

// GET /api/v2/resources/:id - Get single resource
router.get('/resources/:id', async (req, res) => {
    try {
        const resourceId = parseInt(req.params.id);
        const resource = await db.resources.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }

        res.json({
            success: true,
            data: resource
        });
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve resource'
        });
    }
});

// POST /api/v2/resources - Create new resource (admin only)
router.post('/resources', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const resourceData = req.body;
        const resource = await db.resources.create(resourceData);

        res.status(201).json({
            success: true,
            data: resource,
            message: 'Resource created successfully'
        });
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create resource'
        });
    }
});

// PUT /api/v2/resources/:id - Update resource (admin only)
router.put('/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const resourceId = parseInt(req.params.id);
        const updates = req.body;

        const resource = await db.resources.update(resourceId, updates);

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }

        res.json({
            success: true,
            data: resource,
            message: 'Resource updated successfully'
        });
    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update resource'
        });
    }
});

// DELETE /api/v2/resources/:id - Delete resource (admin only)
router.delete('/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const resourceId = parseInt(req.params.id);
        await db.resources.delete(resourceId);

        res.json({
            success: true,
            message: 'Resource deleted successfully'
        });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete resource'
        });
    }
});

// ===================================
// ACHIEVEMENTS ROUTES
// ===================================

// GET /api/v2/achievements - List user achievements
router.get('/achievements', optionalAuth, async (req, res) => {
    try {
        if (!req.user) {
            // Return default achievements for anonymous users
            const defaultAchievements = [
                { id: 'first_streak', name: 'First Streak', icon: '🔥', description: 'Study for 3 consecutive days', progress: 0, target: 3, unlocked: false },
                { id: 'question_master', name: 'Question Master', icon: '🎯', description: 'Answer 50 questions correctly', progress: 0, target: 50, unlocked: false },
                { id: 'social_learner', name: 'Social Learner', icon: '👥', description: 'Join your first study group', progress: 0, target: 1, unlocked: false }
            ];
            
            return res.json({
                success: true,
                data: defaultAchievements,
                message: 'Anonymous user achievements'
            });
        }

        const achievements = await db.userAchievements.findByUser(req.user.id);

        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve achievements'
        });
    }
});

// POST /api/v2/achievements - Award achievement (system/admin only)
router.post('/achievements', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const achievementData = req.body;
        const achievement = await db.userAchievements.create(achievementData);

        res.status(201).json({
            success: true,
            data: achievement,
            message: 'Achievement awarded successfully'
        });
    } catch (error) {
        console.error('Award achievement error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to award achievement'
        });
    }
});

// GET /api/v2/achievements/available - List available achievements
router.get('/achievements/available', async (req, res) => {
    try {
        // Mock available achievements - in real implementation, this would come from a configuration
        const availableAchievements = [
            {
                type: 'first_question',
                title: 'First Steps',
                description: 'Answer your first question',
                icon: 'fas fa-baby',
                points: 10
            },
            {
                type: 'streak_7',
                title: 'Week Warrior',
                description: 'Study for 7 consecutive days',
                icon: 'fas fa-fire',
                points: 50
            },
            {
                type: 'questions_100',
                title: 'Century Club',
                description: 'Answer 100 questions correctly',
                icon: 'fas fa-trophy',
                points: 100
            },
            {
                type: 'category_master',
                title: 'Category Master',
                description: 'Complete all questions in a category',
                icon: 'fas fa-crown',
                points: 200
            }
        ];

        res.json({
            success: true,
            data: availableAchievements
        });
    } catch (error) {
        console.error('Get available achievements error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve available achievements'
        });
    }
});

// GET /api/v2/leaderboard - Achievement-based leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const achievementType = req.query.type || null;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const leaderboard = await db.userAchievements.getLeaderboard(achievementType, limit);

        res.json({
            success: true,
            data: leaderboard,
            meta: {
                type: achievementType || 'all',
                limit
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve leaderboard'
        });
    }
});

// ===================================
// STUDY SESSIONS ROUTES
// ===================================

// POST /api/v2/sessions/start - Start study session
router.post('/sessions/start', authenticateToken, async (req, res) => {
    try {
        const sessionData = {
            user_id: req.user.id,
            session_type: req.body.session_type || 'mixed',
            track_id: req.body.track_id || null,
            day_number: req.body.day_number || null,
            started_at: new Date().toISOString(),
            duration: 0 // Will be updated when session ends
        };

        const session = await db.studySessions.create(sessionData);

        res.status(201).json({
            success: true,
            data: session,
            message: 'Study session started successfully'
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start study session'
        });
    }
});

// PUT /api/v2/sessions/:id/end - End study session
router.put('/sessions/:id/end', authenticateToken, async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        const endData = req.body;

        const session = await db.studySessions.endSession(sessionId, endData);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Study session not found'
            });
        }

        res.json({
            success: true,
            data: session,
            message: 'Study session ended successfully'
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end study session'
        });
    }
});

// GET /api/v2/sessions/history - Get user's study history
router.get('/sessions/history', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;

        const options = {
            limit,
            offset,
            session_type: req.query.session_type,
            track_id: req.query.track_id ? parseInt(req.query.track_id) : null
        };

        const sessions = await db.studySessions.findByUser(req.user.id, options);

        res.json({
            success: true,
            data: sessions,
            pagination: {
                page,
                limit,
                total: sessions.length,
                hasNext: sessions.length === limit,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get session history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve session history'
        });
    }
});

// GET /api/v2/sessions/analytics - Get study analytics
router.get('/sessions/analytics', authenticateToken, async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30 days';
        const stats = await db.studySessions.getUserStats(req.user.id, timeframe);

        res.json({
            success: true,
            data: stats,
            meta: {
                timeframe,
                user_id: req.user.id
            }
        });
    } catch (error) {
        console.error('Get session analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve session analytics'
        });
    }
});

// ===================================
// ERROR HANDLING
// ===================================

router.use((err, req, res, next) => {
    console.error('Missing Entities API Error:', err);

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