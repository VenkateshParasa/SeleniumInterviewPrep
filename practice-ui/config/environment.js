// Environment Configuration
// Centralized environment variable management

const path = require('path');
require('dotenv').config();

const config = {
  // Application Settings
  app: {
    name: process.env.APP_NAME || 'Interview Prep Platform',
    version: process.env.APP_VERSION || '2.0.0',
    port: parseInt(process.env.PORT) || 3001,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3001'
  },

  // Security Settings
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    trustProxy: process.env.TRUST_PROXY === 'true',
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production'
    }
  },

  // File Paths
  paths: {
    root: path.resolve(__dirname, '..'),
    src: path.resolve(__dirname, '..', 'src'),
    frontend: path.resolve(__dirname, '..', 'src', 'frontend'),
    backend: path.resolve(__dirname, '..', 'src', 'backend'),
    database: path.resolve(__dirname, '..', 'src', 'database'),
    storage: path.resolve(__dirname, '..', 'storage'),
    uploads: path.resolve(__dirname, '..', 'storage', 'uploads'),
    logs: path.resolve(__dirname, '..', 'storage', 'logs'),
    backups: path.resolve(__dirname, '..', 'storage', 'backups')
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(__dirname, '..', 'storage', 'logs', 'app.log'),
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    maxSize: process.env.LOG_MAX_SIZE || '10m'
  },

  // Analytics
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED !== 'false',
    googleAnalytics: process.env.GOOGLE_ANALYTICS_ID,
    mixpanel: process.env.MIXPANEL_TOKEN
  },

  // External Integrations
  integrations: {
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      s3Bucket: process.env.AWS_S3_BUCKET
    }
  }
};

module.exports = config;