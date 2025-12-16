// Authentication Middleware for Database-powered API
// Interview Prep Platform - JWT Authentication with Database Sessions
// Created: December 15, 2025

const jwt = require('jsonwebtoken');
const { db } = require('../../database/models');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT tokens with database validation
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if session is still valid in database
        const session = await db.sessions.findByToken(token);

        if (!session) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        // Find user by ID
        const user = await db.users.findById(session.user_id);

        if (!user || !user.is_active) {
            return res.status(403).json({
                success: false,
                error: 'User not found or inactive'
            });
        }

        // Attach user info to request
        req.user = {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            name: user.name,
            experience_level: user.experience_level,
            role: user.role || 'user'
        };

        // Update last activity
        await db.db.run('UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ?', [session.id]);

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                error: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}

// Middleware to check if user has specific role
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        const requiredRoles = Array.isArray(roles) ? roles : [roles];

        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }

        next();
    };
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
    return requireRole(['admin'])(req, res, next);
}

// Optional authentication (doesn't fail if no token)
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            // No token provided, continue without user context
            req.user = null;
            return next();
        }

        // Verify and attach user if token is valid
        const decoded = jwt.verify(token, JWT_SECRET);
        const session = await db.sessions.findByToken(token);

        if (session) {
            const user = await db.users.findById(session.user_id);
            if (user && user.is_active) {
                req.user = {
                    id: user.id,
                    uuid: user.uuid,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    experience_level: user.experience_level,
                    role: user.role || 'user'
                };
            }
        }

        next();
    } catch (error) {
        // Silent fail for optional auth
        req.user = null;
        next();
    }
}

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    optionalAuth
};