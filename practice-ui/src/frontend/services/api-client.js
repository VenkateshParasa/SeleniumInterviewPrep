/**
 * API Client for Interview Preparation Platform
 * Hybrid mode: localStorage (primary) + Netlify Blobs (cloud backup)
 * No authentication required - uses device ID for identification
 */

class APIClient {
    constructor() {
        // Determine if running locally or on Netlify
        this.isLocalDevelopment = window.location.hostname === 'localhost' ||
                                 window.location.hostname === '127.0.0.1' ||
                                 window.location.port === '8080' ||
                                 window.location.protocol === 'file:';

        // Set base URL based on environment
        if (this.isLocalDevelopment) {
            if (window.location.protocol === 'file:') {
                // For file:// protocol, disable all cloud functionality
                this.baseURL = null;
                console.info('🔧 Running from file:// - cloud sync disabled');
            } else {
                // For local development, check if Netlify dev is running on port 8888
                this.baseURL = 'http://localhost:8888/.netlify/functions';
                console.warn('🔧 Running in local development mode - cloud sync may not work');
            }
        } else {
            this.baseURL = '/.netlify/functions';  // Production
        }

        // Get or create device ID
        this.deviceId = this.getOrCreateDeviceId();

        // Track sync status
        this.lastSyncTime = null;
        this.isSyncing = false;

        console.log('✅ API Client initialized');
        console.log('📱 Device ID:', this.deviceId);
        console.log('🌐 API URL:', this.baseURL || 'Disabled (file:// protocol)');
        console.log('🏠 Local Development:', this.isLocalDevelopment);
        console.log('📂 Protocol:', window.location.protocol);
    }

    /**
     * Get or create a unique device ID
     * This ID persists in localStorage and identifies this device
     */
    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        
        if (!deviceId) {
            // Generate new device ID
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 11);
            deviceId = `device_${timestamp}_${random}`;
            
            localStorage.setItem('deviceId', deviceId);
            console.log('🆕 New device ID created:', deviceId);
        }
        
        return deviceId;
    }

    /**
     * Check if API is online and reachable
     */
    async isOnline() {
        // For file:// protocol, always return false (no cloud sync available)
        if (window.location.protocol === 'file:' || !this.baseURL) {
            return false;
        }

        // In local development, assume offline unless Netlify dev is running
        if (this.isLocalDevelopment) {
            try {
                const response = await fetch(`${this.baseURL}/sync-data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deviceId: this.deviceId,
                        action: 'list'
                    })
                });
                return response.ok;
            } catch (error) {
                console.info('💡 Cloud sync not available in local development mode');
                return false;
            }
        }

        // Production environment
        try {
            const response = await fetch(`${this.baseURL}/sync-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId: this.deviceId,
                    action: 'list'
                })
            });
            return response.ok;
        } catch (error) {
            console.warn('⚠️ API offline:', error.message);
            return false;
        }
    }

    /**
     * Sync data to cloud (Netlify Blobs)
     * @param {Object} progress - User progress data
     * @param {Object} dashboardData - Dashboard statistics
     * @param {Object} settings - User settings
     * @returns {Promise<Object>} Sync result
     */
    async syncToCloud(progress, dashboardData, settings) {
        // Prevent concurrent syncs
        if (this.isSyncing) {
            console.log('⏳ Sync already in progress, skipping...');
            return { success: false, message: 'Sync in progress' };
        }

        // For file:// protocol or no baseURL, skip cloud sync
        if (window.location.protocol === 'file:' || !this.baseURL) {
            console.info('💡 Cloud sync not available (file:// protocol or no baseURL)');
            return { success: false, message: 'Cloud sync not available in current environment' };
        }

        // In local development, skip cloud sync
        if (this.isLocalDevelopment) {
            console.info('💡 Skipping cloud sync in local development mode');
            return { success: false, message: 'Cloud sync not available in local development' };
        }

        this.isSyncing = true;

        try {
            const response = await fetch(`${this.baseURL}/sync-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceId: this.deviceId,
                    action: 'save',
                    data: {
                        progress,
                        dashboardData,
                        settings
                    }
                })
            });

            // Check if response is ok
            if (!response.ok) {
                console.warn(`⚠️ Cloud API returned ${response.status}: ${response.statusText}`);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }

            // Check content type before parsing JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('⚠️ Cloud API returned non-JSON response');
                return {
                    success: false,
                    error: 'Invalid response format'
                };
            }

            const result = await response.json();

            if (result.success) {
                this.lastSyncTime = new Date().toISOString();
                console.log('☁️ Data synced to cloud successfully');
                console.log('🕐 Last sync:', this.lastSyncTime);
            } else {
                console.warn('⚠️ Cloud sync failed:', result.error);
            }

            return result;

        } catch (error) {
            console.error('❌ Cloud sync error:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Load data from cloud (Netlify Blobs)
     * @returns {Promise<Object|null>} Cloud data or null if not found
     */
    async loadFromCloud() {
        try {
            // For file:// protocol or no baseURL, skip cloud loading
            if (window.location.protocol === 'file:' || !this.baseURL) {
                console.info('💡 Cloud loading not available (file:// protocol or no baseURL)');
                return null;
            }

            console.log('📥 Loading data from cloud...');

            const response = await fetch(`${this.baseURL}/sync-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceId: this.deviceId,
                    action: 'load'
                })
            });

            // Check if response is ok
            if (!response.ok) {
                console.warn(`⚠️ Cloud API returned ${response.status}: ${response.statusText}`);
                return null;
            }

            // Check content type before parsing JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('⚠️ Cloud API returned non-JSON response');
                return null;
            }

            const result = await response.json();

            if (result.success && result.data) {
                console.log('✅ Data loaded from cloud');
                console.log('🕐 Last cloud sync:', result.data.lastSync);
                return result.data;
            } else if (result.isNewDevice) {
                console.log('🆕 No cloud data found - this is a new device');
                return null;
            } else {
                console.warn('⚠️ Cloud load failed:', result.message);
                return null;
            }

        } catch (error) {
            console.error('❌ Cloud load error:', error);
            return null;
        }
    }

    /**
     * Get device information
     * @returns {Object} Device info
     */
    getDeviceInfo() {
        return {
            deviceId: this.deviceId,
            lastSyncTime: this.lastSyncTime,
            isSyncing: this.isSyncing,
            userAgent: navigator.userAgent,
            platform: navigator.platform
        };
    }

    /**
     * Reset device ID (for testing or device transfer)
     * WARNING: This will create a new device identity
     */
    resetDeviceId() {
        localStorage.removeItem('deviceId');
        this.deviceId = this.getOrCreateDeviceId();
        console.log('🔄 Device ID reset:', this.deviceId);
        return this.deviceId;
    }

    /**
     * Link this device to another device's data
     * @param {string} sourceDeviceId - Device ID to copy data from
     * @returns {Promise<boolean>} Success status
     */
    async linkToDevice(sourceDeviceId) {
        try {
            console.log('🔗 Linking to device:', sourceDeviceId);

            // Load data from source device
            const response = await fetch(`${this.baseURL}/sync-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceId: sourceDeviceId,
                    action: 'load'
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                // Save to current device
                const syncResult = await this.syncToCloud(
                    result.data.progress,
                    result.data.dashboardData,
                    result.data.settings
                );

                if (syncResult.success) {
                    console.log('✅ Successfully linked to device:', sourceDeviceId);
                    return true;
                }
            }

            console.warn('⚠️ Failed to link devices');
            return false;

        } catch (error) {
            console.error('❌ Device linking error:', error);
            return false;
        }
    }
}

// Create global API client instance
window.apiClient = new APIClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}