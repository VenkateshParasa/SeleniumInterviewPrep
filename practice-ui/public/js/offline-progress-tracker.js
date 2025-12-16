// Offline Progress Tracker
// Enhanced progress tracking with offline sync and conflict resolution
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class OfflineProgressTracker {
    constructor(offlineStorage, conflictResolver, apiClient) {
        this.offlineStorage = offlineStorage;
        this.conflictResolver = conflictResolver;
        this.apiClient = apiClient;
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.progressQueue = [];
        this.lastSyncTime = null;

        // Offline progress structure
        this.progressSchema = {
            userId: null,
            tracks: {},
            sessions: [],
            achievements: {},
            streaks: {
                current: 0,
                longest: 0,
                lastStudyDate: null,
                studyDates: []
            },
            statistics: {
                totalStudyTime: 0,
                questionsStudied: [],
                categoriesExplored: {},
                completionRate: 0
            },
            lastModified: null,
            synced: false
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('📡 Back online - syncing progress');
            this.syncOfflineProgress();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Gone offline - enabling offline progress tracking');
        });

        // Listen for beforeunload to save progress
        window.addEventListener('beforeunload', () => {
            this.saveProgressBeforeUnload();
        });

        // Listen for visibility change to sync when app becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isOnline) {
                this.syncOfflineProgress();
            }
        });
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    async initialize(userId) {
        try {
            await this.offlineStorage.init();

            // Load or create user progress
            let userProgress = await this.offlineStorage.getFromStore('progress', `user_${userId}`);

            if (!userProgress) {
                userProgress = {
                    id: `user_${userId}`,
                    ...this.progressSchema,
                    userId,
                    lastModified: new Date().toISOString()
                };
                await this.offlineStorage.putInStore('progress', userProgress);
            }

            this.currentProgress = userProgress;
            console.log('✅ Offline progress tracker initialized');

            // Try to sync with server if online
            if (this.isOnline) {
                setTimeout(() => this.syncOfflineProgress(), 1000);
            }

            return userProgress;
        } catch (error) {
            console.error('❌ Failed to initialize offline progress tracker:', error);
            throw error;
        }
    }

    // ===================================
    // PROGRESS TRACKING
    // ===================================

    async trackDayCompletion(userId, trackName, dayNumber, tasks = []) {
        const timestamp = new Date().toISOString();
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        try {
            // Update local progress
            if (!this.currentProgress.tracks[trackName]) {
                this.currentProgress.tracks[trackName] = {
                    completedDays: {},
                    currentDay: 1,
                    totalDays: 0
                };
            }

            const track = this.currentProgress.tracks[trackName];
            track.completedDays[dayNumber] = {
                completedAt: timestamp,
                tasks: tasks || [],
                studyTime: 0 // Will be calculated
            };

            track.currentDay = Math.max(track.currentDay, dayNumber + 1);

            // Update streak
            await this.updateStreak(date);

            // Update statistics
            await this.updateStatistics('day_completed', { trackName, dayNumber });

            // Save to local storage
            this.currentProgress.lastModified = timestamp;
            this.currentProgress.synced = false;
            await this.offlineStorage.putInStore('progress', this.currentProgress);

            // Add to sync queue if offline
            if (!this.isOnline) {
                await this.addToProgressQueue('day_completion', {
                    userId,
                    trackName,
                    dayNumber,
                    tasks,
                    timestamp
                });
            } else {
                // Try immediate sync
                this.syncProgressItem('day_completion', {
                    userId,
                    trackName,
                    dayNumber,
                    tasks,
                    timestamp
                });
            }

            console.log(`✅ Day ${dayNumber} completion tracked for ${trackName}`);
            return track.completedDays[dayNumber];

        } catch (error) {
            console.error('❌ Failed to track day completion:', error);
            throw error;
        }
    }

    async trackQuestionStudied(questionId, category, difficulty, timeSpent) {
        const timestamp = new Date().toISOString();

        try {
            // Update questions studied
            if (!this.currentProgress.statistics.questionsStudied.includes(questionId)) {
                this.currentProgress.statistics.questionsStudied.push(questionId);
            }

            // Update category progress
            if (!this.currentProgress.statistics.categoriesExplored[category]) {
                this.currentProgress.statistics.categoriesExplored[category] = 0;
            }
            this.currentProgress.statistics.categoriesExplored[category]++;

            // Add study session
            const session = {
                id: `session_${Date.now()}`,
                type: 'question_study',
                questionId,
                category,
                difficulty,
                timeSpent,
                timestamp
            };

            this.currentProgress.sessions.push(session);

            // Update total study time
            this.currentProgress.statistics.totalStudyTime += timeSpent;

            // Check for achievements
            await this.checkAchievements();

            // Save progress
            this.currentProgress.lastModified = timestamp;
            this.currentProgress.synced = false;
            await this.offlineStorage.putInStore('progress', this.currentProgress);

            // Queue for sync
            if (!this.isOnline) {
                await this.addToProgressQueue('question_studied', session);
            }

            console.log(`📚 Question ${questionId} study tracked`);
            return session;

        } catch (error) {
            console.error('❌ Failed to track question study:', error);
            throw error;
        }
    }

    async trackSessionTime(sessionType, duration, metadata = {}) {
        const timestamp = new Date().toISOString();

        try {
            const session = {
                id: `session_${Date.now()}`,
                type: sessionType,
                duration,
                metadata,
                timestamp
            };

            this.currentProgress.sessions.push(session);
            this.currentProgress.statistics.totalStudyTime += duration;

            // Update daily progress if it's a study session
            if (sessionType === 'study' || sessionType === 'practice') {
                const today = new Date().toISOString().split('T')[0];
                await this.updateStreak(today);
            }

            // Save progress
            this.currentProgress.lastModified = timestamp;
            this.currentProgress.synced = false;
            await this.offlineStorage.putInStore('progress', this.currentProgress);

            console.log(`⏰ Session tracked: ${sessionType} for ${duration}ms`);
            return session;

        } catch (error) {
            console.error('❌ Failed to track session time:', error);
            throw error;
        }
    }

    // ===================================
    // STREAK MANAGEMENT
    // ===================================

    async updateStreak(studyDate) {
        const dateStr = typeof studyDate === 'string' ? studyDate : studyDate.toISOString().split('T')[0];
        const streaks = this.currentProgress.streaks;

        // Add to study dates if not already present
        if (!streaks.studyDates.includes(dateStr)) {
            streaks.studyDates.push(dateStr);
            streaks.studyDates.sort();
        }

        // Calculate current streak
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (streaks.lastStudyDate === yesterday || streaks.lastStudyDate === today) {
            // Continue or maintain streak
            if (streaks.lastStudyDate !== today) {
                streaks.current++;
                streaks.lastStudyDate = today;
            }
        } else if (streaks.lastStudyDate !== today) {
            // Reset streak
            streaks.current = 1;
            streaks.lastStudyDate = today;
        }

        // Update longest streak
        streaks.longest = Math.max(streaks.longest, streaks.current);

        console.log(`🔥 Streak updated: Current ${streaks.current}, Longest ${streaks.longest}`);
    }

    // ===================================
    // ACHIEVEMENTS
    // ===================================

    async checkAchievements() {
        const achievements = this.currentProgress.achievements;
        const stats = this.currentProgress.statistics;
        let newAchievements = [];

        // First day achievement
        if (!achievements.first_day && stats.questionsStudied.length > 0) {
            achievements.first_day = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                title: 'First Steps',
                description: 'Studied your first question'
            };
            newAchievements.push('first_day');
        }

        // Question solver achievement
        if (!achievements.question_solver && stats.questionsStudied.length >= 10) {
            achievements.question_solver = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                title: 'Question Solver',
                description: 'Studied 10 questions'
            };
            newAchievements.push('question_solver');
        }

        // Category explorer achievement
        const categoriesCount = Object.keys(stats.categoriesExplored).length;
        if (!achievements.category_explorer && categoriesCount >= 3) {
            achievements.category_explorer = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                title: 'Category Explorer',
                description: 'Explored 3 different categories'
            };
            newAchievements.push('category_explorer');
        }

        // Streak achievements
        const currentStreak = this.currentProgress.streaks.current;
        if (!achievements.streak_starter && currentStreak >= 3) {
            achievements.streak_starter = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                title: 'Streak Starter',
                description: '3-day study streak'
            };
            newAchievements.push('streak_starter');
        }

        if (!achievements.streak_master && currentStreak >= 7) {
            achievements.streak_master = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                title: 'Streak Master',
                description: '7-day study streak'
            };
            newAchievements.push('streak_master');
        }

        // Time achievements
        const totalHours = stats.totalStudyTime / (1000 * 60 * 60);
        if (!achievements.time_keeper && totalHours >= 5) {
            achievements.time_keeper = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                title: 'Time Keeper',
                description: '5 hours of study time'
            };
            newAchievements.push('time_keeper');
        }

        // Notify about new achievements
        if (newAchievements.length > 0) {
            this.notifyAchievements(newAchievements);
        }

        return newAchievements;
    }

    notifyAchievements(achievements) {
        achievements.forEach(achievementKey => {
            const achievement = this.currentProgress.achievements[achievementKey];
            if (achievement && window.portal && window.portal.showErrorMessage) {
                window.portal.showErrorMessage(
                    `🏆 Achievement Unlocked: ${achievement.title}`,
                    'success'
                );
            }
            console.log(`🏆 Achievement unlocked: ${achievement.title}`);
        });
    }

    // ===================================
    // SYNC MANAGEMENT
    // ===================================

    async addToProgressQueue(action, data) {
        try {
            await this.offlineStorage.addToSyncQueue('progress', action, data, 2); // High priority
            console.log(`📝 Added ${action} to progress sync queue`);
        } catch (error) {
            console.error('❌ Failed to add to progress queue:', error);
        }
    }

    async syncOfflineProgress() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;

        try {
            console.log('🔄 Starting offline progress sync...');

            // Get current server progress
            const serverProgress = await this.getServerProgress();

            if (serverProgress && this.currentProgress) {
                // Check for conflicts
                const conflicts = await this.conflictResolver.detectConflicts(
                    'progress',
                    this.currentProgress,
                    serverProgress
                );

                if (conflicts && conflicts.length > 0) {
                    console.log(`⚠️ Found ${conflicts.length} progress conflicts`);
                    const resolutions = await this.conflictResolver.resolveConflicts('progress', conflicts);

                    // Apply resolutions
                    for (const resolution of resolutions) {
                        if (resolution.resolvedValue !== null) {
                            await this.applyProgressResolution(resolution);
                        }
                    }
                }
            }

            // Sync local progress to server
            await this.syncToServer();

            // Process sync queue
            await this.offlineStorage.processSyncQueue();

            this.lastSyncTime = new Date().toISOString();
            console.log('✅ Offline progress sync completed');

        } catch (error) {
            console.error('❌ Failed to sync offline progress:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncProgressItem(action, data) {
        if (!this.isOnline) {
            return;
        }

        try {
            // Send individual progress item to server
            if (this.apiClient && this.apiClient.updateProgress) {
                const response = await this.apiClient.updateProgress(data);
                if (response.success) {
                    console.log(`✅ Progress item synced: ${action}`);
                } else {
                    console.error(`❌ Failed to sync progress item: ${response.error}`);
                    // Add to queue for retry
                    await this.addToProgressQueue(action, data);
                }
            }
        } catch (error) {
            console.error(`❌ Error syncing progress item:`, error);
            // Add to queue for retry
            await this.addToProgressQueue(action, data);
        }
    }

    async getServerProgress() {
        try {
            if (this.apiClient && this.apiClient.getProgress) {
                const response = await this.apiClient.getProgress();
                return response.success ? response.data : null;
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to get server progress:', error);
            return null;
        }
    }

    async syncToServer() {
        try {
            if (this.apiClient && this.apiClient.updateProgress && !this.currentProgress.synced) {
                const response = await this.apiClient.updateProgress(this.currentProgress);
                if (response.success) {
                    this.currentProgress.synced = true;
                    await this.offlineStorage.putInStore('progress', this.currentProgress);
                    console.log('✅ Local progress synced to server');
                }
            }
        } catch (error) {
            console.error('❌ Failed to sync to server:', error);
        }
    }

    async applyProgressResolution(resolution) {
        if (resolution.field === 'general') {
            this.currentProgress = { ...this.currentProgress, ...resolution.resolvedValue };
        } else {
            // Apply specific field resolution
            const fieldPath = resolution.field.split('.');
            let current = this.currentProgress;

            for (let i = 0; i < fieldPath.length - 1; i++) {
                if (!current[fieldPath[i]]) {
                    current[fieldPath[i]] = {};
                }
                current = current[fieldPath[i]];
            }

            current[fieldPath[fieldPath.length - 1]] = resolution.resolvedValue;
        }

        this.currentProgress.lastModified = resolution.timestamp;
        await this.offlineStorage.putInStore('progress', this.currentProgress);
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    async saveProgressBeforeUnload() {
        try {
            if (this.currentProgress) {
                this.currentProgress.lastModified = new Date().toISOString();
                await this.offlineStorage.putInStore('progress', this.currentProgress);
            }
        } catch (error) {
            console.error('❌ Failed to save progress before unload:', error);
        }
    }

    getCurrentProgress() {
        return this.currentProgress ? { ...this.currentProgress } : null;
    }

    async updateStatistics(type, data) {
        switch (type) {
            case 'day_completed':
                // Calculate completion rate
                const totalTracks = Object.keys(this.currentProgress.tracks).length;
                if (totalTracks > 0) {
                    let totalCompleted = 0;
                    let totalDays = 0;

                    Object.values(this.currentProgress.tracks).forEach(track => {
                        totalCompleted += Object.keys(track.completedDays).length;
                        totalDays += track.totalDays || 30; // Default 30 days per track
                    });

                    this.currentProgress.statistics.completionRate =
                        totalDays > 0 ? (totalCompleted / totalDays) * 100 : 0;
                }
                break;
        }
    }

    async getSyncStatus() {
        return {
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            lastSyncTime: this.lastSyncTime,
            pendingConflicts: this.conflictResolver.hasPendingConflicts(),
            queueStatus: await this.offlineStorage.getSyncQueueStatus()
        };
    }

    async clearOfflineData() {
        try {
            await this.offlineStorage.deleteFromStore('progress', `user_${this.currentProgress.userId}`);
            this.currentProgress = null;
            console.log('🧹 Offline progress data cleared');
        } catch (error) {
            console.error('❌ Failed to clear offline data:', error);
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.OfflineProgressTracker = OfflineProgressTracker;
}