/**
 * API Client for Interview Preparation Platform
 * Handles all backend communication with authentication and error handling
 */

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.wsURL = 'http://localhost:3001';
        this.token = localStorage.getItem('authToken');
        this.refreshPromise = null;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Make authenticated HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        console.log('🌐 [DEBUG] API Request:', url);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            console.log('🌐 [DEBUG] Fetching:', url, 'with config:', config);
            const response = await fetch(url, config);
            console.log('🌐 [DEBUG] Response status:', response.status, response.statusText);

            // Handle 401 (Unauthorized) - token might be expired
            if (response.status === 401 && this.token) {
                console.error('🌐 [DEBUG] 401 Unauthorized - clearing auth');
                this.handleAuthError();
                throw new Error('Authentication expired. Please log in again.');
            }

            // Handle other HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('🌐 [DEBUG] HTTP Error:', response.status, errorData);
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const jsonResponse = await response.json();
            console.log('🌐 [DEBUG] Response data:', jsonResponse);
            return jsonResponse;
        } catch (error) {
            console.error(`🌐 [DEBUG] API request failed: ${endpoint}`, error);
            
            // Check if it's a network error
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                console.error('🌐 [DEBUG] Network error detected - server may not be running');
                throw new Error('Cannot connect to server. Please ensure the backend server is running at http://localhost:3001');
            }
            
            throw error;
        }
    }

    /**
     * Handle authentication errors
     */
    handleAuthError() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');

        // Redirect to login or show login modal
        if (typeof showNotification === 'function') {
            showNotification('Session expired. Please log in again.', 'warning');
        }
    }

    /**
     * Set authentication token
     */
    setAuthToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
        this.connectWebSocket();
    }

    /**
     * Clear authentication
     */
    clearAuth() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.disconnectWebSocket();
    }

    // ===================================
    // WEBSOCKET REAL-TIME SYNC
    // ===================================

    /**
     * Connect to WebSocket for real-time sync
     */
    connectWebSocket() {
        if (!this.token || !window.io) {
            console.warn('⚠️ WebSocket not available or not authenticated');
            return;
        }

        try {
            console.log('🔌 Connecting to WebSocket...');

            this.socket = io(this.wsURL, {
                auth: {
                    token: this.token
                },
                transports: ['websocket', 'polling']
            });

            this.setupWebSocketListeners();

        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
        }
    }

    /**
     * Setup WebSocket event listeners
     */
    setupWebSocketListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;

            if (typeof showNotification === 'function') {
                showNotification('Real-time sync enabled 🔄', 'success');
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            this.isConnected = false;

            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.handleWebSocketReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error);
            this.handleWebSocketReconnect();
        });

        // Real-time sync events
        this.socket.on('sync:progress:updated', (data) => {
            console.log('📥 Received progress update from another session');
            this.handleProgressUpdate(data);
        });

        this.socket.on('sync:settings:updated', (data) => {
            console.log('📥 Received settings update from another session');
            this.handleSettingsUpdate(data);
        });

        this.socket.on('sync:progress:ack', (data) => {
            console.log('✅ Progress sync acknowledged');
        });

        this.socket.on('sync:settings:ack', (data) => {
            console.log('✅ Settings sync acknowledged');
        });

        this.socket.on('sync:progress:error', (data) => {
            console.error('❌ Progress sync error:', data.error);
            if (typeof showNotification === 'function') {
                showNotification(`Sync error: ${data.error}`, 'error');
            }
        });

        this.socket.on('sync:settings:error', (data) => {
            console.error('❌ Settings sync error:', data.error);
            if (typeof showNotification === 'function') {
                showNotification(`Settings sync error: ${data.error}`, 'error');
            }
        });
    }

    /**
     * Handle WebSocket reconnection
     */
    handleWebSocketReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

            console.log(`🔄 WebSocket reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

            setTimeout(() => {
                this.connectWebSocket();
            }, delay);
        } else {
            console.error('❌ WebSocket max reconnection attempts reached');
            if (typeof showNotification === 'function') {
                showNotification('Real-time sync disconnected. Please refresh the page.', 'warning');
            }
        }
    }

    /**
     * Handle progress update from WebSocket
     */
    handleProgressUpdate(data) {
        try {
            // Update local storage
            localStorage.setItem('progress', JSON.stringify(data.progress));
            localStorage.setItem('dashboardData', JSON.stringify(data.dashboardData));

            // Notify application if update handler exists
            if (window.practicePortal && typeof window.practicePortal.onProgressUpdate === 'function') {
                window.practicePortal.onProgressUpdate(data);
            }

            if (typeof showNotification === 'function') {
                showNotification('Progress updated from another session', 'info');
            }

        } catch (error) {
            console.error('❌ Error handling progress update:', error);
        }
    }

    /**
     * Handle settings update from WebSocket
     */
    handleSettingsUpdate(data) {
        try {
            // Update local storage
            localStorage.setItem('userSettings', JSON.stringify(data.settings));

            // Notify application if update handler exists
            if (window.practicePortal && typeof window.practicePortal.onSettingsUpdate === 'function') {
                window.practicePortal.onSettingsUpdate(data);
            }

            if (typeof showNotification === 'function') {
                showNotification('Settings updated from another session', 'info');
            }

        } catch (error) {
            console.error('❌ Error handling settings update:', error);
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('🔌 WebSocket disconnected');
        }
    }

    /**
     * Send real-time progress update
     */
    sendProgressUpdate(progress, dashboardData) {
        if (this.socket && this.isConnected) {
            this.socket.emit('sync:progress', { progress, dashboardData });
            console.log('📤 Sent progress update via WebSocket');
            return true;
        }
        return false;
    }

    /**
     * Send real-time settings update
     */
    sendSettingsUpdate(settings) {
        if (this.socket && this.isConnected) {
            this.socket.emit('sync:settings', { settings });
            console.log('📤 Sent settings update via WebSocket');
            return true;
        }
        return false;
    }

    // ===================================
    // AUTHENTICATION ENDPOINTS
    // ===================================

    /**
     * Login user
     */
    async login(username, password) {
        console.log('🌐 [DEBUG] API Client: Login request starting');
        console.log('🌐 [DEBUG] API URL:', `${this.baseURL}/auth/login`);
        
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            console.log('🌐 [DEBUG] API Client: Login response received:', response);

            if (response.success && response.data.token) {
                console.log('🌐 [DEBUG] API Client: Login successful, setting token');
                this.setAuthToken(response.data.token);
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                console.log('🌐 [DEBUG] API Client: Token and user saved to localStorage');
                return response.data;
            }

            console.error('🌐 [DEBUG] API Client: Login failed - invalid response structure');
            throw new Error(response.error || 'Login failed');
        } catch (error) {
            console.error('🌐 [DEBUG] API Client: Login request failed:', error);
            throw error;
        }
    }

    /**
     * Get current user info
     */
    async getCurrentUser() {
        const response = await this.request('/auth/me');
        return response.data;
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    // ===================================
    // USER DATA ENDPOINTS
    // ===================================

    /**
     * Get user data (progress, dashboard, settings)
     */
    async getUserData() {
        const response = await this.request('/user/data');
        return response.data;
    }

    /**
     * Update user progress
     */
    async updateProgress(progressData, dashboardData) {
        const response = await this.request('/user/progress', {
            method: 'POST',
            body: JSON.stringify({
                progress: progressData,
                dashboardData: dashboardData
            })
        });
        return response.data;
    }

    /**
     * Update user settings
     */
    async updateSettings(settings) {
        const response = await this.request('/user/settings', {
            method: 'POST',
            body: JSON.stringify({ settings })
        });
        return response.data;
    }

    // ===================================
    // CONTENT ENDPOINTS
    // ===================================

    /**
     * Get practice data
     */
    async getPracticeData(level = 'senior') {
        const response = await this.request(`/content/practice-data?level=${level}`);
        return response.data;
    }

    /**
     * Get interview questions
     */
    async getInterviewQuestions() {
        const response = await this.request('/content/interview-questions');
        return response.data;
    }

    // ===================================
    // ANALYTICS ENDPOINTS
    // ===================================

    /**
     * Get user analytics/stats
     */
    async getAnalytics() {
        const response = await this.request('/analytics/stats');
        return response.data;
    }

    // ===================================
    // HEALTH CHECK ENDPOINTS
    // ===================================

    /**
     * Check server health
     */
    async healthCheck() {
        const response = await this.request('/health');
        return response;
    }

    /**
     * Get server status (requires auth)
     */
    async getServerStatus() {
        const response = await this.request('/status');
        return response.data;
    }

    // ===================================
    // DATA SYNCHRONIZATION
    // ===================================

    /**
     * Sync local data with server
     */
    async syncData() {
        try {
            // Get current local data
            const localProgress = JSON.parse(localStorage.getItem('progress') || '{}');
            const localDashboard = JSON.parse(localStorage.getItem('dashboardData') || '{}');
            const localSettings = JSON.parse(localStorage.getItem('settings') || '{}');

            // Get server data
            const serverData = await this.getUserData();

            // Compare timestamps and merge
            const mergedData = this.mergeDataWithConflictResolution(
                { progress: localProgress, dashboardData: localDashboard, settings: localSettings },
                serverData
            );

            // Update server with merged data
            if (mergedData.hasChanges) {
                await this.updateProgress(mergedData.progress, mergedData.dashboardData);
                await this.updateSettings(mergedData.settings);
            }

            // Update local storage with latest data
            localStorage.setItem('progress', JSON.stringify(mergedData.progress));
            localStorage.setItem('dashboardData', JSON.stringify(mergedData.dashboardData));
            localStorage.setItem('settings', JSON.stringify(mergedData.settings));

            return mergedData;
        } catch (error) {
            console.error('Data sync failed:', error);
            throw error;
        }
    }

    /**
     * Merge local and server data with conflict resolution
     */
    mergeDataWithConflictResolution(localData, serverData) {
        const result = {
            progress: { ...serverData.progress },
            dashboardData: { ...serverData.dashboardData },
            settings: { ...serverData.settings },
            hasChanges: false
        };

        // Merge progress (prefer server data but keep local additions)
        if (localData.progress && Object.keys(localData.progress).length > 0) {
            result.progress = { ...localData.progress, ...serverData.progress };
            result.hasChanges = true;
        }

        // Merge dashboard data (prefer most recent)
        if (localData.dashboardData) {
            // Keep higher values for counters
            if (localData.dashboardData.streak?.current > (serverData.dashboardData.streak?.current || 0)) {
                result.dashboardData.streak = localData.dashboardData.streak;
                result.hasChanges = true;
            }

            if (localData.dashboardData.studyTime?.total > (serverData.dashboardData.studyTime?.total || 0)) {
                result.dashboardData.studyTime = localData.dashboardData.studyTime;
                result.hasChanges = true;
            }
        }

        // Merge settings (prefer local settings)
        if (localData.settings && Object.keys(localData.settings).length > 0) {
            result.settings = { ...serverData.settings, ...localData.settings };
            result.hasChanges = true;
        }

        return result;
    }

    // ===================================
    // OFFLINE SUPPORT
    // ===================================

    /**
     * Check if server is reachable
     */
    async isOnline() {
        try {
            await this.healthCheck();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Queue data for when connection is restored
     */
    queueForSync(type, data) {
        const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        queue.push({
            type,
            data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('syncQueue', JSON.stringify(queue));
    }

    /**
     * Process queued sync operations
     */
    async processSyncQueue() {
        const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        if (queue.length === 0) return;

        const processed = [];
        for (const item of queue) {
            try {
                switch (item.type) {
                    case 'progress':
                        await this.updateProgress(item.data.progress, item.data.dashboardData);
                        break;
                    case 'settings':
                        await this.updateSettings(item.data);
                        break;
                }
                processed.push(item);
            } catch (error) {
                console.error('Failed to process sync item:', error);
                // Keep failed items in queue for retry
            }
        }

        // Remove processed items from queue
        const remainingQueue = queue.filter(item => !processed.includes(item));
        localStorage.setItem('syncQueue', JSON.stringify(remainingQueue));

        return processed.length;
    }
}

// Create global API client instance
window.apiClient = new APIClient();

// Auto-sync when online
window.addEventListener('online', async () => {
    if (window.apiClient.token) {
        try {
            await window.apiClient.processSyncQueue();
            await window.apiClient.syncData();
            if (typeof showNotification === 'function') {
                showNotification('Data synchronized successfully!', 'success');
            }
        } catch (error) {
            console.error('Auto-sync failed:', error);
        }
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}