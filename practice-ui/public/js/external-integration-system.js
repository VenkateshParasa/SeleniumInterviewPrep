// External Platforms Integration System
// Integration with LinkedIn, GitHub, LeetCode, and other platforms
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class ExternalIntegrationSystem {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.integrations = new Map();
        this.authTokens = new Map();
        this.syncStatus = new Map();

        // Supported platforms
        this.platforms = {
            linkedin: new LinkedInIntegration(),
            github: new GitHubIntegration(),
            leetcode: new LeetCodeIntegration(),
            hackerrank: new HackerRankIntegration(),
            calendly: new CalendlyIntegration(),
            notion: new NotionIntegration(),
            slack: new SlackIntegration(),
            discord: new DiscordIntegration()
        };

        this.webhooks = new Map();
        this.scheduledSyncs = new Map();

        this.initialize();
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    async initialize() {
        await this.loadExistingIntegrations();
        this.setupWebhookListeners();
        this.startScheduledSyncs();

        console.log('🔗 External Integration System initialized');
    }

    async loadExistingIntegrations() {
        try {
            const stored = localStorage.getItem('external_integrations');
            if (stored) {
                const data = JSON.parse(stored);
                this.integrations = new Map(data.integrations || []);
                this.authTokens = new Map(data.authTokens || []);
                this.syncStatus = new Map(data.syncStatus || []);
            }
        } catch (error) {
            console.error('❌ Failed to load existing integrations:', error);
        }
    }

    setupWebhookListeners() {
        // Listen for external platform events
        window.addEventListener('message', (event) => {
            this.handleExternalMessage(event);
        });
    }

    startScheduledSyncs() {
        // Start periodic syncs for connected platforms
        setInterval(() => {
            this.performScheduledSyncs();
        }, 15 * 60 * 1000); // Every 15 minutes
    }

    // ===================================
    // INTEGRATION INTERFACE
    // ===================================

    createIntegrationsInterface() {
        const integrationsContainer = document.createElement('div');
        integrationsContainer.className = 'integrations-interface';
        integrationsContainer.innerHTML = `
            <div class="integrations-header">
                <h2>🔗 Platform Integrations</h2>
                <p>Connect with external platforms to enhance your learning experience</p>
            </div>

            <div class="integrations-grid">
                ${this.renderPlatformCards()}
            </div>

            <div class="integrations-status">
                <h3>🔄 Sync Status</h3>
                <div id="syncStatusContainer">
                    ${this.renderSyncStatus()}
                </div>
            </div>

            <div class="integrations-settings">
                <h3>⚙️ Integration Settings</h3>
                <div class="settings-grid">
                    ${this.renderIntegrationSettings()}
                </div>
            </div>

            <div id="integrationModal" class="integration-modal" style="display: none;">
                <div class="integration-modal-content">
                    <span class="integration-modal-close">&times;</span>
                    <div id="integrationModalBody">
                        <!-- Modal content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        this.setupIntegrationsEventListeners(integrationsContainer);
        return integrationsContainer;
    }

    renderPlatformCards() {
        return Object.entries(this.platforms).map(([platformId, platform]) => {
            const isConnected = this.integrations.has(platformId);
            const lastSync = this.syncStatus.get(platformId)?.lastSync;

            return `
                <div class="platform-card ${isConnected ? 'connected' : 'disconnected'}" data-platform="${platformId}">
                    <div class="platform-header">
                        <div class="platform-icon">${platform.getIcon()}</div>
                        <div class="platform-info">
                            <h4>${platform.getName()}</h4>
                            <span class="platform-category">${platform.getCategory()}</span>
                        </div>
                        <div class="platform-status">
                            ${isConnected ?
                                '<span class="status-connected">✅ Connected</span>' :
                                '<span class="status-disconnected">❌ Not Connected</span>'
                            }
                        </div>
                    </div>

                    <div class="platform-description">
                        <p>${platform.getDescription()}</p>
                    </div>

                    <div class="platform-features">
                        <h5>Features:</h5>
                        <ul>
                            ${platform.getFeatures().map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>

                    ${isConnected ? `
                        <div class="platform-sync-info">
                            <div class="sync-detail">
                                <span class="sync-label">Last Sync:</span>
                                <span class="sync-value">${lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</span>
                            </div>
                        </div>
                    ` : ''}

                    <div class="platform-actions">
                        ${isConnected ? `
                            <button class="integration-btn integration-btn-primary" data-action="configure" data-platform="${platformId}">
                                ⚙️ Configure
                            </button>
                            <button class="integration-btn integration-btn-secondary" data-action="sync" data-platform="${platformId}">
                                🔄 Sync Now
                            </button>
                            <button class="integration-btn integration-btn-danger" data-action="disconnect" data-platform="${platformId}">
                                🔌 Disconnect
                            </button>
                        ` : `
                            <button class="integration-btn integration-btn-primary" data-action="connect" data-platform="${platformId}">
                                🔗 Connect
                            </button>
                            <button class="integration-btn integration-btn-secondary" data-action="learn-more" data-platform="${platformId}">
                                ℹ️ Learn More
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    setupIntegrationsEventListeners(container) {
        // Platform action buttons
        container.querySelectorAll('.integration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const platform = e.target.dataset.platform;
                this.handlePlatformAction(action, platform);
            });
        });

        // Modal close
        const modalClose = container.querySelector('.integration-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                container.querySelector('#integrationModal').style.display = 'none';
            });
        }
    }

    async handlePlatformAction(action, platformId) {
        const platform = this.platforms[platformId];
        if (!platform) return;

        switch (action) {
            case 'connect':
                await this.connectPlatform(platformId);
                break;
            case 'disconnect':
                await this.disconnectPlatform(platformId);
                break;
            case 'configure':
                this.showPlatformConfiguration(platformId);
                break;
            case 'sync':
                await this.syncPlatform(platformId);
                break;
            case 'learn-more':
                this.showPlatformInfo(platformId);
                break;
        }
    }

    // ===================================
    // PLATFORM CONNECTION
    // ===================================

    async connectPlatform(platformId) {
        const platform = this.platforms[platformId];
        if (!platform) return;

        try {
            console.log(`🔗 Connecting to ${platform.getName()}...`);

            // Show connection modal
            this.showConnectionModal(platformId);

        } catch (error) {
            console.error(`❌ Failed to connect to ${platformId}:`, error);
            this.showNotification(`Failed to connect to ${platform.getName()}`, 'error');
        }
    }

    showConnectionModal(platformId) {
        const platform = this.platforms[platformId];
        const modal = document.querySelector('#integrationModal');
        const modalBody = document.querySelector('#integrationModalBody');

        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="integration-connect-modal">
                <h3>🔗 Connect to ${platform.getName()}</h3>

                <div class="connection-info">
                    <div class="platform-benefits">
                        <h4>What you'll get:</h4>
                        <ul>
                            ${platform.getBenefits().map(benefit => `<li>✅ ${benefit}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="connection-permissions">
                        <h4>Permissions needed:</h4>
                        <ul>
                            ${platform.getPermissions().map(permission => `<li>🔐 ${permission}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                ${platform.requiresAuth() ? `
                    <div class="connection-auth">
                        <h4>Authentication</h4>
                        <p>You'll be redirected to ${platform.getName()} to authorize this connection.</p>
                        <div class="auth-info">
                            <span class="auth-security">🛡️ Secure OAuth 2.0 authentication</span>
                            <span class="auth-privacy">🔒 We never store your password</span>
                        </div>
                    </div>
                ` : `
                    <div class="connection-manual">
                        <h4>Manual Setup</h4>
                        <div class="manual-steps">
                            ${platform.getSetupSteps().map((step, index) => `
                                <div class="setup-step">
                                    <span class="step-number">${index + 1}</span>
                                    <span class="step-text">${step}</span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="manual-inputs">
                            ${platform.getRequiredFields().map(field => `
                                <div class="input-group">
                                    <label for="${field.id}">${field.label}:</label>
                                    <input type="${field.type}" id="${field.id}" placeholder="${field.placeholder}" required>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `}

                <div class="connection-settings">
                    <h4>Sync Settings</h4>
                    <div class="sync-options">
                        <label class="sync-option">
                            <input type="checkbox" id="autoSync" checked>
                            <span>🔄 Enable automatic sync</span>
                        </label>
                        <label class="sync-option">
                            <input type="checkbox" id="notifications">
                            <span>🔔 Sync notifications</span>
                        </label>
                        <label class="sync-option">
                            <input type="checkbox" id="bidirectional">
                            <span>↔️ Two-way sync (if supported)</span>
                        </label>
                    </div>

                    <div class="sync-frequency">
                        <label for="syncFrequency">Sync frequency:</label>
                        <select id="syncFrequency">
                            <option value="5">Every 5 minutes</option>
                            <option value="15" selected>Every 15 minutes</option>
                            <option value="60">Every hour</option>
                            <option value="1440">Daily</option>
                        </select>
                    </div>
                </div>

                <div class="connection-actions">
                    <button id="startConnection" class="btn-primary">
                        🚀 ${platform.requiresAuth() ? 'Authorize Connection' : 'Create Connection'}
                    </button>
                    <button id="cancelConnection" class="btn-cancel">❌ Cancel</button>
                </div>
            </div>
        `;

        this.setupConnectionListeners(platformId);
        modal.style.display = 'block';
    }

    setupConnectionListeners(platformId) {
        const startBtn = document.querySelector('#startConnection');
        const cancelBtn = document.querySelector('#cancelConnection');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.executeConnection(platformId);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.querySelector('#integrationModal').style.display = 'none';
            });
        }
    }

    async executeConnection(platformId) {
        const platform = this.platforms[platformId];

        try {
            let connectionData;

            if (platform.requiresAuth()) {
                // OAuth flow
                connectionData = await this.performOAuthFlow(platformId);
            } else {
                // Manual configuration
                connectionData = this.collectManualConfiguration(platformId);
            }

            // Store connection
            await this.storeConnection(platformId, connectionData);

            // Initial sync
            await this.performInitialSync(platformId);

            this.showNotification(`Successfully connected to ${platform.getName()}! 🎉`, 'success');
            document.querySelector('#integrationModal').style.display = 'none';

            // Refresh interface
            this.refreshIntegrationsInterface();

        } catch (error) {
            console.error(`❌ Failed to create connection to ${platformId}:`, error);
            this.showNotification(`Failed to connect to ${platform.getName()}`, 'error');
        }
    }

    // ===================================
    // PLATFORM SYNCING
    // ===================================

    async syncPlatform(platformId) {
        const platform = this.platforms[platformId];
        if (!this.integrations.has(platformId)) {
            this.showNotification(`${platform.getName()} is not connected`, 'error');
            return;
        }

        try {
            console.log(`🔄 Syncing ${platform.getName()}...`);

            const syncResult = await platform.sync(this.integrations.get(platformId));

            // Update sync status
            this.syncStatus.set(platformId, {
                lastSync: new Date().toISOString(),
                status: 'success',
                itemsProcessed: syncResult.itemsProcessed || 0,
                errors: syncResult.errors || []
            });

            // Save state
            await this.saveIntegrationsState();

            this.showNotification(`${platform.getName()} synced successfully! (${syncResult.itemsProcessed} items)`, 'success');

        } catch (error) {
            console.error(`❌ Failed to sync ${platformId}:`, error);

            // Update sync status with error
            this.syncStatus.set(platformId, {
                lastSync: new Date().toISOString(),
                status: 'error',
                error: error.message
            });

            this.showNotification(`Failed to sync ${platform.getName()}: ${error.message}`, 'error');
        }
    }

    async performScheduledSyncs() {
        for (const [platformId, integration] of this.integrations) {
            if (integration.autoSync) {
                const lastSync = this.syncStatus.get(platformId)?.lastSync;
                const syncFrequency = integration.syncFrequency || 15; // minutes

                if (!lastSync || Date.now() - new Date(lastSync).getTime() > syncFrequency * 60 * 1000) {
                    await this.syncPlatform(platformId);
                }
            }
        }
    }

    // ===================================
    // PLATFORM IMPLEMENTATIONS
    // ===================================

    async performOAuthFlow(platformId) {
        const platform = this.platforms[platformId];

        return new Promise((resolve, reject) => {
            // Simulate OAuth flow
            const authWindow = window.open(
                platform.getAuthURL(),
                'auth',
                'width=600,height=600,scrollbars=yes,resizable=yes'
            );

            const checkClosed = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(checkClosed);
                    // In real implementation, we'd get the auth code from the callback
                    resolve({
                        accessToken: 'mock_access_token',
                        refreshToken: 'mock_refresh_token',
                        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
                    });
                }
            }, 1000);

            // Timeout after 5 minutes
            setTimeout(() => {
                if (!authWindow.closed) {
                    authWindow.close();
                    clearInterval(checkClosed);
                    reject(new Error('Authentication timeout'));
                }
            }, 5 * 60 * 1000);
        });
    }

    collectManualConfiguration(platformId) {
        const platform = this.platforms[platformId];
        const config = {};

        platform.getRequiredFields().forEach(field => {
            const input = document.querySelector(`#${field.id}`);
            if (input) {
                config[field.id] = input.value;
            }
        });

        // Add sync settings
        config.autoSync = document.querySelector('#autoSync').checked;
        config.notifications = document.querySelector('#notifications').checked;
        config.bidirectional = document.querySelector('#bidirectional').checked;
        config.syncFrequency = parseInt(document.querySelector('#syncFrequency').value);

        return config;
    }

    async storeConnection(platformId, connectionData) {
        this.integrations.set(platformId, {
            ...connectionData,
            connectedAt: new Date().toISOString(),
            platform: platformId
        });

        this.syncStatus.set(platformId, {
            lastSync: null,
            status: 'connected',
            itemsProcessed: 0
        });

        await this.saveIntegrationsState();
    }

    async saveIntegrationsState() {
        const state = {
            integrations: Array.from(this.integrations.entries()),
            authTokens: Array.from(this.authTokens.entries()),
            syncStatus: Array.from(this.syncStatus.entries())
        };

        localStorage.setItem('external_integrations', JSON.stringify(state));
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    renderSyncStatus() {
        if (this.syncStatus.size === 0) {
            return '<p class="no-syncs">No active integrations</p>';
        }

        return Array.from(this.syncStatus.entries()).map(([platformId, status]) => {
            const platform = this.platforms[platformId];
            return `
                <div class="sync-status-item">
                    <div class="sync-platform">
                        <span class="sync-icon">${platform.getIcon()}</span>
                        <span class="sync-name">${platform.getName()}</span>
                    </div>
                    <div class="sync-details">
                        <span class="sync-status ${status.status}">${status.status}</span>
                        <span class="sync-time">${status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}</span>
                        ${status.itemsProcessed ? `<span class="sync-items">${status.itemsProcessed} items</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderIntegrationSettings() {
        return `
            <div class="setting-group">
                <h4>🔄 Global Sync Settings</h4>
                <label class="setting-option">
                    <input type="checkbox" id="globalAutoSync" checked>
                    <span>Enable automatic syncing for all platforms</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="globalNotifications">
                    <span>Show sync notifications</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="backgroundSync" checked>
                    <span>Allow background syncing when app is closed</span>
                </label>
            </div>

            <div class="setting-group">
                <h4>🔒 Privacy Settings</h4>
                <label class="setting-option">
                    <input type="checkbox" id="shareProgress">
                    <span>Share progress with connected platforms</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="shareAchievements" checked>
                    <span>Share achievements on social platforms</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="anonymousSharing">
                    <span>Use anonymous sharing when possible</span>
                </label>
            </div>
        `;
    }

    refreshIntegrationsInterface() {
        const container = document.querySelector('.integrations-interface');
        if (container) {
            const newInterface = this.createIntegrationsInterface();
            container.innerHTML = newInterface.innerHTML;
            this.setupIntegrationsEventListeners(container);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `integration-notification integration-notification-${type}`;
        notification.innerHTML = `
            <span class="integration-notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="integration-notification-text">${message}</span>
            <button class="integration-notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        notification.querySelector('.integration-notification-close').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// ===================================
// PLATFORM INTEGRATIONS
// ===================================

class PlatformIntegration {
    getName() { return 'Base Platform'; }
    getIcon() { return '🔗'; }
    getCategory() { return 'General'; }
    getDescription() { return 'Base platform integration'; }
    getFeatures() { return []; }
    getBenefits() { return []; }
    getPermissions() { return []; }
    requiresAuth() { return false; }
    getAuthURL() { return ''; }
    getSetupSteps() { return []; }
    getRequiredFields() { return []; }
    async sync(config) { return { itemsProcessed: 0 }; }
}

class LinkedInIntegration extends PlatformIntegration {
    getName() { return 'LinkedIn'; }
    getIcon() { return '💼'; }
    getCategory() { return 'Professional'; }
    getDescription() { return 'Share your learning progress and connect with professional network'; }
    getFeatures() { return ['Share achievements', 'Network with professionals', 'Job recommendations']; }
    getBenefits() { return ['Showcase your skills', 'Build professional credibility', 'Discover job opportunities']; }
    getPermissions() { return ['Post on your behalf', 'Access profile information']; }
    requiresAuth() { return true; }
    getAuthURL() { return 'https://linkedin.com/oauth/authorize?...'; }

    async sync(config) {
        // Simulate LinkedIn sync
        console.log('🔄 Syncing with LinkedIn...');
        return { itemsProcessed: 3 };
    }
}

class GitHubIntegration extends PlatformIntegration {
    getName() { return 'GitHub'; }
    getIcon() { return '🐱'; }
    getCategory() { return 'Development'; }
    getDescription() { return 'Sync your coding practice and showcase technical skills'; }
    getFeatures() { return ['Commit practice code', 'Showcase projects', 'Track contributions']; }
    getBenefits() { return ['Build coding portfolio', 'Show consistent practice', 'Demonstrate skills to employers']; }
    getPermissions() { return ['Create repositories', 'Read profile information']; }
    requiresAuth() { return true; }
    getAuthURL() { return 'https://github.com/login/oauth/authorize?...'; }
}

class LeetCodeIntegration extends PlatformIntegration {
    getName() { return 'LeetCode'; }
    getIcon() { return '💻'; }
    getCategory() { return 'Coding Practice'; }
    getDescription() { return 'Import solved problems and track coding progress'; }
    getFeatures() { return ['Import solved problems', 'Track difficulty progression', 'Sync contest ratings']; }
    getBenefits() { return ['Unified progress tracking', 'Identify skill gaps', 'Optimize study plan']; }
    requiresAuth() { return false; }

    getSetupSteps() {
        return [
            'Go to your LeetCode profile',
            'Copy your username',
            'Paste it in the field below',
            'Optionally add your API key for detailed stats'
        ];
    }

    getRequiredFields() {
        return [
            { id: 'username', label: 'Username', type: 'text', placeholder: 'your-leetcode-username' },
            { id: 'apiKey', label: 'API Key (Optional)', type: 'password', placeholder: 'Optional for enhanced features' }
        ];
    }
}

class HackerRankIntegration extends PlatformIntegration {
    getName() { return 'HackerRank'; }
    getIcon() { return '👨‍💻'; }
    getCategory() { return 'Coding Practice'; }
    getDescription() { return 'Sync certifications and skill assessments'; }
    getFeatures() { return ['Import certifications', 'Track skill badges', 'Sync contest performance']; }
}

class CalendlyIntegration extends PlatformIntegration {
    getName() { return 'Calendly'; }
    getIcon() { return '📅'; }
    getCategory() { return 'Scheduling'; }
    getDescription() { return 'Schedule mock interviews and study sessions'; }
    getFeatures() { return ['Schedule study sessions', 'Book mock interviews', 'Sync with calendar']; }
}

class NotionIntegration extends PlatformIntegration {
    getName() { return 'Notion'; }
    getIcon() { return '📝'; }
    getCategory() { return 'Productivity'; }
    getDescription() { return 'Export notes and create study databases'; }
    getFeatures() { return ['Export study notes', 'Create question databases', 'Track progress in Notion']; }
}

class SlackIntegration extends PlatformIntegration {
    getName() { return 'Slack'; }
    getIcon() { return '💬'; }
    getCategory() { return 'Communication'; }
    getDescription() { return 'Share progress and discuss questions with team'; }
    getFeatures() { return ['Share daily progress', 'Discuss questions', 'Get study reminders']; }
}

class DiscordIntegration extends PlatformIntegration {
    getName() { return 'Discord'; }
    getIcon() { return '🎮'; }
    getCategory() { return 'Community'; }
    getDescription() { return 'Join study groups and participate in discussions'; }
    getFeatures() { return ['Join study servers', 'Share achievements', 'Collaborative learning']; }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ExternalIntegrationSystem = ExternalIntegrationSystem;
}