// Progress Manager Module
// Handles progress tracking, synchronization, and statistics
// Interview Prep Platform - Frontend Integration
// Created: December 15, 2025

class ProgressManager {
    constructor() {
        this.progress = null;
        this.stats = null;
        this.syncInProgress = false;
        this.autoSyncInterval = null;
    }

    // Initialize progress manager
    async init() {
        this.setupAutoSync();
        await this.loadProgress();
    }

    // Load progress from database or localStorage
    async loadProgress(trackName = 'standard') {
        try {
            // Try to load from database first
            if (window.apiV2Client) {
                console.log('🗄️ Loading progress from database...');

                const [progressResult, statsResult] = await Promise.all([
                    window.apiV2Client.getProgress(trackName),
                    window.apiV2Client.getStats()
                ]);

                if (progressResult?.success && progressResult.data) {
                    this.progress = this.convertDbProgressToLocal(progressResult.data);
                    console.log('✅ Progress loaded from database');
                }

                if (statsResult?.success && statsResult.data) {
                    this.stats = statsResult.data;
                    console.log('✅ Statistics loaded from database');
                }

                // Merge stats with progress for comprehensive data
                if (this.progress && this.stats) {
                    this.progress = this.mergeStatsWithProgress(this.progress, this.stats);
                }

                if (this.progress) {
                    this.progress.source = 'database';
                    return this.progress;
                }
            }

            // Fallback to localStorage
            console.log('📱 Loading progress from localStorage...');
            const localProgress = localStorage.getItem('practiceProgress');
            if (localProgress) {
                this.progress = JSON.parse(localProgress);
                this.progress.source = 'local';
                console.log('✅ Progress loaded from localStorage');
                return this.progress;
            }

            // Create default progress
            this.progress = this.createDefaultProgress(trackName);
            console.log('🆕 Created default progress structure');
            return this.progress;

        } catch (error) {
            console.error('❌ Error loading progress:', error);
            this.progress = this.createDefaultProgress(trackName);
            return this.progress;
        }
    }

    // Save progress to database and localStorage
    async saveProgress() {
        if (!this.progress) return;

        try {
            this.syncInProgress = true;

            // Save to database if available
            if (window.apiV2Client && this.progress.source !== 'default') {
                console.log('💾 Saving progress to database...');

                // Convert local format to database format
                const dbProgress = this.convertLocalProgressToDb(this.progress);

                const result = await window.apiV2Client.updateProgress(
                    this.progress.currentTrack || 'standard',
                    dbProgress
                );

                if (result?.success) {
                    console.log('✅ Progress saved to database');
                    this.progress.source = 'database';
                    this.progress.lastSaved = new Date().toISOString();
                } else {
                    console.warn('⚠️ Database save failed, using localStorage backup');
                }
            }

            // Always save to localStorage as backup
            localStorage.setItem('practiceProgress', JSON.stringify(this.progress));
            console.log('💾 Progress saved to localStorage');

        } catch (error) {
            console.error('❌ Error saving progress:', error);
            // Fallback to localStorage
            localStorage.setItem('practiceProgress', JSON.stringify(this.progress));
        } finally {
            this.syncInProgress = false;
        }
    }

    // Update progress for specific day/task
    updateDayProgress(weekIndex, dayId, updates) {
        if (!this.progress || !this.progress.weeks) return;

        const week = this.progress.weeks[weekIndex];
        if (!week || !week.days) return;

        const day = week.days.find(d => d.id === dayId);
        if (!day) return;

        // Apply updates
        Object.assign(day, updates);

        // Update completion timestamp if day is completed
        if (updates.completed && !day.completedAt) {
            day.completedAt = new Date().toISOString();
        }

        // Recalculate progress statistics
        this.recalculateProgress();

        // Auto-save
        this.saveProgress();

        console.log(`✅ Progress updated for Week ${weekIndex + 1}, Day ${dayId}`);
    }

    // Mark task as completed
    toggleTask(taskKey) {
        if (!this.progress) return;

        if (!this.progress.completedTasks) {
            this.progress.completedTasks = [];
        }

        const taskIndex = this.progress.completedTasks.indexOf(taskKey);
        if (taskIndex === -1) {
            this.progress.completedTasks.push(taskKey);
            console.log(`✅ Task completed: ${taskKey}`);
        } else {
            this.progress.completedTasks.splice(taskIndex, 1);
            console.log(`↩️ Task unmarked: ${taskKey}`);
        }

        this.recalculateProgress();
        this.saveProgress();
    }

    // Mark entire day as complete
    markDayComplete(weekIndex, dayId) {
        if (!this.progress || !this.progress.weeks) return;

        const week = this.progress.weeks[weekIndex];
        if (!week || !week.days) return;

        const day = week.days.find(d => d.id === dayId);
        if (!day) return;

        day.completed = true;
        day.completedAt = new Date().toISOString();

        this.recalculateProgress();
        this.saveProgress();

        console.log(`🎉 Day ${dayId} marked as complete!`);

        // Show success message
        if (window.practicePortal && window.practicePortal.showSuccessMessage) {
            window.practicePortal.showSuccessMessage(`Day ${dayId} completed! 🎉`, 'success');
        }
    }

    // Check if day is completed
    isDayCompleted(weekIndex, dayId) {
        if (!this.progress || !this.progress.weeks) return false;

        const week = this.progress.weeks[weekIndex];
        if (!week || !week.days) return false;

        const day = week.days.find(d => d.id === dayId);
        return day ? day.completed || false : false;
    }

    // Recalculate progress statistics
    recalculateProgress() {
        if (!this.progress || !this.progress.weeks) return;

        let totalDays = 0;
        let completedDays = 0;
        let totalTasks = 0;
        let completedTasks = this.progress.completedTasks?.length || 0;

        this.progress.weeks.forEach(week => {
            if (week.days) {
                totalDays += week.days.length;

                week.days.forEach(day => {
                    if (day.completed) {
                        completedDays++;
                    }
                    if (day.tasks) {
                        totalTasks += day.tasks.length;
                    }
                });
            }
        });

        // Update progress statistics
        this.progress.statistics = {
            totalDays,
            completedDays,
            totalTasks,
            completedTasks,
            completionPercentage: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
            taskCompletionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            streak: this.calculateStreak(),
            lastActivity: new Date().toISOString()
        };
    }

    // Calculate current streak
    calculateStreak() {
        if (!this.progress || !this.progress.weeks) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find most recent activity and count backwards
        const allDays = [];
        this.progress.weeks.forEach(week => {
            if (week.days) {
                week.days.forEach(day => {
                    if (day.completedAt) {
                        allDays.push(new Date(day.completedAt));
                    }
                });
            }
        });

        // Sort by date (most recent first)
        allDays.sort((a, b) => b - a);

        // Count consecutive days
        let checkDate = new Date(today);
        for (const activityDate of allDays) {
            activityDate.setHours(0, 0, 0, 0);
            if (activityDate.getTime() === checkDate.getTime()) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (activityDate.getTime() < checkDate.getTime()) {
                break;
            }
        }

        return streak;
    }

    // Setup automatic synchronization
    setupAutoSync() {
        // Sync every 5 minutes if online and API available
        if (window.apiV2Client) {
            this.autoSyncInterval = setInterval(() => {
                if (!this.syncInProgress && navigator.onLine) {
                    this.saveProgress();
                }
            }, 5 * 60 * 1000);
        }

        // Sync on visibility change (when user comes back to tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.apiV2Client && !this.syncInProgress) {
                this.saveProgress();
            }
        });
    }

    // Cleanup
    destroy() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
        }
    }

    // Convert database progress to local format
    convertDbProgressToLocal(dbProgress) {
        if (!dbProgress) return null;

        return {
            currentTrack: dbProgress.track_name || 'standard',
            currentWeek: dbProgress.current_week || 0,
            currentDay: dbProgress.current_day || 0,
            completedTasks: dbProgress.completed_tasks || [],
            weeks: dbProgress.weeks_data || [],
            statistics: {
                totalDays: dbProgress.total_days || 0,
                completedDays: dbProgress.completed_days || 0,
                completionPercentage: dbProgress.completion_percentage || 0,
                streak: dbProgress.streak_days || 0,
                lastActivity: dbProgress.last_activity || new Date().toISOString()
            },
            lastSaved: dbProgress.updated_at || new Date().toISOString(),
            source: 'database'
        };
    }

    // Convert local progress to database format
    convertLocalProgressToDb(localProgress) {
        if (!localProgress) return null;

        return {
            track_name: localProgress.currentTrack || 'standard',
            current_week: localProgress.currentWeek || 0,
            current_day: localProgress.currentDay || 0,
            completed_tasks: localProgress.completedTasks || [],
            weeks_data: localProgress.weeks || [],
            total_days: localProgress.statistics?.totalDays || 0,
            completed_days: localProgress.statistics?.completedDays || 0,
            completion_percentage: localProgress.statistics?.completionPercentage || 0,
            streak_days: localProgress.statistics?.streak || 0,
            last_activity: localProgress.statistics?.lastActivity || new Date().toISOString()
        };
    }

    // Merge statistics with progress data
    mergeStatsWithProgress(progress, stats) {
        if (!progress || !stats) return progress;

        progress.statistics = {
            ...progress.statistics,
            totalQuestions: stats.total_questions || 0,
            questionsAnswered: stats.questions_answered || 0,
            averageScore: stats.average_score || 0,
            timeSpent: stats.total_time_minutes || 0,
            lastLogin: stats.last_login || null
        };

        return progress;
    }

    // Create default progress structure
    createDefaultProgress(trackName = 'standard') {
        return {
            currentTrack: trackName,
            currentWeek: 0,
            currentDay: 0,
            completedTasks: [],
            weeks: [],
            statistics: {
                totalDays: 0,
                completedDays: 0,
                completionPercentage: 0,
                streak: 0,
                lastActivity: new Date().toISOString()
            },
            source: 'default',
            created: new Date().toISOString()
        };
    }

    // ===================================
    // QUESTION TRACKING METHODS
    // ===================================

    // Track a question as studied
    async markQuestionStudied(questionId, categoryId = null, timeSpent = 5) {
        if (!this.progress) {
            console.warn('Progress not loaded');
            return false;
        }

        try {
            // Check if question is already studied
            if (!this.progress.questionsStudied) {
                this.progress.questionsStudied = [];
            }

            const alreadyStudied = this.progress.questionsStudied.find(q => q.id === questionId);
            if (alreadyStudied) {
                console.log(`Question ${questionId} already studied`);
                return true;
            }

            // Add question to studied list
            const studiedQuestion = {
                id: questionId,
                categoryId: categoryId,
                timeSpent: timeSpent,
                studiedAt: new Date().toISOString()
            };

            this.progress.questionsStudied.push(studiedQuestion);

            // Update category counts
            if (!this.progress.categoryProgress) {
                this.progress.categoryProgress = {};
            }
            if (categoryId) {
                this.progress.categoryProgress[categoryId] = (this.progress.categoryProgress[categoryId] || 0) + 1;
            }

            // Update statistics
            this.recalculateProgress();

            // Save to database if available
            if (window.apiV2Client) {
                try {
                    console.log('📊 Saving question progress to database...');
                    const result = await window.apiV2Client.trackQuestionProgress(questionId, 'completed', timeSpent);
                    if (result?.success) {
                        console.log('✅ Question progress saved to database');
                    } else {
                        console.warn('⚠️ Database save failed, using localStorage backup');
                    }
                } catch (error) {
                    console.warn('❌ Failed to save question progress to database:', error);
                }
            }

            // Save progress locally
            await this.saveProgress();

            // Update social learning manager if available
            if (window.socialManager && typeof window.socialManager.updateProgress === 'function') {
                const totalStudied = this.progress.questionsStudied ? this.progress.questionsStudied.length : 0;
                const currentStreak = this.getStreak();
                await window.socialManager.updateProgress(totalStudied, currentStreak);
            }

            console.log(`✅ Question ${questionId} marked as studied`);
            return true;

        } catch (error) {
            console.error('❌ Error marking question as studied:', error);
            return false;
        }
    }

    // Check if a question has been studied
    isQuestionStudied(questionId) {
        if (!this.progress || !this.progress.questionsStudied) {
            return false;
        }
        return this.progress.questionsStudied.some(q => q.id === questionId);
    }

    // Get questions studied count
    getQuestionsStudiedCount() {
        return this.progress?.questionsStudied?.length || 0;
    }

    // Get questions studied by category
    getQuestionsStudiedByCategory(categoryId) {
        if (!this.progress || !this.progress.questionsStudied) {
            return [];
        }
        return this.progress.questionsStudied.filter(q => q.categoryId === categoryId);
    }

    // Get total time spent studying questions
    getTotalStudyTime() {
        if (!this.progress || !this.progress.questionsStudied) {
            return 0;
        }
        return this.progress.questionsStudied.reduce((total, q) => total + (q.timeSpent || 0), 0);
    }

    // Get average time per question
    getAverageTimePerQuestion() {
        const totalTime = this.getTotalStudyTime();
        const totalQuestions = this.getQuestionsStudiedCount();
        return totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;
    }

    // ===================================
    // END QUESTION TRACKING METHODS
    // ===================================

    // Getters
    getProgress() {
        return this.progress;
    }

    getStatistics() {
        return this.progress?.statistics || {};
    }

    getCurrentTrack() {
        return this.progress?.currentTrack || 'standard';
    }

    getCompletionPercentage() {
        return this.progress?.statistics?.completionPercentage || 0;
    }

    getStreak() {
        return this.progress?.statistics?.streak || 0;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ProgressManager = ProgressManager;
}