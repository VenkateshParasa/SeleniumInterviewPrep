// Database Configuration
// Centralized database connection and setup

const path = require('path');
const fs = require('fs');

const config = {
  development: {
    type: 'sqlite',
    database: path.join(__dirname, '..', 'src', 'database', 'dev.db'),
    synchronize: false,
    logging: true,
    migrations: [path.join(__dirname, '..', 'src', 'database', 'migrations', '*.js')],
    entities: [path.join(__dirname, '..', 'src', 'backend', 'models', '*.js')]
  },

  test: {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    dropSchema: true,
    entities: [path.join(__dirname, '..', 'src', 'backend', 'models', '*.js')]
  },

  production: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    ssl: process.env.DB_SSL === 'true',
    migrations: [path.join(__dirname, '..', 'src', 'database', 'migrations', '*.js')],
    entities: [path.join(__dirname, '..', 'src', 'backend', 'models', '*.js')]
  }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = {
  config: config[environment],
  allConfigs: config,
  environment
};