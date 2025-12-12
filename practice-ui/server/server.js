// Interview Prep Platform - Backend Server
// Node.js + Express API Server with JSON-based authentication

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'interview-prep-secret-key-2024';

// Create HTTP server and Socket.IO
const { createServer } = require('http');
const { Server } = require('socket.io');

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://your-domain.com', 'https://interview-prep.netlify.app']
            : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
        methods: ['GET', 'POST']
    }
});

// ===================================
// MIDDLEWARE SETUP
// ===================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://your-domain.com',
      'https://interview-prep.netlify.app',
      process.env.FRONTEND_URL // Allow custom frontend URL from env
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:5501',
      'http://127.0.0.1:5501',
      'null' // Allow file:// protocol for local development
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Log the origin for debugging
    console.log(`🌐 CORS Request from origin: ${origin}`);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('null')) {
      console.log(`✅ CORS: Origin ${origin} allowed`);
      callback(null, true);
    } else {
      console.log(`❌ CORS: Origin ${origin} BLOCKED`);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================================
// DATA ACCESS LAYER
// ===================================

class DataStore {
  constructor() {
    this.credentialsPath = path.join(__dirname, 'credentials.json');
    this.userDataPath = path.join(__dirname, 'user-data');
    this.backupPath = path.join(__dirname, 'backups');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.userDataPath, { recursive: true });
      await fs.mkdir(this.backupPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async readCredentials() {
    try {
      const data = await fs.readFile(this.credentialsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading credentials:', error);
      throw new Error('Failed to read user credentials');
    }
  }

  async writeCredentials(data) {
    try {
      // Create backup first
      await this.createBackup();

      await fs.writeFile(this.credentialsPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing credentials:', error);
      throw new Error('Failed to save user credentials');
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupPath, `credentials-backup-${timestamp}.json`);
      const data = await fs.readFile(this.credentialsPath, 'utf8');
      await fs.writeFile(backupFile, data);
    } catch (error) {
      console.warn('Backup creation failed:', error);
    }
  }

  async getUserData(userId) {
    try {
      const userFile = path.join(this.userDataPath, `${userId}.json`);
      const data = await fs.readFile(userFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Return default data if file doesn't exist
      return this.getDefaultUserData(userId);
    }
  }

  async saveUserData(userId, data) {
    try {
      const userFile = path.join(this.userDataPath, `${userId}.json`);
      await fs.writeFile(userFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  getDefaultUserData(userId) {
    return {
      userId,
      progress: {
        completedDays: {},
        tasks: {}
      },
      dashboardData: {
        streak: {
          current: 0,
          longest: 0,
          lastStudyDate: null,
          studyDates: []
        },
        studyTime: {
          total: 0,
          sessions: [],
          averageSession: 0
        },
        questions: {
          studied: [],
          timeSpent: [],
          categories: {
            'java': 0,
            'selenium': 0,
            'api-testing': 0,
            'testng': 0,
            'framework': 0,
            'leadership': 0
          }
        },
        achievements: {
          'first-day': false,
          'week-warrior': false,
          'streak-master': false,
          'question-solver': false,
          'category-explorer': false,
          'time-keeper': false,
          'consistency-king': false,
          'knowledge-seeker': false
        }
      },
      settings: {
        theme: 'auto',
        notifications: {
          enabled: true,
          sound: false,
          achievements: true,
          streakReminders: true
        },
        display: {
          compactMode: false,
          showProgress: true,
          animationsEnabled: true,
          fontSize: 'medium'
        },
        study: {
          dailyGoal: 1,
          weeklyGoal: 5,
          autoMarkComplete: false,
          showDifficulty: true
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

const dataStore = new DataStore();

// ===================================
// AUTHENTICATION MIDDLEWARE
// ===================================

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

    // Check if session is still valid
    const credentials = await dataStore.readCredentials();
    const session = credentials.sessions.find(s =>
      s.token === token &&
      s.isActive &&
      new Date(s.expiresAt) > new Date()
    );

    if (!session) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Find user
    const user = credentials.users.find(u => u.id === decoded.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      experienceLevel: user.experienceLevel,
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

// ===================================
// AUTH ROUTES
// ===================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Read credentials
    const credentials = await dataStore.readCredentials();

    // Find user by username or email
    const user = credentials.users.find(u =>
      (u.username === username || u.email === username) && u.isActive
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // For demo purposes, simple password comparison
    // In production, use bcrypt.compare()
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'interview-prep-platform'
      }
    );

    // Create session
    const sessionId = uuidv4();
    const session = {
      sessionId,
      userId: user.id,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      isActive: true,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        device: 'unknown'
      }
    };

    // Update last login and add session
    user.lastLogin = new Date().toISOString();
    credentials.sessions.push(session);

    // Save credentials
    await dataStore.writeCredentials(credentials);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        sessionId
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const credentials = await dataStore.readCredentials();
    const user = credentials.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];

    // Deactivate session
    const credentials = await dataStore.readCredentials();
    const sessionIndex = credentials.sessions.findIndex(s => s.token === token);

    if (sessionIndex !== -1) {
      credentials.sessions[sessionIndex].isActive = false;
      await dataStore.writeCredentials(credentials);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ===================================
// USER DATA ROUTES
// ===================================

// Get user progress and data
app.get('/api/user/data', authenticateToken, async (req, res) => {
  try {
    const userData = await dataStore.getUserData(req.user.id);

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user data'
    });
  }
});

// Update user progress
app.post('/api/user/progress', authenticateToken, async (req, res) => {
  try {
    const { progress, dashboardData } = req.body;

    if (!progress || !dashboardData) {
      return res.status(400).json({
        success: false,
        error: 'Progress and dashboard data are required'
      });
    }

    // Get current user data
    const userData = await dataStore.getUserData(req.user.id);

    // Update progress and dashboard data
    userData.progress = { ...userData.progress, ...progress };
    userData.dashboardData = { ...userData.dashboardData, ...dashboardData };
    userData.updatedAt = new Date().toISOString();

    // Save updated data
    await dataStore.saveUserData(req.user.id, userData);

    res.json({
      success: true,
      data: userData,
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

// Update user settings
app.post('/api/user/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        error: 'Settings data is required'
      });
    }

    // Get current user data
    const userData = await dataStore.getUserData(req.user.id);

    // Update settings
    userData.settings = { ...userData.settings, ...settings };
    userData.updatedAt = new Date().toISOString();

    // Save updated data
    await dataStore.saveUserData(req.user.id, userData);

    res.json({
      success: true,
      data: userData.settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// ===================================
// CONTENT ROUTES
// ===================================

// Get practice data
app.get('/api/content/practice-data', async (req, res) => {
  try {
    const { level = 'senior' } = req.query;

    let filename = 'practice-data.json';
    if (level === 'senior') {
      filename = 'practice-data-senior.json';
    }

    const filePath = path.join(__dirname, filename);
    const data = await fs.readFile(filePath, 'utf8');
    const practiceData = JSON.parse(data);

    res.json({
      success: true,
      data: practiceData
    });
  } catch (error) {
    console.error('Get practice data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve practice data'
    });
  }
});

// Get interview questions
app.get('/api/content/interview-questions', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'interview-questions.json');
    const data = await fs.readFile(filePath, 'utf8');
    const questionsData = JSON.parse(data);

    res.json({
      success: true,
      data: questionsData
    });
  } catch (error) {
    console.error('Get interview questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve interview questions'
    });
  }
});

// ===================================
// ANALYTICS ROUTES
// ===================================

// Get user analytics
app.get('/api/analytics/stats', authenticateToken, async (req, res) => {
  try {
    const userData = await dataStore.getUserData(req.user.id);

    // Calculate analytics
    const analytics = {
      totalDaysCompleted: Object.keys(userData.progress.completedDays).length,
      currentStreak: userData.dashboardData.streak.current,
      longestStreak: userData.dashboardData.streak.longest,
      totalStudyTime: userData.dashboardData.studyTime.total,
      questionsStudied: userData.dashboardData.questions.studied.length,
      achievements: Object.values(userData.dashboardData.achievements).filter(Boolean).length,
      lastActiveDate: userData.updatedAt,
      joinDate: userData.createdAt
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

// ===================================
// HEALTH CHECK ROUTES
// ===================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/status', authenticateToken, async (req, res) => {
  try {
    const credentials = await dataStore.readCredentials();
    const activeSessions = credentials.sessions.filter(s =>
      s.isActive && new Date(s.expiresAt) > new Date()
    ).length;

    res.json({
      success: true,
      data: {
        totalUsers: credentials.users.length,
        activeUsers: credentials.users.filter(u => u.isActive).length,
        activeSessions,
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve server status'
    });
  }
});

// ===================================
// ERROR HANDLING
// ===================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ===================================
// WEBSOCKET REAL-TIME SYNC
// ===================================

// WebSocket authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const credentials = await dataStore.readCredentials();

        const session = credentials.sessions.find(s =>
            s.token === token &&
            s.isActive &&
            new Date(s.expiresAt) > new Date()
        );

        if (!session) {
            return next(new Error('Invalid session'));
        }

        const user = credentials.users.find(u => u.id === decoded.userId);
        if (!user || !user.isActive) {
            return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.username = user.username;
        next();
    } catch (error) {
        next(new Error('Authentication failed'));
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.username} (${socket.userId})`);

    // Join user to their personal room for targeted updates
    socket.join(`user:${socket.userId}`);

    // Handle real-time progress sync
    socket.on('sync:progress', async (data) => {
        try {
            const { progress, dashboardData } = data;

            // Get current user data
            const userData = await dataStore.getUserData(socket.userId);

            // Update progress and dashboard data
            userData.progress = { ...userData.progress, ...progress };
            userData.dashboardData = { ...userData.dashboardData, ...dashboardData };
            userData.updatedAt = new Date().toISOString();

            // Save updated data
            await dataStore.saveUserData(socket.userId, userData);

            // Broadcast to other sessions of the same user
            socket.to(`user:${socket.userId}`).emit('sync:progress:updated', {
                progress: userData.progress,
                dashboardData: userData.dashboardData,
                updatedAt: userData.updatedAt
            });

            // Acknowledge sync
            socket.emit('sync:progress:ack', {
                success: true,
                timestamp: userData.updatedAt
            });

            console.log(`✅ Real-time progress sync for user: ${socket.username}`);

        } catch (error) {
            console.error('❌ Real-time progress sync failed:', error);
            socket.emit('sync:progress:error', {
                success: false,
                error: error.message
            });
        }
    });

    // Handle real-time settings sync
    socket.on('sync:settings', async (data) => {
        try {
            const { settings } = data;

            // Get current user data
            const userData = await dataStore.getUserData(socket.userId);

            // Update settings
            userData.settings = { ...userData.settings, ...settings };
            userData.updatedAt = new Date().toISOString();

            // Save updated data
            await dataStore.saveUserData(socket.userId, userData);

            // Broadcast to other sessions of the same user
            socket.to(`user:${socket.userId}`).emit('sync:settings:updated', {
                settings: userData.settings,
                updatedAt: userData.updatedAt
            });

            // Acknowledge sync
            socket.emit('sync:settings:ack', {
                success: true,
                timestamp: userData.updatedAt
            });

            console.log(`⚙️ Real-time settings sync for user: ${socket.username}`);

        } catch (error) {
            console.error('❌ Real-time settings sync failed:', error);
            socket.emit('sync:settings:error', {
                success: false,
                error: error.message
            });
        }
    });

    // Handle ping for connection health
    socket.on('ping', () => {
        socket.emit('pong');
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`👋 User disconnected: ${socket.username} (${reason})`);
    });
});

// ===================================
// SERVER STARTUP
// ===================================

const serverInstance = server.listen(PORT, () => {
    console.log(`🚀 Interview Prep Backend Server running on port ${PORT}`);
    console.log(`📍 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket Endpoint: ws://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  serverInstance.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  serverInstance.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;