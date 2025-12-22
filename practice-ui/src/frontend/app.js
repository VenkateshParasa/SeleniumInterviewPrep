// Main Application Entry Point
// Updated for new folder structure
// Coordinates all frontend components and services

class InterviewPrepApp {
    constructor() {
        this.config = {
            apiBaseUrl: '/api/v2',
            version: '2.0.0',
            environment: 'development'
        };

        // Initialize core services
        this.services = {};
        this.components = {};
        this.initialized = false;

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Interview Prep Platform v2.0.0');

            // Load configuration
            await this.loadConfiguration();

            // Initialize core services
            await this.initializeServices();

            // Initialize UI components
            await this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize application state
            await this.initializeAppState();

            this.initialized = true;
            console.log('✅ Interview Prep Platform initialized successfully');

            // Emit ready event
            document.dispatchEvent(new CustomEvent('app:ready', {
                detail: { app: this }
            }));

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showInitializationError(error);
        }
    }

    async loadConfiguration() {
        // Load configuration from environment or defaults
        this.config = {
            ...this.config,
            features: {
                analytics: true,
                socialFeatures: true,
                externalIntegrations: true,
                adaptiveLearning: true,
                offlineMode: true
            }
        };
    }

    async initializeServices() {
        console.log('🔧 Initializing services...');

        // Core API client
        if (window.APIClient) {
            this.services.api = new window.APIClient(this.config.apiBaseUrl);
        }

        // Performance manager
        if (window.PerformanceManager) {
            this.services.performance = new window.PerformanceManager();
        }

        // Analytics manager

        // Offline storage
        if (window.OfflineStorage) {
            this.services.storage = new window.OfflineStorage();
            await this.services.storage.init();
        }

        console.log('✅ Services initialized');
    }

    async initializeComponents() {
        console.log('🎨 Initializing components...');

        // Common components
        if (window.UIUtils) {
            this.components.ui = new window.UIUtils();
        }

        if (window.DataManager) {
            this.components.data = new window.DataManager(
                this.services.api,
                this.services.storage
            );
        }

        // Learning components
        if (window.ProgressManager) {
            this.components.progress = new window.ProgressManager(
                this.services.api,
                this.services.analytics
            );
        }

        if (window.QuestionManager) {
            this.components.questions = new window.QuestionManager(
                this.services.api,
                this.components.progress
            );
        }

        // Advanced features
        if (window.AdaptiveLearningEngine && this.config.features.adaptiveLearning) {
            this.components.adaptiveLearning = new window.AdaptiveLearningEngine(
                this.components.progress,
                this.services.analytics
            );
        }

        if (window.SocialFeaturesSystem && this.config.features.socialFeatures) {
            this.components.social = new window.SocialFeaturesSystem(
                this.services.api,
                this.services.analytics
            );
        }

        if (window.ExternalIntegrationSystem && this.config.features.externalIntegrations) {
            this.components.integrations = new window.ExternalIntegrationSystem(
                this.services.api,
                this.services.analytics
            );
        }

        // Admin components (load conditionally based on user role)
        await this.loadAdminComponents();

        console.log('✅ Components initialized');
    }

    async loadAdminComponents() {
        try {
            const user = await this.getCurrentUser();
            if (user && ['admin', 'moderator', 'content_creator'].includes(user.role)) {
                if (window.ContentManagementSystem) {
                    this.components.cms = new window.ContentManagementSystem(
                        this.services.api,
                        this.services.analytics
                    );
                }

                // Show admin tabs
                this.showAdminInterface();
            }
        } catch (error) {
            console.log('ℹ️ Admin components not loaded (user not authenticated or no admin role)');
        }
    }

    async getCurrentUser() {
        if (this.services.api && this.services.api.getCurrentUser) {
            try {
                const response = await this.services.api.getCurrentUser();
                return response.success ? response.data : null;
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    showAdminInterface() {
        const adminTab = document.querySelector('[data-tab="admin"]');
        if (adminTab) {
            adminTab.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            if (this.services.analytics) {
                this.services.analytics.trackEvent('javascript_error', {
                    message: event.error.message,
                    filename: event.filename,
                    lineno: event.lineno
                });
            }
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (this.services.analytics) {
                this.services.analytics.trackEvent('promise_rejection', {
                    reason: event.reason.toString()
                });
            }
        });

        // App lifecycle events
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleAppResume();
            } else {
                this.handleAppPause();
            }
        });

        // Tab switching
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-btn')) {
                this.handleTabSwitch(event.target.dataset.tab);
            }
        });
    }

    async initializeAppState() {
        // Load user data and preferences
        await this.loadUserData();

        // Initialize UI state
        this.initializeUI();

        // Start performance monitoring
        if (this.services.performance) {
            this.services.performance.startMonitoring();
        }
    }

    async loadUserData() {
        try {
            if (this.components.progress) {
                await this.components.progress.loadProgress();
            }

            if (this.components.data) {
                await this.components.data.initialize();
            }
        } catch (error) {
            console.warn('⚠️ Could not load user data:', error);
        }
    }

    initializeUI() {
        // Initialize dark mode
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
        }

        // Load default tab
        this.handleTabSwitch('dashboard');
    }

    handleTabSwitch(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const tabContent = document.getElementById(`${tabName}Tab`);
        if (tabContent) {
            tabContent.style.display = 'block';
        }

        // Add active class to selected tab button
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabButton) {
            tabButton.classList.add('active');
        }

        // Initialize tab-specific functionality
        this.initializeTabContent(tabName);

        // Track tab view
        if (this.services.analytics) {
            this.services.analytics.trackEvent('tab_viewed', { tab: tabName });
        }
    }

    initializeTabContent(tabName) {
        switch (tabName) {
            case 'dashboard':
                if (this.components.progress) {
                    this.components.progress.renderDashboard();
                }
                break;
            case 'questions':
                if (this.components.questions) {
                    this.components.questions.initialize();
                }
                break;
            case 'social':
                if (this.components.social) {
                    document.getElementById('socialTab').appendChild(
                        this.components.social.createSocialInterface()
                    );
                }
                break;
            case 'integrations':
                if (this.components.integrations) {
                    document.getElementById('integrationsTab').appendChild(
                        this.components.integrations.createIntegrationsInterface()
                    );
                }
                break;
            case 'admin':
                if (this.components.cms) {
                    document.getElementById('adminTab').appendChild(
                        this.components.cms.createAdminInterface()
                    );
                }
                break;
        }
    }

    handleAppResume() {
        console.log('📱 App resumed');

        // Sync data if offline storage is available
        if (this.services.storage) {
            this.services.storage.syncPendingChanges();
        }

        // Refresh critical data
        if (this.components.progress) {
            this.components.progress.refreshData();
        }
    }

    handleAppPause() {
        console.log('📱 App paused');

        // Save current state
        if (this.components.progress) {
            this.components.progress.saveCurrentState();
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');

        // Update dark mode icon
        const icon = document.querySelector('.dark-mode-icon');
        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }

        // Save preference
        localStorage.setItem('darkMode', isDark);

        // Track event
        if (this.services.analytics) {
            this.services.analytics.trackEvent('dark_mode_toggled', { enabled: isDark });
        }
    }

    showInitializationError(error) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'initialization-error';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h2>⚠️ Initialization Error</h2>
                <p>The application failed to initialize properly.</p>
                <details>
                    <summary>Error Details</summary>
                    <pre>${error.message}\n${error.stack}</pre>
                </details>
                <button onclick="location.reload()">🔄 Retry</button>
            </div>
        `;
        document.body.appendChild(errorContainer);
    }

    // Public API methods
    getService(name) {
        return this.services[name];
    }

    getComponent(name) {
        return this.components[name];
    }

    isReady() {
        return this.initialized;
    }
}

// Initialize application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.interviewPrepApp = new InterviewPrepApp();
    });
} else {
    window.interviewPrepApp = new InterviewPrepApp();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterviewPrepApp;
}