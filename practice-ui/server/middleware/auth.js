// Authentication Middleware
// Interview Prep Platform - Security Layer
// Created: December 19, 2025

const jwt = require('jsonwebtoken');
const { db } = require('../../database/models');

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'interview-prep-secret-key-2025';

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const user = await db.users.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token - user not found'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated'
            });
        }

        // Add user to request object
        req.user = {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            role: user.role,
            experience_level: user.experience_level
        };

        // Update last activity
        await db.run(`
            UPDATE users SET last_login = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [user.id]);

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    next();
};

// Middleware to require moderator or admin role
const requireModerator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (!['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Moderator or admin access required'
        });
    }

    next();
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.users.findById(decoded.userId);
        
        if (user && user.is_active) {
            req.user = {
                id: user.id,
                uuid: user.uuid,
                username: user.username,
                email: user.email,
                role: user.role,
                experience_level: user.experience_level
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user
        req.user = null;
        next();
    }
};

// Generate JWT token
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '24h' // Token expires in 24 hours
    });
};

// Verify token without middleware (utility function)
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Rate limiting middleware (simple implementation)
const createRateLimit = (windowMs, maxRequests) => {
    const requests = new Map();

    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old requests
        if (requests.has(clientId)) {
            const clientRequests = requests.get(clientId);
            const validRequests = clientRequests.filter(time => time > windowStart);
            requests.set(clientId, validRequests);
        }

        // Check current requests
        const clientRequests = requests.get(clientId) || [];
        
        if (clientRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        // Add current request
        clientRequests.push(now);
        requests.set(clientId, clientRequests);

        next();
    };
};

// API key authentication (for external integrations)
const authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required'
            });
        }

        // In a real implementation, you'd check this against a database
        const validApiKeys = [
            process.env.API_KEY_1,
            process.env.API_KEY_2
        ].filter(Boolean);

        if (!validApiKeys.includes(apiKey)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key'
            });
        }

        // Set a system user for API requests
        req.user = {
            id: 0,
            username: 'system',
            email: 'system@api',
            role: 'system'
        };

        next();
    } catch (error) {
        console.error('API key authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

// Session-based authentication (alternative to JWT)
const authenticateSession = async (req, res, next) => {
    try {
        const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                error: 'Session ID required'
            });
        }

        // Find active session
        const session = await db.sessions.findByToken(sessionId);
        
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        // Get user from session
        const user = await db.users.findById(session.user_id);
        
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session - user not found or inactive'
            });
        }

        req.user = {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            role: user.role,
            experience_level: user.experience_level
        };

        // Update session activity
        await db.run(`
            UPDATE sessions SET last_activity = CURRENT_TIMESTAMP 
            WHERE session_id = ?
        `, [sessionId]);

        next();
    } catch (error) {
        console.error('Session authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

// Middleware to log authentication attempts
const logAuthAttempt = (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] Auth attempt from ${clientIp} - ${userAgent}`);
    
    // In production, you might want to store this in a database
    next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security (HTTPS only)
    if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self';"
    );
    
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireModerator,
    optionalAuth,
    generateToken,
    verifyToken,
    createRateLimit,
    authenticateApiKey,
    authenticateSession,
    logAuthAttempt,
    securityHeaders,
    JWT_SECRET
};