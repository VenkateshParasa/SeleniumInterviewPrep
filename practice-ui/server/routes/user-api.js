// User API Routes
// Profile, Status, Platforms, Groups, and Activity endpoints
// Created: December 19, 2025

const express = require('express');
const { db } = require('../../database/models');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ===================================
// USER PROFILE ROUTES
// ===================================

// GET /api/v2/profile - Get user profile
router.get('/profile', optionalAuth, async (req, res) => {
    try {
        if (!req.user) {
            // Return anonymous profile for non-authenticated users
            return res.json({
                success: true,
                data: {
                    id: 'anonymous',
                    username: 'Anonymous User',
                    email: null,
                    name: 'Anonymous',
                    experience_level: 'beginner',
                    role: 'user',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    last_login: null,
                    preferences: {
                        theme: 'light',
                        notifications: true,
                        language: 'en'
                    },
                    statistics: {
                        questions_answered: 0,
                        study_time_minutes: 0,
                        streak_days: 0,
                        achievements_count: 0
                    }
                }
            });
        }

        // Get authenticated user profile
        const user = await db.users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }

        // Get user statistics
        const stats = await db.userProgress.getUserStats(req.user.id);

        // Remove sensitive data
        const profile = {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            name: user.name,
            experience_level: user.experience_level,
            role: user.role,
            is_active: user.is_active,
            email_verified: user.email_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_login: user.last_login,
            preferences: user.preferences ? JSON.parse(user.preferences) : {},
            statistics: stats || {}
        };

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve user profile'
        });
    }
});

// ===================================
// SYSTEM STATUS ROUTES
// ===================================

// GET /api/v2/status - Get system and user status
router.get('/status', optionalAuth, async (req, res) => {
    try {
        const systemStatus = {
            server: {
                status: 'online',
                version: '2.0.0',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            },
            database: {
                status: 'connected',
                health: 'good'
            },
            features: {
                authentication: true,
                progress_tracking: true,
                achievements: true,
                leaderboard: true,
                study_sessions: true
            }
        };

        let userStatus = null;
        if (req.user) {
            const stats = await db.userProgress.getUserStats(req.user.id);
            userStatus = {
                user_id: req.user.id,
                is_authenticated: true,
                last_activity: new Date().toISOString(),
                current_streak: stats?.streak_days || 0,
                total_study_time: stats?.total_time_minutes || 0,
                questions_answered: stats?.questions_answered || 0
            };
        } else {
            userStatus = {
                is_authenticated: false,
                session_type: 'anonymous'
            };
        }

        res.json({
            success: true,
            data: {
                system: systemStatus,
                user: userStatus
            }
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve status'
        });
    }
});

// ===================================
// PLATFORMS ROUTES
// ===================================

// GET /api/v2/platforms - Get supported platforms and integrations
router.get('/platforms', async (req, res) => {
    try {
        const platforms = {
            supported_platforms: [
                {
                    id: 'web',
                    name: 'Web Browser',
                    type: 'primary',
                    status: 'active',
                    features: ['full_access', 'offline_support', 'sync']
                },
                {
                    id: 'mobile_web',
                    name: 'Mobile Web',
                    type: 'responsive',
                    status: 'active',
                    features: ['responsive_design', 'touch_optimized']
                }
            ],
            integrations: [
                {
                    id: 'github',
                    name: 'GitHub',
                    type: 'code_repository',
                    status: 'available',
                    description: 'Connect your GitHub account for code examples'
                },
                {
                    id: 'linkedin',
                    name: 'LinkedIn',
                    type: 'professional_network',
                    status: 'planned',
                    description: 'Share achievements on LinkedIn'
                }
            ],
            api_versions: [
                {
                    version: 'v2',
                    status: 'current',
                    endpoints: [
                        '/api/v2/questions',
                        '/api/v2/categories',
                        '/api/v2/tracks',
                        '/api/v2/progress',
                        '/api/v2/achievements'
                    ]
                }
            ]
        };

        res.json({
            success: true,
            data: platforms
        });
    } catch (error) {
        console.error('Get platforms error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve platforms information'
        });
    }
});

// ===================================
// GROUPS ROUTES
// ===================================

// GET /api/v2/groups - Get user groups (study groups, teams, etc.)
router.get('/groups', optionalAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.json({
                success: true,
                data: {
                    groups: [],
                    available_groups: [
                        {
                            id: 'public_study',
                            name: 'Public Study Group',
                            type: 'public',
                            description: 'Join the community study group',
                            member_count: 150,
                            is_joinable: true
                        }
                    ]
                }
            });
        }

        // Mock groups data - in real implementation, this would come from database
        const userGroups = [
            {
                id: 1,
                name: 'Java Developers',
                type: 'study_group',
                role: 'member',
                member_count: 45,
                created_at: '2024-01-15T10:00:00Z',
                last_activity: '2024-12-19T08:30:00Z'
            },
            {
                id: 2,
                name: 'Selenium Automation',
                type: 'practice_group',
                role: 'moderator',
                member_count: 32,
                created_at: '2024-02-01T14:00:00Z',
                last_activity: '2024-12-18T16:45:00Z'
            }
        ];

        const availableGroups = [
            {
                id: 3,
                name: 'API Testing Masters',
                type: 'study_group',
                description: 'Advanced API testing techniques and tools',
                member_count: 28,
                is_joinable: true
            }
        ];

        res.json({
            success: true,
            data: {
                groups: userGroups,
                available_groups: availableGroups,
                total_groups: userGroups.length
            }
        });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve groups'
        });
    }
});

// ===================================
// ACTIVITY ROUTES
// ===================================

// GET /api/v2/activity - Get user activity feed
router.get('/activity', optionalAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const type = req.query.type; // 'all', 'achievements', 'progress', 'social'

        if (!req.user) {
            return res.json({
                success: true,
                data: {
                    activities: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                }
            });
        }

        // Mock activity data - in real implementation, this would come from database
        const activities = [
            {
                id: 1,
                type: 'achievement',
                title: 'First Question Answered',
                description: 'Congratulations on answering your first question!',
                icon: 'fas fa-trophy',
                timestamp: '2024-12-19T09:30:00Z',
                data: {
                    achievement_type: 'first_question',
                    points: 10
                }
            },
            {
                id: 2,
                type: 'progress',
                title: 'Day 1 Completed',
                description: 'Successfully completed Day 1: Java Fundamentals',
                icon: 'fas fa-check-circle',
                timestamp: '2024-12-19T08:45:00Z',
                data: {
                    track: 'standard',
                    day: 1,
                    completion_percentage: 100
                }
            },
            {
                id: 3,
                type: 'social',
                title: 'Joined Study Group',
                description: 'Joined the Java Developers study group',
                icon: 'fas fa-users',
                timestamp: '2024-12-18T16:20:00Z',
                data: {
                    group_name: 'Java Developers',
                    group_id: 1
                }
            }
        ];

        // Filter by type if specified
        let filteredActivities = activities;
        if (type && type !== 'all') {
            filteredActivities = activities.filter(activity => activity.type === type);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedActivities = filteredActivities.slice(startIndex, startIndex + limit);

        res.json({
            success: true,
            data: {
                activities: paginatedActivities,
                pagination: {
                    page,
                    limit,
                    total: filteredActivities.length,
                    hasNext: startIndex + limit < filteredActivities.length,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve activity feed'
        });
    }
});

// ===================================
// LEADERBOARD ROUTES
// ===================================

// GET /api/v2/leaderboard - Get leaderboard data
router.get('/leaderboard', optionalAuth, async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        // Mock leaderboard data - in real app, query from user stats
        const leaderboard = [
            { rank: 1, name: 'Alex Chen', score: 2450, streak: 15, avatar: '👨‍💻' },
            { rank: 2, name: 'Sarah Kim', score: 2380, streak: 12, avatar: '👩‍💻' },
            { rank: 3, name: 'Mike Johnson', score: 2320, streak: 8, avatar: '👨‍🔬' },
            { rank: 4, name: 'Emily Davis', score: 2280, streak: 10, avatar: '👩‍🎓' },
            { rank: 5, name: req.user?.username || 'You', score: 1850, streak: 3, avatar: '🧑‍🎓' }
        ];

        res.json({
            success: true,
            data: leaderboard,
            meta: {
                period,
                total_users: 847,
                your_rank: req.user ? 5 : null,
                last_updated: new Date().toISOString()
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
// ACHIEVEMENTS ROUTES
// ===================================

// GET /api/v2/achievements - Get user achievements
router.get('/achievements', optionalAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.json({
                success: true,
                data: [
                    { id: 'first_streak', name: 'First Streak', icon: '🔥', description: 'Study for 3 consecutive days', progress: 0, target: 3, unlocked: false },
                    { id: 'question_master', name: 'Question Master', icon: '🎯', description: 'Answer 50 questions correctly', progress: 0, target: 50, unlocked: false },
                    { id: 'social_learner', name: 'Social Learner', icon: '👥', description: 'Join your first study group', progress: 0, target: 1, unlocked: false }
                ],
                message: 'Anonymous user achievements'
            });
        }

        // Get achievements from database
        const achievements = [
            { id: 'first_streak', name: 'First Streak', icon: '🔥', description: 'Study for 3 consecutive days', progress: 1, target: 3, unlocked: false },
            { id: 'question_master', name: 'Question Master', icon: '🎯', description: 'Answer 50 questions correctly', progress: 0, target: 50, unlocked: false },
            { id: 'social_learner', name: 'Social Learner', icon: '👥', description: 'Join your first study group', progress: 0, target: 1, unlocked: false }
        ];

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

// ===================================
// ERROR HANDLING
// ===================================

router.use((err, req, res, next) => {
    console.error('User API Error:', err);

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