// Main Server for Interview Prep Platform
// Database-Integrated Server with Authentication and Complete API Routes
// Created: December 19, 2025

console.log('🔄 Starting Interview Prep Platform Server...');

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('✅ Express loaded');

// ===================================
// MIDDLEWARE SETUP
// ===================================

// CORS configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Set proper MIME types
app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

console.log('✅ Middleware configured');

// ===================================
// DATABASE INITIALIZATION
// ===================================

let db = null;

async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database connection...');
        const { db: dbManager } = require('./database/models.js');
        db = dbManager;
        
        await db.connect();
        
        // Check if database has data
        const questionsCount = await db.questions.getCount({});
        const categoriesCount = (await db.categories.findAll()).length;
        
        console.log(`📊 Database status: ${questionsCount} questions, ${categoriesCount} categories`);
        console.log('✅ Database initialized successfully');
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.log('⚠️ Continuing with mock data...');
        return false;
    }
}

// ===================================
// IMPORT ROUTE MODULES
// ===================================

// Import authentication middleware
const { authenticateToken, optionalAuth } = require('./server/middleware/auth');

// Import route modules
const adminApiRoutes = require('./server/routes/admin-api');
const apiV2Routes = require('./server/routes/api-v2');
const userApiRoutes = require('./server/routes/user-api');
const socialApiRoutes = require('./server/routes/social-api');
const integrationsApiRoutes = require('./server/routes/integrations-api');
const missingEntitiesApiRoutes = require('./server/routes/missing-entities-api');

// ===================================
// API ROUTES
// ===================================

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        let dbHealth = { status: 'mock', timestamp: new Date().toISOString() };
        
        if (db) {
            dbHealth = await db.healthCheck();
        }
        
        res.json({
            success: true,
            status: 'healthy',
            database: dbHealth,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '2.0.0'
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Mount API routes
app.use('/api/admin', adminApiRoutes);
app.use('/api/v2', apiV2Routes);
app.use('/api/v2', userApiRoutes); // Mount user API routes
app.use('/api/v2', missingEntitiesApiRoutes); // Mount missing entities routes
app.use('/api/social', socialApiRoutes);
app.use('/api/integrations', integrationsApiRoutes);

// Legacy API endpoints for backward compatibility
app.get('/api/v2/health', async (req, res) => {
    try {
        let dbHealth = { status: 'mock', timestamp: new Date().toISOString() };
        
        if (db) {
            dbHealth = await db.healthCheck();
        }
        
        res.json({
            success: true,
            data: dbHealth
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            error: error.message
        });
    }
});

// Categories endpoint (legacy support)
app.get('/api/v2/categories', async (req, res) => {
    try {
        let categories = [];
        
        if (db) {
            categories = await db.categories.findAll();
        } else {
            // Mock data fallback
            categories = [
                { id: 1, name: 'Java', slug: 'java', icon: 'fab fa-java', is_active: true },
                { id: 2, name: 'Selenium', slug: 'selenium', icon: 'fas fa-robot', is_active: true },
                { id: 3, name: 'TestNG', slug: 'testng', icon: 'fas fa-vial', is_active: true },
                { id: 4, name: 'Framework Design', slug: 'framework', icon: 'fas fa-cogs', is_active: true },
                { id: 5, name: 'API Testing', slug: 'api', icon: 'fas fa-plug', is_active: true },
                { id: 6, name: 'Performance Testing', slug: 'performance', icon: 'fas fa-tachometer-alt', is_active: true }
            ];
        }
        
        res.json({
            success: true,
            data: categories,
            meta: { 
                total: categories.length,
                source: db ? 'database' : 'mock'
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

// Questions endpoint (legacy support)
app.get('/api/v2/questions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        
        let questions = [];
        let totalCount = 0;
        
        if (db) {
            const filters = {
                limit,
                offset,
                category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
                difficulty: req.query.difficulty ? parseInt(req.query.difficulty) : null,
                search: req.query.search || null
            };
            
            [questions, totalCount] = await Promise.all([
                db.questions.findAll(filters),
                db.questions.getCount(filters)
            ]);
        } else {
            // Mock data fallback
            const mockQuestions = [
                {
                    id: 1,
                    question_text: 'What is the difference between JDK, JRE, and JVM?',
                    category_name: 'Java',
                    difficulty_level: 1,
                    question_type: 'theoretical',
                    is_active: true
                },
                {
                    id: 2,
                    question_text: 'Explain the concept of Object-Oriented Programming in Java.',
                    category_name: 'Java',
                    difficulty_level: 2,
                    question_type: 'theoretical',
                    is_active: true
                },
                {
                    id: 3,
                    question_text: 'What is Selenium WebDriver?',
                    category_name: 'Selenium',
                    difficulty_level: 1,
                    question_type: 'theoretical',
                    is_active: true
                }
            ];
            
            questions = mockQuestions.slice(offset, offset + limit);
            totalCount = mockQuestions.length;
        }
        
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
            },
            meta: {
                source: db ? 'database' : 'mock'
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

// ===================================
// FRONTEND ROUTES
// ===================================

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Interview Prep Platform</title></head>
            <body>
                <h1>🎯 Interview Prep Platform</h1>
                <p>Server is running successfully!</p>
                <h2>Available Endpoints:</h2>
                <ul>
                    <li><a href="/admin">Admin Dashboard</a></li>
                    <li><a href="/health">Health Check</a></li>
                    <li><a href="/api/v2/categories">Categories API</a></li>
                    <li><a href="/api/v2/questions">Questions API</a></li>
                    <li><a href="/api/v2/exercises">Practice Exercises API</a></li>
                    <li><a href="/api/v2/resources">Resources API</a></li>
                    <li><a href="/api/v2/achievements">Achievements API</a></li>
                    <li><a href="/api/v2/sessions/history">Study Sessions API</a></li>
                </ul>
                <h2>New Features Added:</h2>
                <ul>
                    <li>✅ Complete database models for all entities</li>
                    <li>✅ Practice exercises management</li>
                    <li>✅ Learning resources system</li>
                    <li>✅ User achievements tracking</li>
                    <li>✅ Study sessions analytics</li>
                </ul>
            </body>
        </html>
    `);
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// ===================================
// ERROR HANDLING
// ===================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
            '/api/v2/categories',
            '/api/v2/questions',
            '/api/v2/exercises',
            '/api/v2/resources',
            '/api/v2/achievements',
            '/api/v2/sessions',
            '/api/admin/*',
            '/health'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ===================================
// SERVER STARTUP
// ===================================

async function startServer() {
    try {
        // Initialize database (optional - server will work without it)
        const dbInitialized = await initializeDatabase();
        
        // Start the server
        const server = app.listen(PORT, () => {
            console.log('🚀 Interview Prep Platform Server Started');
            console.log('=====================================');
            console.log(`📍 Server URL: http://localhost:${PORT}`);
            console.log(`🎯 Main App: http://localhost:${PORT}`);
            console.log(`⚙️ Admin Dashboard: http://localhost:${PORT}/admin`);
            console.log(`🔧 API Health: http://localhost:${PORT}/health`);
            console.log(`📊 API v2: http://localhost:${PORT}/api/v2`);
            console.log('=====================================');
            console.log('🎉 NEW FEATURES IMPLEMENTED:');
            console.log('✅ Complete database models');
            console.log('✅ Practice exercises API');
            console.log('✅ Learning resources API');
            console.log('✅ User achievements system');
            console.log('✅ Study sessions tracking');
            console.log('=====================================');
            console.log(`✅ Server ready ${dbInitialized ? 'with REAL DATABASE' : 'with MOCK DATA'}`);
            
            if (dbInitialized) {
                console.log('🎉 Database integration active - all features available!');
            }
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM received, shutting down gracefully');
            server.close(async () => {
                console.log('📴 HTTP server closed');
                if (db) {
                    await db.close();
                    console.log('💾 Database connection closed');
                }
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT received, shutting down gracefully');
            server.close(async () => {
                console.log('📴 HTTP server closed');
                if (db) {
                    await db.close();
                    console.log('💾 Database connection closed');
                }
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;