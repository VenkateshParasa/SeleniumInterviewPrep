# 🏗️ Architecture Improvement Guide
## Interview Preparation Platform - Complete Implementation Plan

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Backend Architecture Implementation](#backend-architecture-implementation)
3. [Scalability Solutions](#scalability-solutions)
4. [Dashboard Features Implementation](#dashboard-features-implementation)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Deployment Guide](#deployment-guide)

---

## 📊 Executive Summary

### Current State Analysis

**Project**: Interview Preparation Platform for QA Automation Engineers  
**Current Architecture**: Client-side only (HTML/CSS/JavaScript)  
**Critical Issues**:
- ❌ No backend architecture
- ❌ Limited scalability
- ❌ Incomplete dashboard features
- ❌ No user authentication
- ❌ No data persistence across devices

### Proposed Solution

**New Architecture**: Full-stack serverless application  
**Technology Stack**:
- **Frontend**: React/Vue with TypeScript
- **Backend**: Node.js + Express on AWS Lambda/Vercel
- **Database**: DynamoDB/MongoDB Atlas
- **Authentication**: JWT + AWS Cognito/Auth0
- **Caching**: Redis/ElastiCache
- **CDN**: CloudFront/Vercel Edge

### Expected Outcomes

- ✅ Multi-device sync
- ✅ User authentication & authorization
- ✅ Real-time progress tracking
- ✅ Scalable to 10,000+ users
- ✅ Complete dashboard with analytics
- ✅ Offline support
- ✅ 99.9% uptime

---

## 🏗️ Backend Architecture Implementation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │   Desktop    │      │
│  │  (React/Vue) │  │  (Optional)  │  │  (Optional)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Rate Limiting)│
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │   Auth    │     │  Content  │     │ Progress  │
    │  Service  │     │  Service  │     │  Service  │
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │  Cognito  │     │ DynamoDB  │     │ DynamoDB  │
    │   /Auth0  │     │ (Content) │     │(Progress) │
    └───────────┘     └───────────┘     └───────────┘
                             │
                      ┌──────▼──────┐
                      │    Redis    │
                      │   (Cache)   │
                      └─────────────┘
```

### Technology Stack Decision Matrix

| Component | Option 1 (Recommended) | Option 2 | Option 3 |
|-----------|----------------------|----------|----------|
| **Backend Runtime** | Node.js 18+ | Python 3.11 | Go 1.21 |
| **Framework** | Express.js | Fastify | NestJS |
| **Serverless** | AWS Lambda | Vercel Functions | Netlify Functions |
| **Database** | DynamoDB | MongoDB Atlas | PostgreSQL (Supabase) |
| **Authentication** | AWS Cognito | Auth0 | Firebase Auth |
| **Caching** | Redis Cloud | ElastiCache | Upstash Redis |
| **File Storage** | AWS S3 | Cloudinary | Vercel Blob |
| **CDN** | CloudFront | Vercel Edge | Cloudflare |

### Why Serverless?

**Advantages**:
- ✅ Zero infrastructure management
- ✅ Auto-scaling (0 to millions)
- ✅ Pay-per-use pricing
- ✅ Built-in high availability
- ✅ Fast deployment
- ✅ Perfect for educational projects

**Cost Comparison** (Monthly):

| Users | Traditional Server | Serverless |
|-------|-------------------|------------|
| 0-100 | $20-50 | $0-5 |
| 100-1000 | $50-200 | $5-30 |
| 1000-10000 | $200-1000 | $30-150 |

---

## 📁 Project Structure

### Complete Backend Structure

```
interview-prep-backend/
├── src/
│   ├── config/
│   │   ├── database.js              # Database configuration
│   │   ├── auth.js                  # Auth configuration
│   │   ├── redis.js                 # Cache configuration
│   │   └── constants.js             # Application constants
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication endpoints
│   │   ├── userController.js        # User management
│   │   ├── contentController.js     # Content delivery
│   │   ├── progressController.js    # Progress tracking
│   │   ├── dashboardController.js   # Dashboard data
│   │   └── analyticsController.js   # Analytics endpoints
│   │
│   ├── services/
│   │   ├── authService.js           # Auth business logic
│   │   ├── userService.js           # User operations
│   │   ├── contentService.js        # Content management
│   │   ├── progressService.js       # Progress calculations
│   │   ├── dashboardService.js      # Dashboard aggregations
│   │   ├── achievementService.js    # Achievement system
│   │   ├── streakService.js         # Streak calculations
│   │   └── analyticsService.js      # Analytics processing
│   │
│   ├── models/
│   │   ├── User.js                  # User model
│   │   ├── Progress.js              # Progress model
│   │   ├── Question.js              # Question model
│   │   ├── Achievement.js           # Achievement model
│   │   ├── StudySession.js          # Study session model
│   │   └── Note.js                  # User notes model
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── validation.js            # Request validation
│   │   ├── errorHandler.js          # Global error handler
│   │   ├── rateLimit.js             # Rate limiting
│   │   ├── cors.js                  # CORS configuration
│   │   └── logger.js                # Request logging
│   │
│   ├── routes/
│   │   ├── index.js                 # Route aggregator
│   │   ├── auth.js                  # Auth routes
│   │   ├── users.js                 # User routes
│   │   ├── content.js               # Content routes
│   │   ├── progress.js              # Progress routes
│   │   ├── dashboard.js             # Dashboard routes
│   │   └── analytics.js             # Analytics routes
│   │
│   ├── utils/
│   │   ├── logger.js                # Winston logger
│   │   ├── response.js              # Response formatter
│   │   ├── validators.js            # Custom validators
│   │   ├── helpers.js               # Helper functions
│   │   └── constants.js             # Shared constants
│   │
│   ├── database/
│   │   ├── migrations/              # Database migrations
│   │   ├── seeds/                   # Seed data
│   │   └── schemas/                 # Schema definitions
│   │
│   └── app.js                       # Express app setup
│
├── tests/
│   ├── unit/                        # Unit tests
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   ├── integration/                 # Integration tests
│   │   ├── api/
│   │   └── database/
│   └── e2e/                         # End-to-end tests
│
├── scripts/
│   ├── setup-db.js                  # Database setup
│   ├── seed-data.js                 # Seed initial data
│   └── migrate.js                   # Run migrations
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies
├── serverless.yml                   # Serverless config (if using)
├── docker-compose.yml               # Local development
└── README.md                        # Documentation
```

---

## 🔐 Authentication Implementation

### Step 1: Setup Authentication Service

**File**: `src/services/authService.js`

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dynamoDB } = require('../config/database');
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User full name
   * @param {string} experienceLevel - junior/mid/senior
   * @returns {Object} User object and JWT token
   */
  async register(email, password, name, experienceLevel) {
    // Validate input
    if (!email || !password || !name || !experienceLevel) {
      throw new Error('All fields are required');
    }

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user object
    const user = {
      userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      experienceLevel,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        track: 'standard',
        notifications: true,
        theme: 'light',
        emailNotifications: true
      },
      profile: {
        avatar: null,
        bio: '',
        targetRole: '',
        currentCompany: ''
      }
    };

    // Save to database
    await dynamoDB.send(new PutCommand({
      TableName: 'Users',
      Item: user
    }));

    // Create initial progress record
    await this.createInitialProgress(userId);

    // Generate JWT token
    const token = this.generateToken(userId, email);

    // Return user (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Login existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User object and JWT token
   */
  async login(email, password) {
    // Find user by email
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await dynamoDB.send(new PutCommand({
      TableName: 'Users',
      Item: {
        ...user,
        lastLogin: new Date().toISOString()
      }
    }));

    // Generate new token
    const token = this.generateToken(user.userId, user.email);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  async getUserByEmail(email) {
    const result = await dynamoDB.send(new QueryCommand({
      TableName: 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    }));

    return result.Items?.[0] || null;
  }

  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {string} JWT token
   */
  generateToken(userId, email) {
    return jwt.sign(
      { 
        userId, 
        email,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '7d',
        issuer: 'interview-prep-platform'
      }
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Create initial progress record for new user
   * @param {string} userId - User ID
   */
  async createInitialProgress(userId) {
    const progress = {
      progressId: `progress_${userId}`,
      userId,
      completedDays: {},
      completedTasks: {},
      studiedQuestions: [],
      bookmarkedQuestions: [],
      notes: {},
      streak: {
        current: 0,
        longest: 0,
        lastStudyDate: null
      },
      achievements: [],
      statistics: {
        totalStudyTime: 0,
        questionsStudied: 0,
        daysCompleted: 0,
        averageSessionTime: 0,
        totalSessions: 0
      },
      studySessions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamoDB.send(new PutCommand({
      TableName: 'Progress',
      Item: progress
    }));
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.getUserById(userId);
    
    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await dynamoDB.send(new PutCommand({
      TableName: 'Users',
      Item: {
        ...user,
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      }
    }));
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {string} Reset token
   */
  async requestPasswordReset(email) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return null;
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.userId, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send email with reset link
    const emailService = require('./emailService');
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(email, resetLink, user.name);

    return resetToken;
  }

  /**
   * Reset password with token
   * @param {string} resetToken - Password reset token
   * @param {string} newPassword - New password
   */
  async resetPassword(resetToken, newPassword) {
    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid reset token');
      }
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Get user and update password
    const user = await this.getUserById(decoded.userId);
    await dynamoDB.send(new PutCommand({
      TableName: 'Users',
      Item: {
        ...user,
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      }
    }));
  }
}

### Email Service Implementation

**File**: `src/services/emailService.js`

```javascript
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} resetLink - Password reset link
   * @param {string} userName - User's name
   */
  async sendPasswordResetEmail(email, resetLink, userName) {
    const mailOptions = {
      from: `"Interview Prep Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; 
                     color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password for your Interview Prep Platform account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4CAF50;">${resetLink}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>Interview Prep Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Interview Prep Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email to new users
   * @param {string} email - Recipient email
   * @param {string} userName - User's name
   */
  async sendWelcomeEmail(email, userName) {
    const mailOptions = {
      from: `"Interview Prep Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Interview Prep Platform!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; 
                     color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Interview Prep Platform! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Thank you for joining Interview Prep Platform! We're excited to help you prepare for your QA Automation Engineer interviews.</p>
              <h3>What's Next?</h3>
              <ul>
                <li>📚 Explore 500+ interview questions</li>
                <li>💻 Practice coding challenges</li>
                <li>📊 Track your progress with our dashboard</li>
                <li>🏆 Earn achievements as you learn</li>
              </ul>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
              </p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy learning!<br>Interview Prep Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Interview Prep Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email - it's not critical
      return null;
    }
  }

  /**
   * Send achievement notification email
   * @param {string} email - Recipient email
   * @param {string} userName - User's name
   * @param {string} achievementName - Achievement name
   * @param {string} achievementDescription - Achievement description
   */
  async sendAchievementEmail(email, userName, achievementName, achievementDescription) {
    const mailOptions = {
      from: `"Interview Prep Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🏆 New Achievement Unlocked: ${achievementName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FFD700; color: #333; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .achievement { background: white; padding: 20px; border-radius: 8px; 
                          text-align: center; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; 
                     color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Achievement Unlocked!</h1>
            </div>
            <div class="content">
              <p>Congratulations ${userName}!</p>
              <div class="achievement">
                <h2 style="color: #FFD700;">🏆 ${achievementName}</h2>
                <p>${achievementDescription}</p>
              </div>
              <p>Keep up the great work! Continue your learning journey to unlock more achievements.</p>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
              </p>
              <p>Best regards,<br>Interview Prep Platform Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Interview Prep Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Achievement email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending achievement email:', error);
      return null;
    }
  }
}

module.exports = new EmailService();
```

### Environment Variables for Email Service

Add these to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASSWORD`

---


module.exports = new AuthService();
```

### Step 2: Authentication Middleware

**File**: `src/middleware/auth.js`

```javascript
const authService = require('../services/authService');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to check if user has specific role/permission
 */
const authorize = (...allowedLevels) => {
  return async (req, res, next) => {
    try {
      // Get user from database
      const user = await userService.getUserById(req.user.userId);
      
      if (!allowedLevels.includes(user.experienceLevel)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authorize
};
```

### Step 3: Auth Routes

**File**: `src/routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const { email, password, name, experienceLevel } = req.body;
    
    const result = await authService.register(
      email,
      password,
      name,
      experienceLevel
    );
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    await authService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    await authService.requestPasswordReset(email);
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    await authService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, async (req, res) => {
  // In JWT, logout is handled client-side by removing the token
  // Optionally, you can implement token blacklisting here
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
```

---

## 📊 Progress Tracking Implementation

### Progress Service

**File**: `src/services/progressService.js`

```javascript
const { dynamoDB } = require('../config/database');
const { GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const achievementService = require('./achievementService');
const streakService = require('./streakService');

class ProgressService {
  /**
   * Get user progress
   * @param {string} userId - User ID
   * @returns {Object} Progress data
   */
  async getProgress(userId) {
    const result = await dynamoDB.send(new GetCommand({
      TableName: 'Progress',
      Key: { progressId: `progress_${userId}` }
    }));

    if (!result.Item) {
      throw new Error('Progress not found');
    }

    return result.Item;
  }

  /**
   * Update user progress
   * @param {string} userId - User ID
   * @param {Object} updates - Progress updates
   * @returns {Object} Updated progress
   */
  async updateProgress(userId, updates) {
    const currentProgress = await this.getProgress(userId);
    
    // Merge updates
    const updatedProgress = {
      ...currentProgress,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recalculate streak
    if (updates.completedDays) {
      updatedProgress.streak = await streakService.calculateStreak(
        userId,
        currentProgress.streak,
        updates.completedDays
      );
    }

    // Recalculate statistics
    updatedProgress.statistics = this.calculateStatistics(updatedProgress);

    // Check and award achievements
    const newAchievements = await achievementService.checkAchievements(
      userId,
      updatedProgress
    );
    
    if (newAchievements.length > 0) {
      updatedProgress.achievements = [
        ...currentProgress.achievements,
        ...newAchievements
      ];
    }

    // Save to database
    await dynamoDB.send(new PutCommand({
      TableName: 'Progress',
      Item: updatedProgress
    }));

    return updatedProgress;
  }

  /**
   * Mark day as complete
   * @param {string} userId - User ID
   * @param {number} weekIndex - Week index
   * @param {number} dayId - Day ID
   * @returns {Object} Updated progress
   */
  async markDayComplete(userId, weekIndex, dayId) {
    const progress = await this.getProgress(userId);
    const dayKey = `${weekIndex}-${dayId}`;
    
    const completedDays = {
      ...progress.completedDays,
      [dayKey]: {
        completedAt: new Date().toISOString(),
        tasksCompleted: progress.completedTasks[dayKey] || []
      }
    };

    return this.updateProgress(userId, { completedDays });
  }

  /**
   * Mark task as complete
   * @param {string} userId - User ID
   * @param {string} taskKey - Task key
   * @returns {Object} Updated progress
   */
  async markTaskComplete(userId, taskKey) {
    const progress = await this.getProgress(userId);
    
    const completedTasks = {
      ...progress.completedTasks,
      [taskKey]: {
        completedAt: new Date().toISOString()
      }
    };

    return this.updateProgress(userId, { completedTasks });
  }

  /**
   * Mark question as studied
   * @param {string} userId - User ID
   * @param {string} questionId - Question ID
   * @returns {Object} Updated progress
   */
  async markQuestionStudied(userId, questionId) {
    const progress = await this.getProgress(userId);
    
    if (!progress.studiedQuestions.includes(questionId)) {
      const studiedQuestions = [...progress.studiedQuestions, questionId];
      return this.updateProgress(userId, { studiedQuestions });
    }

    return progress;
  }

  /**
   * Toggle question bookmark
   * @param {string} userId - User ID
   * @param {string} questionId - Question ID
   * @returns {Object} Updated progress
   */
  async toggleBookmark(userId, questionId) {
    const progress = await this.getProgress(userId);
    const bookmarks = progress.bookmarkedQuestions || [];
    
    const index = bookmarks.indexOf(questionId);
    let updatedBookmarks;
    
    if (index > -1) {
      // Remove bookmark
      updatedBookmarks = bookmarks.filter(id => id !== questionId);
    } else {
      // Add bookmark
      updatedBookmarks = [...bookmarks, questionId];
    }

    return this.updateProgress(userId, {
      bookmarkedQuestions: updatedBookmarks
    });
  }

  /**
   * Add or update note for question
   * @param {string} userId - User ID
   * @param {string} questionId - Question ID
   * @param {string} noteContent - Note content
   * @returns {Object} Updated progress
   */
  async addNote(userId, questionId, noteContent) {
    const progress = await this.getProgress(userId);
    const notes = progress.notes || {};
    
    notes[questionId] = {
      content: noteContent,
      updatedAt: new Date().toISOString()
    };

    return this.updateProgress(userId, { notes });
  }

  /**
   * Record study session
   * @param {string} userId - User ID
   * @param {number} duration - Duration in minutes
   * @param {string} topic - Topic studied
   * @returns {Object} Updated progress
   */
  async recordStudySession(userId, duration, topic) {
    const progress = await this.getProgress(userId);
    
    const session = {
      id: `session_${Date.now()}`,
      duration,
      topic,
      startedAt: new Date(Date.now() - duration * 60000).toISOString(),
      endedAt: new Date().toISOString()
    };

    const studySessions = [...(progress.studySessions || []), session];
    
    // Keep only last 100 sessions
    if (studySessions.length > 100) {
      studySessions.shift();
    }

    const statistics = {
      ...progress.statistics,
      totalStudyTime: progress.statistics.totalStudyTime + duration,
      totalSessions: progress.statistics.totalSessions + 1
    };

    return this.updateProgress(userId, {
      studySessions,
      statistics
    });
  }

  /**
   * Calculate statistics from progress data
   * @param {Object} progress - Progress object
   * @returns {Object} Statistics
   */
  calculateStatistics(progress) {
    const daysCompleted = Object.keys(progress.completedDays || {}).length;
    const questionsStudied = progress.studiedQuestions?.length || 0;
    const totalStudyTime = progress.statistics?.totalStudyTime || 0;
    const totalSessions = progress.statistics?.totalSessions || 0;

    return {
      daysCompleted,
      questionsStudied,
      totalStudyTime,
      totalSessions,
      averageSessionTime: totalSessions > 0 
        ? Math.round(totalStudyTime / totalSessions) 
        : 0,
      completionRate: this.calculateCompletionRate(progress),
      categoryProgress: this.calculateCategoryProgress(progress)
    };
  }

  /**
   * Calculate overall completion rate
   * @param {Object} progress