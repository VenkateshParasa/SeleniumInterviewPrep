// Centralized Port Configuration for Interview Prep Platform
// Created: December 22, 2025
// Purpose: Manage all server ports from one location

const PORTS = {
    // Main application servers
    DATABASE_SERVER: 3003,    // Database-integrated server (primary backend) - Changed from 3002
    DEV_SERVER: 8080,         // Frontend development server
    API_SERVER: 3001,         // Legacy API server (if needed)
    
    // Alternative ports for flexibility
    ALT_DATABASE_SERVER: 3002, // Original port as alternative
    ALT_DEV_SERVER: 8081,
    ALT_API_SERVER: 3004,
    
    // Netlify and cloud ports
    NETLIFY_DEV: 8888,
    NETLIFY_FUNCTIONS: 8888,
    
    // Testing ports
    TEST_SERVER: 9000,
    TEST_API: 9001
};

// Environment-based port selection
const getPort = (serverType, useAlternative = false) => {
    const portKey = useAlternative ? `ALT_${serverType}` : serverType;
    return process.env[`PORT_${serverType}`] || PORTS[portKey] || PORTS[serverType];
};

// Get all allowed origins for CORS
const getAllowedOrigins = () => {
    return [
        `http://localhost:${PORTS.DEV_SERVER}`,
        `http://127.0.0.1:${PORTS.DEV_SERVER}`,
        `http://localhost:${PORTS.ALT_DEV_SERVER}`,
        `http://127.0.0.1:${PORTS.ALT_DEV_SERVER}`,
        `http://localhost:${PORTS.API_SERVER}`,
        `http://127.0.0.1:${PORTS.API_SERVER}`,
        `http://localhost:${PORTS.DATABASE_SERVER}`,
        `http://127.0.0.1:${PORTS.DATABASE_SERVER}`,
        `http://localhost:${PORTS.ALT_DATABASE_SERVER}`,
        `http://127.0.0.1:${PORTS.ALT_DATABASE_SERVER}`,
        `http://localhost:${PORTS.NETLIFY_DEV}`,
        `http://127.0.0.1:${PORTS.NETLIFY_DEV}`,
        // Add common development ports
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:5501',
        'http://127.0.0.1:5501'
    ];
};

// Get API base URL based on current environment
const getApiBaseUrl = (hostname = 'localhost', protocol = 'http:') => {
    // Always use database server for API calls
    return `${protocol}//${hostname}:${PORTS.DATABASE_SERVER}/api/v2`;
};

// Port availability checker
const isPortAvailable = async (port, host = 'localhost') => {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, host, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        
        server.on('error', () => resolve(false));
    });
};

// Find next available port
const findAvailablePort = async (startPort, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
        const port = startPort + i;
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No available port found starting from ${startPort}`);
};

// Logging helper
const logPortConfiguration = (serverName, port, additionalInfo = {}) => {
    console.log(`🔧 ${serverName} Port Configuration:`);
    console.log(`   📍 Port: ${port}`);
    console.log(`   🌐 URL: http://localhost:${port}`);
    if (additionalInfo.apiEndpoint) {
        console.log(`   🔌 API: ${additionalInfo.apiEndpoint}`);
    }
    if (additionalInfo.allowedOrigins) {
        console.log(`   ✅ CORS Origins: ${additionalInfo.allowedOrigins.length} configured`);
    }
    console.log('');
};

module.exports = {
    PORTS,
    getPort,
    getAllowedOrigins,
    getApiBaseUrl,
    isPortAvailable,
    findAvailablePort,
    logPortConfiguration
};