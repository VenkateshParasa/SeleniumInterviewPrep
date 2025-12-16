// Offline Storage Manager
// IndexedDB implementation for offline functionality
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class OfflineStorageManager {
    constructor() {
        this.dbName = 'InterviewPrepDB';
        this.dbVersion = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.stores = {
            questions: 'questions',
            progress: 'progress',
            tracks: 'tracks',
            categories: 'categories',
            syncQueue: 'syncQueue',
            settings: 'settings'
        };

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('📡 Back online - processing sync queue');
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Gone offline - enabling offline mode');
        });
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.setupStores(db);
            };
        });
    }

    // Setup IndexedDB object stores
    setupStores(db) {
        // Questions store
        if (!db.objectStoreNames.contains(this.stores.questions)) {
            const questionsStore = db.createObjectStore(this.stores.questions, { keyPath: 'id' });
            questionsStore.createIndex('category', 'category', { unique: false });
            questionsStore.createIndex('difficulty', 'difficulty', { unique: false });
            questionsStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Progress store
        if (!db.objectStoreNames.contains(this.stores.progress)) {
            const progressStore = db.createObjectStore(this.stores.progress, { keyPath: 'id' });
            progressStore.createIndex('userId', 'userId', { unique: false });
            progressStore.createIndex('trackName', 'trackName', { unique: false });
            progressStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Tracks store
        if (!db.objectStoreNames.contains(this.stores.tracks)) {
            const tracksStore = db.createObjectStore(this.stores.tracks, { keyPath: 'id' });
            tracksStore.createIndex('name', 'name', { unique: false });
            tracksStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Categories store
        if (!db.objectStoreNames.contains(this.stores.categories)) {
            const categoriesStore = db.createObjectStore(this.stores.categories, { keyPath: 'id' });
            categoriesStore.createIndex('name', 'name', { unique: false });
            categoriesStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
            const syncStore = db.createObjectStore(this.stores.syncQueue, { keyPath: 'id', autoIncrement: true });
            syncStore.createIndex('operation', 'operation', { unique: false });
            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
            syncStore.createIndex('priority', 'priority', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(this.stores.settings)) {
            const settingsStore = db.createObjectStore(this.stores.settings, { keyPath: 'key' });
            settingsStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        console.log('🗄️ IndexedDB object stores created successfully');
    }

    // Generic store operations
    async getFromStore(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async putInStore(storeName, data) {
        data.lastModified = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFromStore(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Questions offline management
    async cacheQuestions(questions) {
        try {
            const promises = questions.map(question => {
                return this.putInStore(this.stores.questions, {
                    ...question,
                    cached: true,
                    cacheTimestamp: new Date().toISOString()
                });
            });
            await Promise.all(promises);
            console.log(`✅ Cached ${questions.length} questions for offline use`);
        } catch (error) {
            console.error('❌ Failed to cache questions:', error);
        }
    }

    async getOfflineQuestions(category = null, difficulty = null) {
        try {
            let questions = await this.getAllFromStore(this.stores.questions);

            // Filter by criteria if specified
            if (category) {
                questions = questions.filter(q => q.category === category);
            }
            if (difficulty) {
                questions = questions.filter(q => q.difficulty === difficulty);
            }

            console.log(`📱 Retrieved ${questions.length} questions from offline cache`);
            return questions;
        } catch (error) {
            console.error('❌ Failed to get offline questions:', error);
            return [];
        }
    }

    // Progress offline management
    async cacheProgress(progressData) {
        try {
            const progressWithMeta = {
                ...progressData,
                id: `${progressData.userId}_${progressData.trackName}`,
                synced: false,
                lastModified: new Date().toISOString()
            };

            await this.putInStore(this.stores.progress, progressWithMeta);
            console.log('✅ Progress cached for offline use');

            // Add to sync queue if offline
            if (!this.isOnline) {
                await this.addToSyncQueue('progress', 'update', progressWithMeta);
            }
        } catch (error) {
            console.error('❌ Failed to cache progress:', error);
        }
    }

    async getOfflineProgress(userId, trackName) {
        try {
            const progressId = `${userId}_${trackName}`;
            const progress = await this.getFromStore(this.stores.progress, progressId);

            if (progress) {
                console.log('📱 Retrieved progress from offline cache');
                return progress;
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to get offline progress:', error);
            return null;
        }
    }

    // Sync queue management
    async addToSyncQueue(type, operation, data, priority = 1) {
        try {
            const syncItem = {
                type,
                operation,
                data,
                priority,
                timestamp: new Date().toISOString(),
                attempts: 0,
                maxAttempts: 3
            };

            await this.putInStore(this.stores.syncQueue, syncItem);
            console.log(`📝 Added ${operation} ${type} to sync queue`);
        } catch (error) {
            console.error('❌ Failed to add to sync queue:', error);
        }
    }

    async processSyncQueue() {
        if (!this.isOnline) {
            console.log('📴 Still offline, cannot process sync queue');
            return;
        }

        try {
            const queueItems = await this.getAllFromStore(this.stores.syncQueue);

            if (queueItems.length === 0) {
                console.log('📭 Sync queue is empty');
                return;
            }

            console.log(`🔄 Processing ${queueItems.length} items in sync queue`);

            // Sort by priority (higher priority first) and timestamp
            queueItems.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return new Date(a.timestamp) - new Date(b.timestamp);
            });

            for (const item of queueItems) {
                try {
                    await this.processSyncItem(item);
                    await this.deleteFromStore(this.stores.syncQueue, item.id);
                } catch (error) {
                    console.error('❌ Failed to sync item:', error);

                    // Increment attempts and retry or remove if max attempts reached
                    item.attempts = (item.attempts || 0) + 1;
                    if (item.attempts >= item.maxAttempts) {
                        console.log(`🗑️ Removing failed sync item after ${item.attempts} attempts`);
                        await this.deleteFromStore(this.stores.syncQueue, item.id);
                    } else {
                        await this.putInStore(this.stores.syncQueue, item);
                    }
                }
            }

            console.log('✅ Sync queue processing completed');
        } catch (error) {
            console.error('❌ Failed to process sync queue:', error);
        }
    }

    async processSyncItem(item) {
        const { type, operation, data } = item;

        switch (type) {
            case 'progress':
                if (operation === 'update') {
                    await this.syncProgressToServer(data);
                }
                break;
            case 'settings':
                if (operation === 'update') {
                    await this.syncSettingsToServer(data);
                }
                break;
            default:
                console.log(`⚠️ Unknown sync type: ${type}`);
        }
    }

    async syncProgressToServer(progressData) {
        try {
            if (!window.apiV2Client) {
                throw new Error('API client not available');
            }

            const response = await window.apiV2Client.updateProgress(
                progressData.trackName,
                progressData
            );

            if (response.success) {
                // Mark as synced
                progressData.synced = true;
                await this.putInStore(this.stores.progress, progressData);
                console.log('✅ Progress synced to server');
            } else {
                throw new Error(response.error || 'Sync failed');
            }
        } catch (error) {
            console.error('❌ Failed to sync progress to server:', error);
            throw error;
        }
    }

    async syncSettingsToServer(settingsData) {
        try {
            if (!window.apiV2Client) {
                throw new Error('API client not available');
            }

            const response = await window.apiV2Client.updateSettings(settingsData);

            if (response.success) {
                console.log('✅ Settings synced to server');
            } else {
                throw new Error(response.error || 'Settings sync failed');
            }
        } catch (error) {
            console.error('❌ Failed to sync settings to server:', error);
            throw error;
        }
    }

    // Cache management
    async getCacheSize() {
        try {
            const stores = Object.values(this.stores);
            let totalSize = 0;

            for (const storeName of stores) {
                const items = await this.getAllFromStore(storeName);
                totalSize += new Blob([JSON.stringify(items)]).size;
            }

            return totalSize;
        } catch (error) {
            console.error('❌ Failed to calculate cache size:', error);
            return 0;
        }
    }

    async clearCache() {
        try {
            const stores = Object.values(this.stores);
            await Promise.all(stores.map(store => this.clearStore(store)));
            console.log('🧹 Offline cache cleared');
        } catch (error) {
            console.error('❌ Failed to clear cache:', error);
        }
    }

    // Get offline status
    isOffline() {
        return !this.isOnline;
    }

    // Get sync queue status
    async getSyncQueueStatus() {
        try {
            const queueItems = await this.getAllFromStore(this.stores.syncQueue);
            return {
                count: queueItems.length,
                pendingSync: queueItems.length > 0,
                oldestItem: queueItems.length > 0 ? queueItems[0].timestamp : null
            };
        } catch (error) {
            console.error('❌ Failed to get sync queue status:', error);
            return { count: 0, pendingSync: false, oldestItem: null };
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.OfflineStorageManager = OfflineStorageManager;
}