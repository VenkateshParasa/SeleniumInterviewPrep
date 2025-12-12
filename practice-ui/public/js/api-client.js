/**
 * API Client for Interview Preparation Platform
 * Hybrid mode: localStorage (primary) + Netlify Blobs (cloud backup)
 * No authentication required - uses device ID for identification
 */

class APIClient {
    constructor() {
        // Determine base URL based on environment
        this.baseURL = window.location.hostname === 'localhost'
            ? 'http://localhost:8888/.netlify/functions'  // Netlify Dev local
            : '/.netlify/functions';  // Production

        // Get or create device ID
        this.deviceId = this.getOrCreateDeviceId();
        
        // Track sync status
        this.lastSyncTime = null;
        this.isSyncing = false;

        console.log('✅ API Client initialized');
        console.log('📱 Device ID:', this.deviceId);
        console.log('🌐 API URL:', this.baseURL);
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