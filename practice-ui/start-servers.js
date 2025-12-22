#!/usr/bin/env node

// Server Management Script for Interview Prep Platform
// Created: December 22, 2025
// Purpose: Start and manage multiple servers with proper port configuration

const { spawn } = require('child_process');
const { PORTS, isPortAvailable, findAvailablePort, logPortConfiguration } = require('./config/ports');

class ServerManager {
    constructor() {
        this.servers = new Map();
        this.isShuttingDown = false;
    }

    async checkPortAvailability() {
        console.log('🔍 Checking port availability...\n');
        
        const portsToCheck = [
            { name: 'Database Server', port: PORTS.DATABASE_SERVER },
            { name: 'Dev Server', port: PORTS.DEV_SERVER },
            { name: 'API Server', port: PORTS.API_SERVER }
        ];

        for (const { name, port } of portsToCheck) {
            const available = await isPortAvailable(port);
            console.log(`   ${available ? '✅' : '❌'} ${name} (${port}): ${available ? 'Available' : 'In Use'}`);
        }
        console.log('');
    }

    async startServer(name, script, port, args = []) {
        try {
            console.log(`🚀 Starting ${name}...`);
            
            // Check if port is available
            const available = await isPortAvailable(port);
            if (!available) {
                console.log(`⚠️  Port ${port} is already in use for ${name}`);
                
                // Try to find alternative port
                try {
                    const altPort = await findAvailablePort(port + 1);
                    console.log(`🔄 Found alternative port: ${altPort}`);
                    // Note: You would need to modify the scripts to accept port as argument
                } catch (error) {
                    console.log(`❌ No alternative port found for ${name}`);
                    return false;
                }
            }

            const serverProcess = spawn('node', [script, ...args], {
                stdio: 'pipe',
                cwd: __dirname
            });

            this.servers.set(name, {
                process: serverProcess,
                port: port,
                script: script
            });

            // Handle server output
            serverProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`[${name}] ${output}`);
                }
            });

            serverProcess.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.error(`[${name} ERROR] ${output}`);
                }
            });

            serverProcess.on('close', (code) => {
                if (!this.isShuttingDown) {
                    console.log(`❌ ${name} exited with code ${code}`);
                }
                this.servers.delete(name);
            });

            serverProcess.on('error', (error) => {
                console.error(`❌ Failed to start ${name}:`, error.message);
                this.servers.delete(name);
            });

            // Give server time to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log(`✅ ${name} started on port ${port}\n`);
            return true;

        } catch (error) {
            console.error(`❌ Error starting ${name}:`, error.message);
            return false;
        }
    }

    async startDatabaseServer() {
        return await this.startServer(
            'Database Server',
            'database-server.js',
            PORTS.DATABASE_SERVER
        );
    }

    async startDevServer() {
        return await this.startServer(
            'Dev Server',
            'dev-server.js',
            PORTS.DEV_SERVER
        );
    }

    async testConnections() {
        console.log('🧪 Testing server connections...\n');
        
        const tests = [
            {
                name: 'Database Server Health',
                url: `http://localhost:${PORTS.DATABASE_SERVER}/health`
            },
            {
                name: 'Database Server API',
                url: `http://localhost:${PORTS.DATABASE_SERVER}/api/v2/health`
            },
            {
                name: 'Dev Server',
                url: `http://localhost:${PORTS.DEV_SERVER}`
            }
        ];

        for (const test of tests) {
            try {
                const response = await fetch(test.url);
                const status = response.ok ? '✅ OK' : `❌ ${response.status}`;
                console.log(`   ${status} ${test.name}: ${test.url}`);
            } catch (error) {
                console.log(`   ❌ FAIL ${test.name}: ${error.message}`);
            }
        }
        console.log('');
    }

    showStatus() {
        console.log('📊 Server Status:');
        if (this.servers.size === 0) {
            console.log('   No servers running\n');
            return;
        }

        for (const [name, server] of this.servers) {
            console.log(`   ✅ ${name} (PID: ${server.process.pid}, Port: ${server.port})`);
        }
        console.log('');
    }

    async shutdown() {
        if (this.isShuttingDown) return;
        
        this.isShuttingDown = true;
        console.log('\n🛑 Shutting down servers...');

        for (const [name, server] of this.servers) {
            console.log(`   Stopping ${name}...`);
            server.process.kill('SIGTERM');
        }

        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Force kill if needed
        for (const [name, server] of this.servers) {
            if (!server.process.killed) {
                console.log(`   Force killing ${name}...`);
                server.process.kill('SIGKILL');
            }
        }

        console.log('✅ All servers stopped');
        process.exit(0);
    }

    setupSignalHandlers() {
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
    }
}

// Main execution
async function main() {
    const manager = new ServerManager();
    manager.setupSignalHandlers();

    console.log('🎯 Interview Prep Platform - Server Manager');
    console.log('==========================================\n');

    // Show port configuration
    logPortConfiguration('Database Server', PORTS.DATABASE_SERVER);
    logPortConfiguration('Dev Server', PORTS.DEV_SERVER);

    // Check port availability
    await manager.checkPortAvailability();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'all';

    switch (command) {
        case 'db':
        case 'database':
            await manager.startDatabaseServer();
            break;
            
        case 'dev':
        case 'frontend':
            await manager.startDevServer();
            break;
            
        case 'test':
            await manager.testConnections();
            return;
            
        case 'status':
            manager.showStatus();
            return;
            
        case 'all':
        default:
            console.log('🚀 Starting all servers...\n');
            await manager.startDatabaseServer();
            await manager.startDevServer();
            break;
    }

    // Show status
    manager.showStatus();

    // Test connections after startup
    if (manager.servers.size > 0) {
        await manager.testConnections();
        
        console.log('🎉 Servers are running! Available commands:');
        console.log('   📱 Frontend: http://localhost:' + PORTS.DEV_SERVER);
        console.log('   🔧 API: http://localhost:' + PORTS.DATABASE_SERVER + '/api/v2');
        console.log('   ⚙️  Admin: http://localhost:' + PORTS.DATABASE_SERVER + '/admin');
        console.log('   🏥 Health: http://localhost:' + PORTS.DATABASE_SERVER + '/health');
        console.log('\n   Press Ctrl+C to stop all servers');
        
        // Keep process alive
        setInterval(() => {}, 1000);
    }
}

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🎯 Interview Prep Platform - Server Manager

Usage: node start-servers.js [command]

Commands:
  all        Start all servers (default)
  db         Start database server only
  dev        Start development server only
  test       Test server connections
  status     Show server status
  --help     Show this help

Examples:
  node start-servers.js          # Start all servers
  node start-servers.js db       # Start database server only
  node start-servers.js test     # Test connections
`);
    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Server manager error:', error);
        process.exit(1);
    });
}

module.exports = ServerManager;