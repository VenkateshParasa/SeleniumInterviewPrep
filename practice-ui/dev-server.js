#!/usr/bin/env node

// Simple local development server for Interview Prep Platform
// Run with: node dev-server.js

const express = require('express');
const path = require('path');
const { PORTS, logPortConfiguration } = require('./config/ports');

const app = express();
const PORT = PORTS.DEV_SERVER;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route - serve index.html for any route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Interview Prep Platform Dev Server`);
    
    // Use centralized logging
    logPortConfiguration('Development Server', PORT, {
        apiEndpoint: `http://127.0.0.1:${PORTS.DATABASE_SERVER}/api/v2`
    });
    
    console.log(`📂 Serving files from: ${path.join(__dirname, 'public')}`);
    console.log(`🌐 Open in browser: http://127.0.0.1:${PORT}`);
    console.log(`🔗 API Server should be running on: http://127.0.0.1:${PORTS.DATABASE_SERVER}`);
    console.log(`⏹️  Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Server shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Server shutting down...');
    process.exit(0);
});