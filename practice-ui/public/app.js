// Practice Portal Application
class PracticePortal {
    constructor() {
        this.currentExperienceLevel = 'senior'; // Default to senior
        this.currentTrack = 'standard';
        this.currentWeek = null;
        this.currentDay = null;
        this.progress = null; // Will be loaded async
        this.practiceData = null;
        this.interviewQuestions = null;
        this.currentQuestion = null;
        this.filteredQuestions = [];
        this.dashboardData = this.initializeDashboardData();
        this.motivationalMessages = this.getMotivationalMessages();
        this.settings = this.loadSettings();
        this.keyboardListener = null;

        // Initialize Question Intelligence System
        this.questionIntelligence = null;

        // Expose instance globally
        window.practicePortal = this;

        // Ensure settings are properly initialized before init
        if (!this.settings || !this.settings.keyboard) {
            this.settings = this.loadSettings();
        }

        this.init();
    }

    showErrorMessage(message, type = 'error') {
        // Create error notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'error' ? '❌' : '⚠️'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    async init() {
        try {
            // Show loading state
            this.showLoadingState(true);

            // Try to load from cloud first
            await this.loadFromCloudIfAvailable();

            // Load progress early for better UX
            this.progress = await this.loadProgress();

            await this.loadPracticeData();
            await this.loadInterviewQuestions();

            // Initialize Question Intelligence System after questions are loaded
            this.initializeQuestionIntelligence();

            this.setupEventListeners();
            this.initializeTheme();
            this.applySettings();
            this.setupAutoSync(); // Enable progress synchronization
            this.setupRealTimeUpdates(); // Enable real-time updates and error handling
            this.renderWeeks();
            this.updateProgressSummary();
            this.initializeDashboard();

            // Hide loading state
            this.showLoadingState(false);

            // Show success message with progress source info
            const progressSource = this.progress?.source || 'local';
            const message = progressSource === 'database'
                ? '✅ Application loaded with synced progress!'
                : '✅ Application loaded successfully!';

            if (window.apiClient) {
                const deviceInfo = window.apiClient.getDeviceInfo();
                this.showErrorMessage(`${message} Device: ${deviceInfo.deviceId.substring(0, 20)}...`, 'success');
            } else {
                this.showErrorMessage(message, 'success');
            }

        } catch (error) {
            console.error('❌ Critical error during initialization:', error);
            this.showErrorMessage('Failed to initialize the application. Please refresh the page.', 'error');
            this.showLoadingState(false);
        }
    }

    /**
     * Load data from cloud if available
     */
    async loadFromCloudIfAvailable() {
        try {
            // Check if apiClient exists and cloud sync is available
            if (!window.apiClient) {
                console.log('💾 Cloud sync not available, using local data only');
                return;
            }

            // Check if we're in an environment where cloud sync is disabled
            if (window.location.protocol === 'file:' || !window.apiClient.baseURL) {
                console.log('💾 Cloud sync disabled for current environment, using local data only');
                return;
            }

            const cloudData = await window.apiClient.loadFromCloud();
            
            if (cloudData) {
                console.log('📥 Restoring data from cloud...');
                
                // Restore progress
                if (cloudData.progress) {
                    this.progress = cloudData.progress;
                    localStorage.setItem('practicePortalProgress', JSON.stringify(cloudData.progress));
                }
                
                // Restore dashboard data
                if (cloudData.dashboardData) {
                    this.dashboardData = cloudData.dashboardData;
                    localStorage.setItem('dashboardData', JSON.stringify(cloudData.dashboardData));
                }
                
                // Restore settings
                if (cloudData.settings) {
                    this.settings = cloudData.settings;
                    localStorage.setItem('userSettings', JSON.stringify(cloudData.settings));
                }
                
                console.log('✅ Data restored from cloud');
                this.showErrorMessage('📥 Data synced from cloud', 'info');
            } else {
                console.log('💾 Using local data (no cloud backup found)');
            }
        } catch (error) {
            console.warn('⚠️ Could not load from cloud, using local data:', error);
        }
    }

    showLoadingState(show) {
        let loader = document.getElementById('globalLoader');

        if (show) {
            // Create loader if it doesn't exist
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.className = 'global-loader';
                loader.innerHTML = `
                    <div class="loader-content">
                        <div class="loader-spinner"></div>
                        <div class="loader-text">Loading your practice portal...</div>
                    </div>
                `;
                document.body.appendChild(loader);
            }
            loader.style.display = 'flex';
        } else {
            if (loader) {
                loader.style.display = 'none';
            }
        }
    }

    async loadPracticeData() {
        try {
            console.log('🔄 Starting practice data load from database...');

            // Use database API exclusively - load tracks from API v2
            if (!window.apiV2Client) {
                throw new Error('Database API client not available');
            }

            console.log('🗄️ Loading tracks from database...');
            const tracksResponse = await window.apiV2Client.getTracks();

            if (!tracksResponse || !tracksResponse.success) {
                throw new Error('Failed to load tracks from database: ' + (tracksResponse?.error || 'Unknown error'));
            }

            if (!tracksResponse.data || tracksResponse.data.length === 0) {
                throw new Error('No tracks found in database');
            }

            // Transform database tracks to expected format
            const data = {};
            let tracksProcessed = 0;

            tracksResponse.data.forEach(track => {
                const trackKey = track.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                data[trackKey] = {
                    id: track.id,
                    name: track.name,
                    description: track.description,
                    duration: track.duration,
                    difficulty: track.difficulty,
                    weeks: this.transformDaysToWeeks(track.days || [])
                };
                tracksProcessed++;
            });

            if (tracksProcessed === 0) {
                throw new Error('No valid tracks could be processed from database');
            }

            this.practiceData = data;
            console.log(`✅ Successfully loaded ${tracksProcessed} practice tracks from database`);
            console.log(`📊 Available tracks: ${Object.keys(data).join(', ')}`);
            this.showSuccessMessage(`Loaded ${tracksProcessed} practice tracks from database`, 'success');
            return data;
        } catch (error) {
            console.error('❌ Error loading practice data from database:', error);
            this.showErrorMessage('Failed to load practice data from database. Please check your connection.', 'error');

            // No fallback - database is required
            throw error;
        }
    }

    // Helper function to transform database days to weeks structure
    transformDaysToWeeks(days) {
        if (!days || !Array.isArray(days)) {
            return [];
        }

        const weeks = [];
        let currentWeek = null;
        let currentWeekDays = [];

        days.forEach(day => {
            const weekTitle = day.week_title || `Week ${Math.ceil(day.day_number / 7)}`;

            if (!currentWeek || currentWeek !== weekTitle) {
                if (currentWeek) {
                    weeks.push({
                        title: currentWeek,
                        days: [...currentWeekDays]
                    });
                }
                currentWeek = weekTitle;
                currentWeekDays = [];
            }

            currentWeekDays.push({
                id: day.day_number,
                title: day.title,
                focus: day.focus,
                timeCommitment: day.time_commitment,
                tasks: day.tasks ? JSON.parse(day.tasks) : [],
                practice: day.practice ? JSON.parse(day.practice) : [],
                resources: day.resources ? JSON.parse(day.resources) : []
            });
        });

        if (currentWeek && currentWeekDays.length > 0) {
            weeks.push({
                title: currentWeek,
                days: currentWeekDays
            });
        }

        return weeks;
    }

    async loadInterviewQuestions() {
        try {
            // Initialize pagination state
            this.currentQuestionPage = 1;
            // Make questionsPerPage dynamic with default of 20
            this.questionsPerPage = this.getQuestionsPerPageSetting() || 20;
            console.log('🔍 DEBUG: questionsPerPage initialized to:', this.questionsPerPage);
            this.totalQuestions = 0;
            this.totalPages = 0;
            this.hasNextPage = false;
            this.hasPrevPage = false;

            // Use database API exclusively
            if (!window.apiV2Client) {
                throw new Error('Database API client not available');
            }

            console.log('🗄️ Loading questions from database...');
            const apiResult = await window.apiV2Client.getQuestions({
                page: this.currentQuestionPage,
                limit: this.questionsPerPage,
                useCache: true
            });

            if (!apiResult || !apiResult.success) {
                throw new Error('Failed to load questions from database: ' + (apiResult?.error || 'Unknown error'));
            }

            if (!apiResult.data || apiResult.data.length === 0) {
                throw new Error('No questions found in database');
            }

            console.log(`✅ Successfully loaded ${apiResult.data.length} questions from database`);

            // Store pagination info
            if (apiResult.pagination) {
                this.totalQuestions = apiResult.pagination.total;
                this.totalPages = apiResult.pagination.totalPages;
                this.hasNextPage = apiResult.pagination.hasNext;
                this.hasPrevPage = apiResult.pagination.hasPrev;
                this.currentQuestionPage = apiResult.pagination.currentPage;
            }

            // Convert database format to existing frontend format
            this.interviewQuestions = this.convertDatabaseToLegacyFormat(apiResult.data);
            this.filteredQuestions = this.getAllQuestions();

            console.log(`✅ Questions loaded from database: ${this.totalQuestions} total, showing ${this.filteredQuestions.length} questions`);
            this.showSuccessMessage(`Loaded ${this.totalQuestions} questions from database`, 'success');

        } catch (error) {
            console.error('❌ Error loading interview questions from database:', error);
            this.showErrorMessage('Failed to load questions from database. Please check your connection.', 'error');

            // No fallback - database is required
            throw error;
        }
    }

    // Helper function to convert database format to legacy frontend format
    convertDatabaseToLegacyFormat(questions) {
        if (!questions || !Array.isArray(questions)) {
            return { categories: [] };
        }

        // Group questions by category
        const categoriesMap = new Map();

        questions.forEach(question => {
            const categoryName = question.category || 'General';

            if (!categoriesMap.has(categoryName)) {
                categoriesMap.set(categoryName, {
                    name: categoryName,
                    questions: []
                });
            }

            categoriesMap.get(categoryName).questions.push({
                id: question.id,
                question: question.question,
                answer: question.answer,
                difficulty: question.difficulty || 'medium',
                tags: question.tags ? question.tags.split(',').map(t => t.trim()) : [],
                category: categoryName
            });
        });

        return {
            categories: Array.from(categoriesMap.values())
        };
    }

    // Helper method to load from static files (legacy fallback)
    async loadQuestionsFromFiles() {
        // Load from local file - use fixed version
        let response = await fetch('/data/questions/interview-questions-fixed.json');

        // If fixed file fails, try comprehensive file, then fallback
        if (!response.ok) {
            console.warn('Fixed questions file not found, trying comprehensive file...');
            response = await fetch('/data/questions/interview-questions-comprehensive.json');

            if (!response.ok) {
                console.warn('Comprehensive questions file not found, trying regular file...');
                response = await fetch('/data/questions/interview-questions.json');
            }
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch interview questions: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        const data = JSON.parse(responseText);

        if (!data || !data.categories || !Array.isArray(data.categories)) {
            throw new Error('Invalid interview questions data structure: missing categories array');
        }

        this.interviewQuestions = data;
        this.filteredQuestions = this.getAllQuestions();
        this.totalQuestions = this.filteredQuestions.length;
        this.totalPages = Math.ceil(this.totalQuestions / this.questionsPerPage);
        console.log(`✅ Successfully loaded ${data.categories.length} question categories from files`);
    }

    // Convert API v2 format to legacy frontend format
    convertApiV2ToLegacyFormat(apiQuestions) {
        if (!Array.isArray(apiQuestions)) {
            return { categories: [] };
        }

        // Group questions by category
        const categoriesMap = new Map();

        apiQuestions.forEach(q => {
            const categoryId = q.category_slug || q.category_id || 'unknown';
            const categoryName = q.category_name || 'Unknown Category';

            if (!categoriesMap.has(categoryId)) {
                categoriesMap.set(categoryId, {
                    id: categoryId,
                    name: categoryName,
                    icon: this.getCategoryIcon(categoryId),
                    questions: []
                });
            }

            // Convert API v2 question format to legacy format
            categoriesMap.get(categoryId).questions.push({
                id: q.id,
                question: q.question,
                difficulty: q.difficulty,
                experienceLevel: this.mapExperienceLevels(q.experience_levels),
                answer: q.answer,
                companies: q.companies || [],
                topic: q.topic || categoryName,
                followUp: q.follow_up_questions || [],
                code: q.code_example || null
            });
        });

        return {
            categories: Array.from(categoriesMap.values())
        };
    }

    // Helper to get category icon
    getCategoryIcon(categoryId) {
        const iconMap = {
            'java': '☕',
            'selenium': '🌐',
            'api-testing': '🔌',
            'testng': '🧪',
            'framework': '🏗️',
            'leadership': '👔'
        };
        return iconMap[categoryId] || '📝';
    }

    // Map API v2 experience levels to legacy format
    mapExperienceLevels(apiLevels) {
        if (!Array.isArray(apiLevels)) return ['0-2', '3-5', '6-8'];

        const mapping = {
            'junior': ['0-2', '3-5'],
            'mid': ['3-5', '6-8'],
            'senior': ['6-8', '9-12']
        };

        const mapped = [];
        apiLevels.forEach(level => {
            if (mapping[level]) {
                mapped.push(...mapping[level]);
            }
        });

        return mapped.length > 0 ? [...new Set(mapped)] : ['0-2', '3-5', '6-8'];
    }

    // Create minimal fallback structure
    createMinimalFallback() {
        this.interviewQuestions = {
            categories: [
                {
                    id: 'java',
                    name: 'Java Programming',
                    icon: '☕',
                    questions: [
                        {
                            id: 'fallback-001',
                            question: 'What is Java?',
                            difficulty: 'Basic',
                            experienceLevel: ['0-2', '3-5'],
                            answer: 'Java is a high-level, object-oriented programming language.',
                            companies: ['Sample Company'],
                            topic: 'Core Java',
                            followUp: []
                        }
                    ]
                }
            ]
        };
        this.filteredQuestions = this.getAllQuestions();
        this.totalQuestions = this.filteredQuestions.length;
        this.totalPages = 1;
    }

    getAllQuestions() {
        if (!this.interviewQuestions || !this.interviewQuestions.categories) {
            return [];
        }
        let allQuestions = [];
        this.interviewQuestions.categories.forEach(category => {
            category.questions.forEach(q => {
                allQuestions.push({...q, categoryId: category.id, categoryName: category.name});
            });
        });
        return allQuestions;
    }

    // Helper method to get questions per page setting
    getQuestionsPerPageSetting() {
        try {
            const saved = localStorage.getItem('questionsPerPageSetting');
            if (saved) {
                const value = parseInt(saved);
                // Validate the range (20, 50, 100 are allowed values)
                if ([20, 50, 100].includes(value)) {
                    console.log('🔍 DEBUG: Loaded questionsPerPage from localStorage:', value);
                    return value;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading questionsPerPage setting:', error);
        }
        console.log('🔍 DEBUG: Using default questionsPerPage: 20');
        return 20; // Default value
    }

    // Method to update questions per page setting
    setQuestionsPerPageSetting(value) {
        try {
            // Validate the value
            const numValue = parseInt(value);
            if (![20, 50, 100].includes(numValue)) {
                console.error('❌ Invalid questionsPerPage value:', value);
                throw new Error(`Invalid page size: ${value}. Must be 20, 50, or 100.`);
            }

            console.log('🔍 DEBUG: Setting questionsPerPage to:', numValue);
            this.questionsPerPage = numValue;
            localStorage.setItem('questionsPerPageSetting', numValue.toString());
            
            // Reset to first page when changing page size
            this.currentQuestionPage = 1;
            
            // Refresh the questions list
            this.loadQuestionsPage();
            
            return true;
        } catch (error) {
            console.error('❌ Error setting questionsPerPage:', error);
            this.showErrorMessage(`Failed to change page size: ${error.message}`, 'error');
            return false;
        }
    }

    setupEventListeners() {
        // Experience Level Selector
        document.getElementById('experienceLevel').addEventListener('change', (e) => {
            this.currentExperienceLevel = e.target.value;
            this.updateExperienceInfo();
            this.loadPracticeData().then(() => {
                this.renderWeeks();
                this.showWelcomeScreen();
            });
        });

        // Sidebar Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Interview Questions Filters
        if (document.getElementById('categoryFilter')) {
            document.getElementById('categoryFilter').addEventListener('change', () => {
                this.filterAndRenderQuestions();
            });
        }

        if (document.getElementById('difficultyFilter')) {
            document.getElementById('difficultyFilter').addEventListener('change', () => {
                this.filterAndRenderQuestions();
            });
        }

        // Search functionality
        if (document.getElementById('questionSearch')) {
            const searchInput = document.getElementById('questionSearch');
            const clearSearch = document.getElementById('clearSearch');

            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });

            clearSearch.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Pagination controls
        if (document.getElementById('prevPageBtn')) {
            document.getElementById('prevPageBtn').addEventListener('click', () => {
                this.goToPreviousPage();
            });
        }

        if (document.getElementById('nextPageBtn')) {
            document.getElementById('nextPageBtn').addEventListener('click', () => {
                this.goToNextPage();
            });
        }

        // Questions per page selector
        const questionsPerPageSelect = document.getElementById('questionsPerPageSelect');
        if (questionsPerPageSelect) {
            questionsPerPageSelect.addEventListener('change', (e) => {
                console.log('🔍 DEBUG: questionsPerPageSelect changed to:', e.target.value);
                this.setQuestionsPerPageSetting(e.target.value);
            });
        }

        // Track selector
        document.getElementById('trackSelect').addEventListener('change', (e) => {
            this.currentTrack = e.target.value;
            this.renderWeeks();
            this.showWelcomeScreen();
        });

        // Back button (from day content)
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        // Back to questions button
        if (document.getElementById('backToQuestionsBtn')) {
            document.getElementById('backToQuestionsBtn').addEventListener('click', () => {
                this.showQuestionsList();
            });
        }

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        // Mark complete button
        document.getElementById('markCompleteBtn').addEventListener('click', () => {
            this.markDayComplete();
        });

        // Next day button
        document.getElementById('nextDayBtn').addEventListener('click', () => {
            this.goToNextDay();
        });

        // Reset progress
        document.getElementById('resetProgress').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress?')) {
                this.resetProgress();
            }
        });

        // Export progress
        document.getElementById('exportProgress').addEventListener('click', () => {
            this.exportProgress();
        });

        // Dashboard specific listeners
        if (document.getElementById('getNewMotivation')) {
            document.getElementById('getNewMotivation').addEventListener('click', () => {
                this.generateNewMotivation();
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // Settings modal event listeners
        this.setupSettingsModalListeners();
        this.setupSettingsTabHandlers();

        // Practice form buttons
        const openPracticeFormBtn = document.getElementById('openPracticeForm');
        const downloadPracticeFormBtn = document.getElementById('downloadPracticeForm');

        if (openPracticeFormBtn) {
            openPracticeFormBtn.addEventListener('click', () => {
                this.openPracticeForm();
            });
        }

        if (downloadPracticeFormBtn) {
            downloadPracticeFormBtn.addEventListener('click', () => {
                this.downloadPracticeForm();
            });
        }

        // Modal close
        const modal = document.getElementById('practiceModal');
        const closeBtn = document.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Setup event listeners for the settings modal
     */
    setupSettingsModalListeners() {
        // Settings modal close events
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            // Close button
            const closeSettingsBtn = document.getElementById('closeSettingsBtn');
            if (closeSettingsBtn) {
                closeSettingsBtn.addEventListener('click', () => {
                    this.closeSettings();
                });
            }

            // Save button
            const saveSettingsBtn = document.getElementById('saveSettingsBtn');
            if (saveSettingsBtn) {
                saveSettingsBtn.addEventListener('click', () => {
                    this.saveSettingsFromModal();
                });
            }

            // Reset button
            const resetSettingsBtn = document.getElementById('resetSettingsBtn');
            if (resetSettingsBtn) {
                resetSettingsBtn.addEventListener('click', () => {
                    this.resetSettings();
                });
            }

            // Export data button
            const exportDataBtn = document.getElementById('exportDataBtn');
            if (exportDataBtn) {
                exportDataBtn.addEventListener('click', () => {
                    this.exportAllData();
                });
            }

            // Import data button
            const importDataBtn = document.getElementById('importDataBtn');
            if (importDataBtn) {
                importDataBtn.addEventListener('click', () => {
                    this.importData();
                });
            }

            // Click outside to close
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });

            // Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && settingsModal.style.display === 'block') {
                    this.closeSettings();
                }
            });
        }
    }

    /**
     * Setup tab switching handlers for settings modal
     */
    setupSettingsTabHandlers() {
        const settingsTabs = document.querySelectorAll('.settings-tab');
        const tabContents = document.querySelectorAll('.settings-tab-content');

        settingsTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;

                // Remove active class from all tabs and contents
                settingsTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                e.target.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}Tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    renderWeeks() {
        const weekList = document.getElementById('weekList');
        weekList.innerHTML = '';

        // Check if practice data is loaded
        if (!this.practiceData || !this.practiceData[this.currentTrack]) {
            console.warn('⚠️ Practice data not loaded yet');
            weekList.innerHTML = '<p style="padding: 1rem; text-align: center;">Loading practice data...</p>';
            return;
        }

        const trackData = this.practiceData[this.currentTrack];
        
        trackData.weeks.forEach((week, weekIndex) => {
            const weekItem = document.createElement('div');
            weekItem.className = 'week-item';

            const completedDays = week.days.filter(day => 
                this.isDayCompleted(weekIndex, day.id)
            ).length;
            const totalDays = week.days.length;
            const progressPercent = Math.round((completedDays / totalDays) * 100);

            weekItem.innerHTML = `
                <div class="week-header" data-week="${weekIndex}">
                    <span class="week-title">${week.title}</span>
                    <span class="week-progress">${completedDays}/${totalDays}</span>
                </div>
                <div class="day-list" id="week-${weekIndex}-days">
                    ${week.days.map(day => `
                        <div class="day-item ${this.isDayCompleted(weekIndex, day.id) ? 'completed' : ''}" 
                             data-week="${weekIndex}" 
                             data-day="${day.id}">
                            <span>${day.title}</span>
                            <span class="day-status">${this.isDayCompleted(weekIndex, day.id) ? '✅' : '⭕'}</span>
                        </div>
                    `).join('')}
                </div>
            `;

            weekList.appendChild(weekItem);
        });

        // Add event listeners for week headers
        document.querySelectorAll('.week-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const weekIndex = e.currentTarget.dataset.week;
                this.toggleWeek(weekIndex);
            });
        });

        // Add event listeners for day items
        document.querySelectorAll('.day-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const weekIndex = parseInt(e.currentTarget.dataset.week);
                const dayId = parseInt(e.currentTarget.dataset.day);
                this.showDay(weekIndex, dayId);
            });
        });
    }

    toggleWeek(weekIndex) {
        const dayList = document.getElementById(`week-${weekIndex}-days`);
        const weekHeader = document.querySelector(`[data-week="${weekIndex}"].week-header`);
        
        // Close all other weeks
        document.querySelectorAll('.day-list').forEach(list => {
            if (list.id !== `week-${weekIndex}-days`) {
                list.classList.remove('show');
            }
        });
        document.querySelectorAll('.week-header').forEach(header => {
            if (header.dataset.week !== weekIndex.toString()) {
                header.classList.remove('active');
            }
        });

        // Toggle current week
        dayList.classList.toggle('show');
        weekHeader.classList.toggle('active');
    }

    showDay(weekIndex, dayId) {
        this.currentWeek = weekIndex;
        this.currentDay = dayId;

        const trackData = this.practiceData[this.currentTrack];
        const week = trackData.weeks[weekIndex];
        const day = week.days.find(d => d.id === dayId);

        // Update active states
        document.querySelectorAll('.day-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-week="${weekIndex}"][data-day="${dayId}"]`).classList.add('active');

        // Hide welcome, show day content
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dayContent').style.display = 'block';

        // Populate day content
        document.getElementById('dayTitle').textContent = day.title;
        document.getElementById('dayWeek').textContent = week.title;
        document.getElementById('dayTrack').textContent = trackData.name;
        document.getElementById('dayFocus').textContent = day.focus;
        document.getElementById('dayTime').textContent = day.timeCommitment;

        // Render tasks
        this.renderTasks(day.tasks);

        // Render practice exercises
        this.renderPracticeExercises(day.practice);

        // Render resources
        this.renderResources(day.resources);

        // Render interview questions if available
        if (day.interviewQuestions) {
            this.renderInterviewQuestions(day.interviewQuestions);
        }

        // Update completion button
        const isCompleted = this.isDayCompleted(weekIndex, dayId);
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        const nextDayBtn = document.getElementById('nextDayBtn');

        if (isCompleted) {
            markCompleteBtn.textContent = '✅ Completed';
            markCompleteBtn.disabled = true;
            nextDayBtn.style.display = 'inline-block';
        } else {
            markCompleteBtn.textContent = 'Mark Day as Complete';
            markCompleteBtn.disabled = false;
            nextDayBtn.style.display = 'none';
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    renderTasks(tasks) {
        const tasksList = document.getElementById('tasksList');

        // Handle undefined or null tasks
        if (!tasks || !Array.isArray(tasks)) {
            console.warn('⚠️ Tasks data is undefined or not an array:', tasks);
            tasksList.innerHTML = '<p class="no-tasks">No tasks available for this day.</p>';
            return;
        }

        tasksList.innerHTML = tasks.map((task, index) => {
            const taskKey = `${this.currentWeek}-${this.currentDay}-task-${index}`;
            const isCompleted = this.progress.tasks[taskKey] || false;

            return `
                <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-key="${taskKey}">
                    <input type="checkbox"
                           class="task-checkbox"
                           ${isCompleted ? 'checked' : ''}
                           onchange="portal.toggleTask('${taskKey}')">
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        <div class="task-description">${task.description}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPracticeExercises(exercises) {
        const practiceList = document.getElementById('practiceList');

        // Handle undefined or null exercises
        if (!exercises || !Array.isArray(exercises)) {
            console.warn('⚠️ Practice exercises data is undefined or not an array:', exercises);
            practiceList.innerHTML = '<p class="no-exercises">No practice exercises available for this day.</p>';
            return;
        }

        practiceList.innerHTML = exercises.map(exercise => `
            <div class="practice-card" onclick="portal.showPracticeDetails(${JSON.stringify(exercise).replace(/"/g, '&quot;')})">
                <h4>${exercise.title}</h4>
                <p>${exercise.description}</p>
                <span class="practice-difficulty difficulty-${exercise.difficulty.toLowerCase()}">
                    ${exercise.difficulty}
                </span>
            </div>
        `).join('');
    }

    renderResources(resources) {
        const resourcesList = document.getElementById('resourcesList');

        // Handle undefined or null resources
        if (!resources || !Array.isArray(resources)) {
            console.warn('⚠️ Resources data is undefined or not an array:', resources);
            resourcesList.innerHTML = '<p class="no-resources">No resources available for this day.</p>';
            return;
        }

        resourcesList.innerHTML = resources.map(resource => `
            <div class="resource-item">
                <span class="resource-icon">${resource.icon}</span>
                <div class="resource-content">
                    <div class="resource-title">${resource.title}</div>
                    <a href="${resource.url}" target="_blank" class="resource-link">
                        ${resource.url}
                    </a>
                </div>
            </div>
        `).join('');
    }

    showPracticeDetails(exercise) {
        const modal = document.getElementById('practiceModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = exercise.title;
        modalBody.innerHTML = `
            <p><strong>Description:</strong> ${exercise.description}</p>
            <p><strong>Difficulty:</strong> <span class="practice-difficulty difficulty-${exercise.difficulty.toLowerCase()}">${exercise.difficulty}</span></p>
            ${exercise.code ? `
                <p><strong>Example Code:</strong></p>
                <pre><code>${this.escapeHtml(exercise.code)}</code></pre>
            ` : ''}
            ${exercise.hints ? `
                <p><strong>Hints:</strong></p>
                <ul>
                    ${exercise.hints.map(hint => `<li>${hint}</li>`).join('')}
                </ul>
            ` : ''}
        `;

        modal.style.display = 'block';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleTask(taskKey) {
        this.progress.tasks[taskKey] = !this.progress.tasks[taskKey];
        this.saveProgress();
        this.updateProgressSummary();
    }

    markDayComplete() {
        const dayKey = `${this.currentWeek}-${this.currentDay}`;
        this.progress.completedDays[dayKey] = true;
        this.saveProgress();
        this.updateProgressSummary();
        this.renderWeeks();
        
        // Update UI
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        const nextDayBtn = document.getElementById('nextDayBtn');
        markCompleteBtn.textContent = '✅ Completed';
        markCompleteBtn.disabled = true;
        nextDayBtn.style.display = 'inline-block';

        // Show celebration
        alert('🎉 Congratulations! Day completed successfully!');
    }

    goToNextDay() {
        const trackData = this.practiceData[this.currentTrack];
        const currentWeek = trackData.weeks[this.currentWeek];
        const currentDayIndex = currentWeek.days.findIndex(d => d.id === this.currentDay);

        if (currentDayIndex < currentWeek.days.length - 1) {
            // Next day in same week
            const nextDay = currentWeek.days[currentDayIndex + 1];
            this.showDay(this.currentWeek, nextDay.id);
        } else if (this.currentWeek < trackData.weeks.length - 1) {
            // First day of next week
            const nextWeek = trackData.weeks[this.currentWeek + 1];
            this.showDay(this.currentWeek + 1, nextWeek.days[0].id);
            this.toggleWeek(this.currentWeek + 1);
        } else {
            alert('🎊 Congratulations! You have completed all days in this track!');
        }
    }

    isDayCompleted(weekIndex, dayId) {
        const dayKey = `${weekIndex}-${dayId}`;
        return this.progress.completedDays[dayKey] || false;
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('dayContent').style.display = 'none';
        this.currentWeek = null;
        this.currentDay = null;

        // Remove active states
        document.querySelectorAll('.day-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    updateProgressSummary() {
        const completedDaysCount = Object.keys(this.progress.completedDays).length;
        
        // Check if practice data is loaded
        if (!this.practiceData || !this.practiceData[this.currentTrack]) {
            document.getElementById('completedDays').textContent = completedDaysCount;
            document.getElementById('totalProgress').textContent = '0%';
            return;
        }
        
        const trackData = this.practiceData[this.currentTrack];
        const totalDays = trackData.weeks.reduce((sum, week) => sum + week.days.length, 0);
        const progressPercent = Math.round((completedDaysCount / totalDays) * 100);

        document.getElementById('completedDays').textContent = completedDaysCount;
        document.getElementById('totalProgress').textContent = `${progressPercent}%`;
    }

    async loadProgress() {
        try {
            // Try to load from database API v2 first
            if (window.apiV2Client) {
                console.log('🚀 Loading progress from database API v2...');

                const [progressResult, statsResult] = await Promise.allSettled([
                    window.apiV2Client.getProgress(this.currentTrack),
                    window.apiV2Client.getStats()
                ]);

                if (progressResult.status === 'fulfilled' && progressResult.value.success) {
                    const dbProgress = progressResult.value.data;
                    console.log('✅ Progress loaded from database:', dbProgress);

                    // Convert database format to frontend format
                    const convertedProgress = this.convertDbProgressToLocal(dbProgress);

                    // Also merge with stats if available
                    if (statsResult.status === 'fulfilled' && statsResult.value.success) {
                        const stats = statsResult.value.data;
                        console.log('✅ Stats loaded from database:', stats);
                        this.mergeStatsWithProgress(convertedProgress, stats);
                    }

                    return convertedProgress;
                } else {
                    console.warn('⚠️ Database progress not available, falling back to localStorage');
                }
            }

            // Fallback to localStorage for offline mode
            const saved = localStorage.getItem('practicePortalProgress');

            if (saved) {
                const parsed = JSON.parse(saved);

                // Validate progress data structure
                if (this.validateProgressData(parsed)) {
                    console.log('✅ Progress data loaded from localStorage');
                    return parsed;
                } else {
                    console.warn('⚠️ Invalid progress data found, resetting to defaults');
                    this.showErrorMessage('Progress data was corrupted and has been reset', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error loading progress:', error);
            this.showErrorMessage('Failed to load saved progress. Starting fresh.', 'warning');
        }

        // Return default progress structure
        return {
            completedDays: {},
            tasks: {},
            lastSynced: null,
            source: 'default'
        };
    }

    // Convert database progress format to frontend format
    convertDbProgressToLocal(dbProgress) {
        const converted = {
            completedDays: {},
            tasks: {},
            lastSynced: new Date().toISOString(),
            source: 'database'
        };

        // Convert database progress entries to frontend format
        if (Array.isArray(dbProgress)) {
            dbProgress.forEach(entry => {
                // Convert track progress to day completion format
                const dayKey = `${entry.track_id}-${entry.day_number}`;
                converted.completedDays[dayKey] = entry.completed || false;

                // Convert tasks if available
                if (entry.tasks_completed) {
                    try {
                        const tasks = typeof entry.tasks_completed === 'string'
                            ? JSON.parse(entry.tasks_completed)
                            : entry.tasks_completed;

                        Object.assign(converted.tasks, tasks);
                    } catch (e) {
                        console.warn('Failed to parse tasks data:', e);
                    }
                }
            });
        }

        console.log('🔄 Converted database progress to local format:', converted);
        return converted;
    }

    // Merge database stats with progress data
    mergeStatsWithProgress(progress, stats) {
        if (!stats) return;

        // Add analytics data from stats
        progress.analytics = {
            totalStudyTime: stats.total_study_time || 0,
            questionsStudied: stats.questions_studied || 0,
            currentStreak: stats.current_streak || 0,
            longestStreak: stats.longest_streak || 0,
            lastActivity: stats.last_activity || null
        };

        console.log('📊 Merged stats with progress data');
    }

    validateProgressData(data) {
        // Check if data has required structure
        return data &&
               typeof data === 'object' &&
               typeof data.completedDays === 'object' &&
               typeof data.tasks === 'object';
    }

    async saveProgress() {
        try {
            // Validate data before saving
            if (!this.validateProgressData(this.progress)) {
                console.error('❌ Invalid progress data, not saving');
                return false;
            }

            // Update timestamp
            this.progress.lastSynced = new Date().toISOString();

            // Try to save to database API v2 first
            if (window.apiV2Client && this.progress.source !== 'default') {
                console.log('🚀 Saving progress to database API v2...');

                try {
                    const dbProgress = this.convertLocalToDbProgress(this.progress);

                    // Save each day's progress to the database
                    const savePromises = dbProgress.map(entry =>
                        window.apiV2Client.updateProgress(
                            entry.track_id,
                            entry.day_number,
                            {
                                completed: entry.completed,
                                tasks_completed: entry.tasks_completed,
                                study_time: entry.study_time,
                                completion_date: entry.completion_date
                            }
                        )
                    );

                    const results = await Promise.allSettled(savePromises);
                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

                    if (successful > 0) {
                        console.log(`✅ Saved ${successful}/${savePromises.length} progress entries to database`);
                        this.progress.source = 'database';
                    } else {
                        console.warn('⚠️ Database save failed, falling back to localStorage');
                    }

                } catch (dbError) {
                    console.warn('⚠️ Database save error, falling back to localStorage:', dbError);
                }
            }

            // Always save to localStorage as backup
            const dataString = JSON.stringify(this.progress);

            // Check if we're within localStorage limits (usually ~5MB)
            if (dataString.length > 4 * 1024 * 1024) { // 4MB limit
                console.warn('⚠️ Progress data is getting large, consider cleanup');
                this.showErrorMessage('Progress data is large. Consider exporting and resetting.', 'warning');
            }

            localStorage.setItem('practicePortalProgress', dataString);
            console.log('✅ Progress saved to localStorage');

            return true;

        } catch (error) {
            console.error('❌ Error saving progress:', error);

            if (error.name === 'QuotaExceededError') {
                this.showErrorMessage('Storage limit reached! Please export your progress and reset.', 'error');
            } else {
                this.showErrorMessage('Failed to save progress. Please try again.', 'error');
            }
            return false;
        }
    }

    // Convert frontend progress format to database format
    convertLocalToDbProgress(localProgress) {
        const dbProgress = [];

        // Convert completed days to database entries
        Object.entries(localProgress.completedDays || {}).forEach(([dayKey, completed]) => {
            // Parse day key format: "track-dayNumber" or "weekIndex-dayId"
            const parts = dayKey.split('-');
            if (parts.length >= 2) {
                const trackId = parts[0];
                const dayNumber = parseInt(parts[1]) || parseInt(parts[parts.length - 1]);

                // Get related tasks for this day
                const dayTasks = {};
                Object.entries(localProgress.tasks || {}).forEach(([taskKey, taskCompleted]) => {
                    if (taskKey.startsWith(dayKey)) {
                        dayTasks[taskKey] = taskCompleted;
                    }
                });

                dbProgress.push({
                    track_id: trackId || this.currentTrack,
                    day_number: dayNumber,
                    completed: completed,
                    tasks_completed: JSON.stringify(dayTasks),
                    study_time: this.estimateStudyTime(completed),
                    completion_date: completed ? new Date().toISOString() : null
                });
            }
        });

        return dbProgress;
    }

    // Estimate study time based on completion
    estimateStudyTime(completed) {
        if (!completed) return 0;
        // Estimate 60-180 minutes per completed day
        return Math.floor(Math.random() * 120) + 60;
    }

    // ===================================
    // PROGRESS SYNCHRONIZATION
    // ===================================

    async syncProgress() {
        if (!window.apiV2Client) {
            console.log('📱 No API client available, skipping sync');
            return { success: false, message: 'API not available' };
        }

        try {
            console.log('🔄 Starting progress synchronization...');

            // Get current local progress
            const localProgress = this.progress || {};
            const localTimestamp = new Date(localProgress.lastSynced || 0);

            // Get remote progress from database
            const remoteResult = await window.apiV2Client.getProgress(this.currentTrack);

            if (!remoteResult.success) {
                console.warn('⚠️ Failed to fetch remote progress');
                return { success: false, message: 'Failed to fetch remote progress' };
            }

            const remoteProgress = this.convertDbProgressToLocal(remoteResult.data);
            const remoteTimestamp = new Date(remoteProgress.lastSynced || 0);

            console.log('📊 Sync comparison:', {
                localTimestamp: localTimestamp.toISOString(),
                remoteTimestamp: remoteTimestamp.toISOString(),
                localDays: Object.keys(localProgress.completedDays || {}).length,
                remoteDays: Object.keys(remoteProgress.completedDays || {}).length
            });

            // Determine sync strategy
            let syncResult;
            if (localTimestamp > remoteTimestamp) {
                // Local is newer, push to server
                syncResult = await this.pushProgressToServer(localProgress);
            } else if (remoteTimestamp > localTimestamp) {
                // Remote is newer, pull from server
                syncResult = await this.pullProgressFromServer(remoteProgress);
            } else {
                // Same timestamp, merge both
                syncResult = await this.mergeProgress(localProgress, remoteProgress);
            }

            return syncResult;

        } catch (error) {
            console.error('❌ Progress sync failed:', error);
            return { success: false, message: error.message };
        }
    }

    async pushProgressToServer(localProgress) {
        console.log('⬆️ Pushing local progress to server...');
        const saveResult = await this.saveProgress();

        return {
            success: saveResult,
            message: saveResult ? 'Progress pushed to server' : 'Failed to push progress',
            action: 'push'
        };
    }

    async pullProgressFromServer(remoteProgress) {
        console.log('⬇️ Pulling progress from server...');

        // Backup current local progress
        const localBackup = JSON.parse(JSON.stringify(this.progress));

        // Replace with remote progress
        this.progress = remoteProgress;

        // Save to localStorage
        localStorage.setItem('practicePortalProgress', JSON.stringify(this.progress));

        // Update UI
        this.updateProgressSummary();
        this.renderWeeks();

        return {
            success: true,
            message: 'Progress synced from server',
            action: 'pull',
            backup: localBackup
        };
    }

    async mergeProgress(localProgress, remoteProgress) {
        console.log('🔀 Merging local and remote progress...');

        const merged = {
            completedDays: { ...localProgress.completedDays, ...remoteProgress.completedDays },
            tasks: { ...localProgress.tasks, ...remoteProgress.tasks },
            lastSynced: new Date().toISOString(),
            source: 'merged'
        };

        // Merge analytics if available
        if (localProgress.analytics || remoteProgress.analytics) {
            merged.analytics = {
                ...localProgress.analytics,
                ...remoteProgress.analytics
            };
        }

        this.progress = merged;

        // Save merged progress
        const saveResult = await this.saveProgress();

        return {
            success: saveResult,
            message: 'Progress merged successfully',
            action: 'merge'
        };
    }

    // Auto-sync on visibility change (when user returns to tab)
    setupAutoSync() {
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden && window.apiV2Client) {
                console.log('👁️ Tab became visible, checking for sync...');

                const lastSync = new Date(this.progress?.lastSynced || 0);
                const now = new Date();
                const minutesSinceSync = (now - lastSync) / (1000 * 60);

                // Auto-sync if last sync was more than 5 minutes ago
                if (minutesSinceSync > 5) {
                    const syncResult = await this.syncProgress();

                    if (syncResult.success && syncResult.action !== 'push') {
                        this.showErrorMessage(`🔄 Progress synced (${syncResult.action})`, 'info');
                    }
                }
            }
        });

        console.log('🔄 Auto-sync enabled');
    }

    // ===================================
    // REAL-TIME UPDATES & ERROR HANDLING
    // ===================================

    setupRealTimeUpdates() {
        // Enhanced error handling with retry mechanism
        this.errorQueue = [];
        this.retryAttempts = 3;
        this.retryDelay = 2000; // 2 seconds

        // Real-time progress updates
        this.setupProgressUpdates();

        // Enhanced error handling
        this.setupAdvancedErrorHandling();

        // Connection monitoring
        this.setupConnectionMonitoring();

        console.log('🔄 Real-time updates enabled');
    }

    setupProgressUpdates() {
        // Update progress in real-time after actions
        const originalMarkDayComplete = this.markDayComplete.bind(this);
        this.markDayComplete = async function() {
            const result = await originalMarkDayComplete.call(this);

            // Real-time sync after completion
            if (window.apiV2Client) {
                const syncResult = await this.syncProgress();
                if (syncResult.success) {
                    this.showErrorMessage('✅ Progress synced in real-time!', 'success');
                } else {
                    this.showErrorMessage('⚠️ Progress saved locally, will sync when online', 'warning');
                }
            }

            return result;
        }.bind(this);

        // Real-time dashboard updates
        const originalUpdateProgressSummary = this.updateProgressSummary.bind(this);
        this.updateProgressSummary = function() {
            originalUpdateProgressSummary.call(this);

            // Trigger real-time analytics refresh
            if (this.progress?.source === 'database') {
                this.refreshAnalyticsInBackground();
            }
        }.bind(this);
    }

    setupAdvancedErrorHandling() {
        // Global error handler for unhandled API errors
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled promise rejection:', event.reason);

            // Check if it's an API error
            if (event.reason?.message?.includes('API')) {
                this.handleApiError(event.reason);
                event.preventDefault(); // Prevent default browser error handling
            }
        });

        // Network error handling
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.showErrorMessage('🌐 Connection restored! Syncing data...', 'success');
            this.handleConnectionRestored();
        });

        window.addEventListener('offline', () => {
            console.log('📱 Connection lost, switching to offline mode');
            this.showErrorMessage('📱 Offline mode: Changes will sync when reconnected', 'info');
        });
    }

    setupConnectionMonitoring() {
        // Periodic connection check
        setInterval(async () => {
            if (window.apiV2Client && navigator.onLine) {
                try {
                    const healthCheck = await window.apiV2Client.isAvailable();
                    if (!healthCheck && this.lastConnectionState !== false) {
                        console.log('🔄 API server unavailable');
                        this.showErrorMessage('⚠️ Server temporarily unavailable', 'warning');
                        this.lastConnectionState = false;
                    } else if (healthCheck && this.lastConnectionState === false) {
                        console.log('✅ API server connection restored');
                        this.showErrorMessage('✅ Server connection restored', 'success');
                        this.handleConnectionRestored();
                        this.lastConnectionState = true;
                    }
                } catch (error) {
                    // Ignore connection check errors
                }
            }
        }, 30000); // Check every 30 seconds
    }

    async handleApiError(error) {
        console.error('🚨 API Error:', error);

        const errorItem = {
            error,
            timestamp: Date.now(),
            attempts: 0
        };

        this.errorQueue.push(errorItem);
        await this.processErrorQueue();
    }

    async processErrorQueue() {
        if (this.errorQueue.length === 0) return;

        const errorItem = this.errorQueue[0];

        if (errorItem.attempts >= this.retryAttempts) {
            // Remove failed item and show persistent error
            this.errorQueue.shift();
            this.showPersistentError(errorItem.error);
            return;
        }

        errorItem.attempts++;

        try {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * errorItem.attempts));

            // Attempt to retry based on error type
            await this.retryFailedOperation(errorItem.error);

            // Success - remove from queue
            this.errorQueue.shift();
            this.showErrorMessage('✅ Operation completed successfully', 'success');

            // Process next error if any
            if (this.errorQueue.length > 0) {
                this.processErrorQueue();
            }

        } catch (retryError) {
            console.warn(`Retry ${errorItem.attempts}/${this.retryAttempts} failed:`, retryError);

            // Try again
            setTimeout(() => this.processErrorQueue(), 1000);
        }
    }

    async retryFailedOperation(error) {
        // Determine retry strategy based on error type
        if (error.message?.includes('progress')) {
            // Retry progress save
            return await this.saveProgress();
        } else if (error.message?.includes('sync')) {
            // Retry sync
            return await this.syncProgress();
        } else if (error.message?.includes('questions')) {
            // Retry question loading
            return await this.loadQuestionsPage();
        } else {
            // Generic retry - attempt sync
            return await this.syncProgress();
        }
    }

    showPersistentError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'persistent-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <div class="error-text">
                    <strong>Persistent Error</strong>
                    <p>${error.message}</p>
                    <small>Some features may be limited. Your progress is saved locally.</small>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="error-dismiss">×</button>
            </div>
        `;

        document.body.appendChild(errorDiv);

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 15000);
    }

    async handleConnectionRestored() {
        // Attempt to sync when connection is restored
        try {
            const syncResult = await this.syncProgress();
            if (syncResult.success) {
                console.log('🔄 Auto-sync completed after connection restoration');
            }

            // Process any queued errors
            if (this.errorQueue.length > 0) {
                this.processErrorQueue();
            }

        } catch (error) {
            console.warn('⚠️ Failed to sync after connection restoration:', error);
        }
    }

    resetProgress() {
        this.progress = {
            completedDays: {},
            tasks: {}
        };
        this.saveProgress();
        this.renderWeeks();
        this.updateProgressSummary();
        this.showWelcomeScreen();
        alert('Progress has been reset!');
    }

    exportProgress() {
        const dataStr = JSON.stringify(this.progress, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'practice-progress.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // New methods for experience level and interview questions

    updateExperienceInfo() {
        const experienceLevels = {
            'junior': 'QA Automation Engineer, Junior SDET',
            'mid': 'Senior QA Automation Engineer, SDET',
            'senior': 'Senior SDET, Test Architect, QA Lead'
        };
        const infoElement = document.getElementById('experienceInfo');
        if (infoElement) {
            infoElement.textContent = experienceLevels[this.currentExperienceLevel] || '';
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        if (tabName === 'dashboard') {
            document.getElementById('dashboardTab').classList.add('active');
            this.updateDashboard();
        } else if (tabName === 'schedule') {
            document.getElementById('scheduleTab').classList.add('active');
            this.showWelcomeScreen();
        } else if (tabName === 'questions') {
            document.getElementById('questionsTab').classList.add('active');
            this.showQuestionsList();
            this.filterAndRenderQuestions();
        } else if (tabName === 'practice') {
            document.getElementById('practiceTab').classList.add('active');
            this.setupPracticeTab();
        }
    }

    filterAndRenderQuestions() {
        console.log('🔍 DEBUG: filterAndRenderQuestions() called');
        
        // Reset to page 1 when filters change
        this.currentQuestionPage = 1;

        // Get filter values for debugging
        const category = document.getElementById('categoryFilter')?.value || 'all';
        const difficulty = document.getElementById('difficultyFilter')?.value || 'all';
        const searchTerm = document.getElementById('questionSearch')?.value?.toLowerCase().trim() || '';
        
        console.log('🔍 DEBUG: Filter values:', {
            category,
            difficulty,
            searchTerm,
            currentExperienceLevel: this.currentExperienceLevel
        });

        // Check API client availability
        console.log('🔍 DEBUG: API client check:', {
            hasApiV2Client: !!window.apiV2Client,
            apiClientBaseUrl: window.apiV2Client?.getBaseUrl?.() || 'N/A'
        });

        // If we have API v2 client, use paginated API calls with filters
        if (window.apiV2Client) {
            console.log('🔍 DEBUG: Using API v2 client for filtering');
            this.loadQuestionsPage();
            return;
        }

        console.log('🔍 DEBUG: Using embedded data fallback for filtering');

        // Get all questions for debugging
        const allQuestions = this.getAllQuestions();
        console.log('🔍 DEBUG: Total questions available:', allQuestions.length);

        this.filteredQuestions = allQuestions.filter(q => {
            console.log('🔍 DEBUG: Filtering question:', {
                id: q.id,
                categoryId: q.categoryId,
                difficulty: q.difficulty,
                experienceLevel: q.experienceLevel
            });

            // Filter by category
            if (category !== 'all' && q.categoryId !== category) {
                console.log('🔍 DEBUG: Question filtered out by category');
                return false;
            }

            // Filter by difficulty
            if (difficulty !== 'all' && q.difficulty !== difficulty) {
                console.log('🔍 DEBUG: Question filtered out by difficulty');
                return false;
            }

            // Filter by experience level
            const expMapping = {
                'junior': ['0-2', '3-5'],
                'mid': ['3-5', '6-8'],
                'senior': ['6-8', '9-12']
            };
            const relevantExp = expMapping[this.currentExperienceLevel];
            const hasRelevantExp = q.experienceLevel.some(exp => relevantExp.includes(exp));

            if (!hasRelevantExp) {
                console.log('🔍 DEBUG: Question filtered out by experience level');
                return false;
            }

            // Filter by search term
            if (searchTerm) {
                const searchableText = [
                    q.question,
                    q.answer,
                    q.topic,
                    q.companies.join(' '),
                    q.followUp?.join(' ') || ''
                ].join(' ').toLowerCase();

                const matches = searchableText.includes(searchTerm);
                if (!matches) {
                    console.log('🔍 DEBUG: Question filtered out by search term');
                }
                return matches;
            }

            console.log('🔍 DEBUG: Question passed all filters');
            return true;
        });

        console.log('🔍 DEBUG: Filtered questions count:', this.filteredQuestions.length);

        // Update pagination metadata for embedded data
        this.totalQuestions = this.filteredQuestions.length;
        this.totalPages = Math.ceil(this.totalQuestions / this.questionsPerPage);

        console.log('🔍 DEBUG: Pagination metadata:', {
            totalQuestions: this.totalQuestions,
            totalPages: this.totalPages,
            questionsPerPage: this.questionsPerPage
        });

        // Simulate pagination with embedded data
        this.simulatePaginationWithEmbeddedData();
    }

    handleSearchInput(searchTerm) {
        const clearButton = document.getElementById('clearSearch');
        const searchStats = document.getElementById('searchStats');

        // Show/hide clear button
        if (searchTerm.trim()) {
            clearButton.style.display = 'block';
            searchStats.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
            searchStats.style.display = 'none';
        }

        // Debounce search to avoid too many updates
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            // Enhanced search with semantic capabilities
            this.performEnhancedSearch(searchTerm.trim());
        }, 300);
    }

    performEnhancedSearch(searchTerm) {
        if (!searchTerm) {
            this.filterAndRenderQuestions();
            return;
        }

        // Try semantic search first if intelligence system is available
        let semanticResults = [];
        if (this.questionIntelligence && searchTerm.length >= 3) {
            try {
                semanticResults = this.performSemanticSearch(searchTerm, {
                    maxResults: 10,
                    includeRelated: true
                });

                if (semanticResults.length > 0) {
                    console.log(`🧠 Semantic search found ${semanticResults.length} intelligent results`);
                }
            } catch (error) {
                console.warn('⚠️ Semantic search failed, falling back to traditional search:', error);
            }
        }

        // Perform traditional text-based search as fallback or enhancement
        const textResults = this.performTraditionalSearch(searchTerm);

        // Combine and deduplicate results
        const combinedResults = this.combineSearchResults(semanticResults, textResults, searchTerm);

        // Update search stats
        this.updateSearchStats(searchTerm, combinedResults, semanticResults.length > 0);

        // Render combined results
        this.renderSearchResults(combinedResults);
    }

    performTraditionalSearch(searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const results = [];

        // Search through all categories
        this.questionsData.categories.forEach(category => {
            category.questions.forEach(question => {
                const searchableText = [
                    question.question,
                    question.answer,
                    question.topic,
                    question.companies.join(' '),
                    question.followUp?.join(' ') || ''
                ].join(' ').toLowerCase();

                if (searchableText.includes(searchTermLower)) {
                    results.push({
                        ...question,
                        categoryName: category.name,
                        categoryId: category.id,
                        searchType: 'traditional',
                        relevance: this.calculateTraditionalRelevance(searchTermLower, searchableText)
                    });
                }
            });
        });

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    calculateTraditionalRelevance(searchTerm, text) {
        let score = 0;
        const words = searchTerm.split(/\s+/);

        words.forEach(word => {
            const count = (text.match(new RegExp(word, 'gi')) || []).length;
            score += count;
        });

        return score;
    }

    combineSearchResults(semanticResults, textResults, searchTerm) {
        const combined = new Map();

        // Add semantic results with higher priority
        semanticResults.forEach((result, index) => {
            combined.set(result.questionId, {
                ...result,
                priority: result.relevanceScore || (10 - index),
                searchType: 'semantic'
            });
        });

        // Add text results, avoiding duplicates
        textResults.forEach(result => {
            if (!combined.has(result.id)) {
                combined.set(result.id, {
                    ...result,
                    priority: result.relevance || 5,
                    searchType: 'traditional'
                });
            }
        });

        // Convert back to array and sort by priority
        return Array.from(combined.values())
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 20); // Limit to top 20 results
    }

    updateSearchStats(searchTerm, results, hasSemanticResults) {
        const searchStats = document.getElementById('searchStats');
        if (!searchStats) return;

        const totalResults = results.length;
        const semanticCount = results.filter(r => r.searchType === 'semantic').length;
        const traditionalCount = results.filter(r => r.searchType === 'traditional').length;

        let statsText = `Found ${totalResults} results for "${searchTerm}"`;

        if (hasSemanticResults) {
            statsText += ` (${semanticCount} AI-powered, ${traditionalCount} text-based)`;
        }

        searchStats.textContent = statsText;
    }

    renderSearchResults(results) {
        // Store search results for rendering
        this.filteredQuestions = results;
        this.currentQuestionPage = 1; // Reset to first page

        // Update total counts
        this.totalQuestions = results.length;
        this.totalPages = Math.ceil(this.totalQuestions / this.questionsPerPage);

        // Render the results
        this.renderQuestions();
        this.updatePaginationControls();
    }

    clearSearch() {
        const searchInput = document.getElementById('questionSearch');
        const clearButton = document.getElementById('clearSearch');
        const searchStats = document.getElementById('searchStats');

        searchInput.value = '';
        clearButton.style.display = 'none';
        searchStats.style.display = 'none';

        this.filterAndRenderQuestions();
        searchInput.focus();
    }

    // ===================================
    // PAGINATION METHODS
    // ===================================

    async goToPreviousPage() {
        if (this.currentQuestionPage > 1) {
            this.currentQuestionPage--;
            await this.loadQuestionsPage();
        }
    }

    async goToNextPage() {
        if (this.currentQuestionPage < this.totalPages) {
            this.currentQuestionPage++;
            await this.loadQuestionsPage();
        }
    }

    async goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentQuestionPage = pageNumber;
            await this.loadQuestionsPage();
        }
    }

    async loadQuestionsPage() {
        try {
            console.log('🔍 DEBUG: loadQuestionsPage() called');
            
            // Show loading state for pagination
            this.showPaginationLoading(true);

            // Get current filter values
            const category = document.getElementById('categoryFilter')?.value || 'all';
            const difficulty = document.getElementById('difficultyFilter')?.value || 'all';
            const searchTerm = document.getElementById('questionSearch')?.value?.trim() || '';

            console.log('🔍 DEBUG: loadQuestionsPage filter values:', {
                category,
                difficulty,
                searchTerm,
                currentPage: this.currentQuestionPage,
                questionsPerPage: this.questionsPerPage
            });

            // Build options for API call
            const options = {
                page: this.currentQuestionPage,
                limit: this.questionsPerPage,
                useCache: false // Don't cache during pagination for fresh results
            };

            // Add filters if not 'all'
            if (category !== 'all') {
                options.category_id = category;
            }
            if (difficulty !== 'all') {
                options.difficulty = difficulty;
            }
            if (searchTerm) {
                options.search = searchTerm;
            }

            console.log('🔍 DEBUG: API call options:', options);

            // Check API client availability
            console.log('🔍 DEBUG: API client check:', {
                hasApiV2Client: !!window.apiV2Client,
                apiClientBaseUrl: window.apiV2Client?.getBaseUrl?.() || 'N/A'
            });

            // Load questions using API v2 hybrid approach
            if (window.apiV2Client) {
                console.log('🔍 DEBUG: Calling apiV2Client.getQuestionsHybrid()');
                const apiResult = await window.apiV2Client.getQuestionsHybrid(options);

                console.log('🔍 DEBUG: API result:', {
                    success: apiResult?.success,
                    dataLength: apiResult?.data?.length || 0,
                    source: apiResult?.source,
                    pagination: apiResult?.pagination,
                    error: apiResult?.error
                });

                if (apiResult.success) {
                    // Update pagination state
                    if (apiResult.pagination) {
                        this.totalQuestions = apiResult.pagination.total;
                        this.totalPages = apiResult.pagination.totalPages;
                        this.hasNextPage = apiResult.pagination.hasNext;
                        this.hasPrevPage = apiResult.pagination.hasPrev;
                    }

                    console.log('🔍 DEBUG: Updated pagination state:', {
                        totalQuestions: this.totalQuestions,
                        totalPages: this.totalPages,
                        hasNextPage: this.hasNextPage,
                        hasPrevPage: this.hasPrevPage
                    });

                    // Convert and update questions based on source
                    console.log('🔍 DEBUG: Converting API data to legacy format, source:', apiResult.source);
                    
                    if (apiResult.source === 'embedded') {
                        // For embedded data, the data is already in the correct API v2 format after filterEmbeddedQuestions
                        console.log('🔍 DEBUG: Processing embedded data source');
                        this.interviewQuestions = this.convertApiV2ToLegacyFormat(apiResult.data);
                    } else {
                        // For API data, convert normally
                        console.log('🔍 DEBUG: Processing API data source');
                        this.interviewQuestions = this.convertApiV2ToLegacyFormat(apiResult.data);
                    }
                    
                    this.filteredQuestions = this.getAllQuestions();

                    console.log('🔍 DEBUG: After conversion:', {
                        interviewQuestionsCategories: this.interviewQuestions?.categories?.length || 0,
                        filteredQuestionsLength: this.filteredQuestions?.length || 0
                    });

                    // Render the new page
                    console.log('🔍 DEBUG: Rendering questions list');
                    this.renderQuestionsList();
                    this.updatePaginationControls();
                    this.updateSearchStats();
                    
                    // Ensure dropdowns are populated for embedded data
                    if (apiResult.source === 'embedded') {
                        console.log('🔍 DEBUG: Populating dropdowns for embedded data');
                        this.populateFiltersFromEmbeddedData();
                    }

                    console.log(`📄 Loaded page ${this.currentQuestionPage} of ${this.totalPages} (${apiResult.source})`);
                } else {
                    console.log('🔍 DEBUG: API call failed, throwing error');
                    throw new Error('Failed to load questions page: ' + (apiResult?.error || 'Unknown error'));
                }
            } else {
                console.log('🔍 DEBUG: No API client, using embedded data fallback');
                // Fallback: simulate pagination with embedded data
                this.simulatePaginationWithEmbeddedData();
            }

        } catch (error) {
            console.error('❌ Error loading questions page:', error);
            this.showErrorMessage('Failed to load questions page. Please try again.', 'error');
        } finally {
            this.showPaginationLoading(false);
        }
    }

    simulatePaginationWithEmbeddedData() {
        console.log('🔍 DEBUG: simulatePaginationWithEmbeddedData() called');
        
        // When using embedded data, simulate pagination by slicing the full dataset
        const allQuestions = this.getAllQuestions();
        console.log('🔍 DEBUG: All questions from getAllQuestions():', allQuestions.length);
        
        const startIndex = (this.currentQuestionPage - 1) * this.questionsPerPage;
        const endIndex = startIndex + this.questionsPerPage;

        console.log('🔍 DEBUG: Pagination slice:', {
            currentPage: this.currentQuestionPage,
            questionsPerPage: this.questionsPerPage,
            startIndex,
            endIndex,
            totalAvailable: allQuestions.length
        });

        // Create a mock paginated result
        const paginatedQuestions = allQuestions.slice(startIndex, endIndex);
        console.log('🔍 DEBUG: Paginated questions:', paginatedQuestions.length);

        // Update pagination metadata
        this.totalQuestions = allQuestions.length;
        this.totalPages = Math.ceil(this.totalQuestions / this.questionsPerPage);
        this.hasNextPage = this.currentQuestionPage < this.totalPages;
        this.hasPrevPage = this.currentQuestionPage > 1;

        console.log('🔍 DEBUG: Updated pagination metadata:', {
            totalQuestions: this.totalQuestions,
            totalPages: this.totalPages,
            hasNextPage: this.hasNextPage,
            hasPrevPage: this.hasPrevPage
        });

        // Set filtered questions to the current page
        this.filteredQuestions = paginatedQuestions;
        console.log('🔍 DEBUG: Set filteredQuestions to:', this.filteredQuestions.length);

        // Render and update controls
        console.log('🔍 DEBUG: Rendering questions list and updating controls');
        this.renderQuestionsList();
        this.updatePaginationControls();
        this.updateSearchStats();
    }

    // Initialize the questions per page dropdown with current value
    initializeQuestionsPerPageDropdown() {
        const dropdown = document.getElementById('questionsPerPageSelect');
        if (dropdown) {
            // Set the dropdown to the current questionsPerPage value
            dropdown.value = this.questionsPerPage.toString();
            console.log('🔍 DEBUG: Initialized questionsPerPageSelect dropdown to:', this.questionsPerPage);
        }
    }

    showPaginationLoading(show) {
        const questionsList = document.getElementById('questionsList');
        if (show) {
            questionsList.innerHTML = '<div class="loading-pagination">🔄 Loading questions...</div>';
        }
    }

    updatePaginationControls() {
        const paginationContainer = document.getElementById('paginationContainer');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const paginationInfo = document.getElementById('paginationInfo');
        const paginationMeta = document.getElementById('paginationMeta');
        const paginationNumbers = document.getElementById('paginationNumbers');

        if (!paginationContainer) return;

        // Show pagination only if we have multiple pages or are using API v2
        const shouldShowPagination = this.totalPages > 1 || (window.apiV2Client && this.totalQuestions > 0);

        if (shouldShowPagination) {
            paginationContainer.style.display = 'block';

            // Update pagination info
            const startItem = ((this.currentQuestionPage - 1) * this.questionsPerPage) + 1;
            const endItem = Math.min(this.currentQuestionPage * this.questionsPerPage, this.totalQuestions);

            if (paginationInfo) {
                paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.totalQuestions} questions`;
            }

            if (paginationMeta) {
                paginationMeta.textContent = `Page ${this.currentQuestionPage} of ${this.totalPages}`;
            }

            // Update button states
            if (prevBtn) {
                prevBtn.disabled = !this.hasPrevPage;
                prevBtn.classList.toggle('disabled', !this.hasPrevPage);
            }

            if (nextBtn) {
                nextBtn.disabled = !this.hasNextPage;
                nextBtn.classList.toggle('disabled', !this.hasNextPage);
            }

            // Update page numbers (show max 5 page numbers)
            if (paginationNumbers) {
                this.renderPaginationNumbers(paginationNumbers);
            }

            // Initialize the questions per page dropdown
            this.initializeQuestionsPerPageDropdown();

        } else {
            paginationContainer.style.display = 'none';
        }
    }

    renderPaginationNumbers(container) {
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentQuestionPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

        // Adjust start if we're near the end
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        let html = '';

        // Previous ellipsis
        if (startPage > 1) {
            html += `<button class="page-number" onclick="portal.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentQuestionPage;
            html += `<button class="page-number ${isActive ? 'active' : ''}" onclick="portal.goToPage(${i})">${i}</button>`;
        }

        // Next ellipsis
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                html += `<span class="page-ellipsis">...</span>`;
            }
            html += `<button class="page-number" onclick="portal.goToPage(${this.totalPages})">${this.totalPages}</button>`;
        }

        container.innerHTML = html;
    }

    updateSearchStats() {
        const searchStats = document.getElementById('searchStats');
        const resultCount = document.getElementById('searchResultCount');

        if (resultCount) {
            resultCount.textContent = this.filteredQuestions.length;
        }

        // Show search stats only if there's a search term
        const searchTerm = document.getElementById('questionSearch')?.value?.trim();
        if (searchTerm) {
            searchStats.style.display = 'block';
        }
    }

    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm || !text) return text;

        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    renderQuestionsList() {
        console.log('🔍 DEBUG: renderQuestionsList() called');
        
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) {
            console.log('🔍 DEBUG: questionsList element not found');
            return;
        }

        console.log('🔍 DEBUG: filteredQuestions length:', this.filteredQuestions.length);

        if (this.filteredQuestions.length === 0) {
            console.log('🔍 DEBUG: No filtered questions, showing empty state');
            const searchTerm = document.getElementById('questionSearch')?.value?.trim();

            if (searchTerm) {
                console.log('🔍 DEBUG: Showing search-specific empty state for term:', searchTerm);
                // Show search-specific empty state
                questionsList.innerHTML = `
                    <div class="no-search-results">
                        <div class="search-icon">🔍</div>
                        <h3>No questions found</h3>
                        <p>No questions match your search for "<strong>${this.escapeHtml(searchTerm)}</strong>"</p>
                        <div class="search-suggestions">
                            <span class="search-suggestion" onclick="portal.searchSuggestion('java')">java</span>
                            <span class="search-suggestion" onclick="portal.searchSuggestion('selenium')">selenium</span>
                            <span class="search-suggestion" onclick="portal.searchSuggestion('api')">api</span>
                            <span class="search-suggestion" onclick="portal.searchSuggestion('framework')">framework</span>
                            <span class="search-suggestion" onclick="portal.searchSuggestion('testing')">testing</span>
                        </div>
                    </div>
                `;
            } else {
                console.log('🔍 DEBUG: Showing filter-specific empty state');
                // Show filter-specific empty state
                questionsList.innerHTML = '<p class="no-results">No questions found for your current filters.</p>';
            }
            return;
        }

        const searchTerm = document.getElementById('questionSearch')?.value?.trim();
        console.log('🔍 DEBUG: Rendering', this.filteredQuestions.length, 'questions with search term:', searchTerm);

        // Sample first few questions for debugging
        console.log('🔍 DEBUG: Sample questions:', this.filteredQuestions.slice(0, 3).map(q => ({
            id: q.id,
            question: q.question?.substring(0, 50) + '...',
            categoryName: q.categoryName,
            difficulty: q.difficulty
        })));

        questionsList.innerHTML = this.filteredQuestions.map((q, index) => {
            // Highlight search terms in question text
            const highlightedQuestion = searchTerm
                ? this.highlightSearchTerm(q.question, searchTerm)
                : q.question;

            return `
                <div class="question-card" data-question-index="${index}">
                    <div class="question-card-header">
                        <h4>${highlightedQuestion}</h4>
                        <span class="difficulty-badge difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                    </div>
                    <div class="question-card-meta">
                        <span class="category-badge">${q.categoryName}</span>
                        <span class="topic-badge">${q.topic}</span>
                        ${this.dashboardData.questions.studied.includes(q.id)
                            ? '<span class="studied-badge">✅ Studied</span>'
                            : ''}
                    </div>
                    <div class="question-card-footer">
                        <span class="companies-preview">${q.companies.slice(0, 3).join(', ')}${q.companies.length > 3 ? '...' : ''}</span>
                        ${searchTerm && (q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
                            ? '<span class="search-match">📝 Found in answer</span>'
                            : ''}
                    </div>
                </div>
            `;
        }).join('');

        console.log('🔍 DEBUG: Questions HTML rendered, adding click events');

        // Add click event to question cards
        document.querySelectorAll('.question-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.questionIndex);
                this.showQuestion(index);
            });
        });

        console.log('🔍 DEBUG: Click events added, updating pagination controls');

        // Update pagination controls after rendering
        this.updatePaginationControls();
        
        console.log('🔍 DEBUG: renderQuestionsList() completed');
    }

    // Helper method to populate filter dropdowns from embedded data
    populateFiltersFromEmbeddedData() {
        try {
            if (!window.QUESTIONS_DATA || !window.QUESTIONS_DATA.categories) {
                console.log('🔍 DEBUG: No embedded data available for filter population');
                return;
            }

            const categoryFilter = document.getElementById('categoryFilter');
            const difficultyFilter = document.getElementById('difficultyFilter');

            if (categoryFilter) {
                // Clear existing options except "All"
                const allOption = categoryFilter.querySelector('option[value="all"]');
                categoryFilter.innerHTML = '';
                if (allOption) {
                    categoryFilter.appendChild(allOption);
                } else {
                    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
                }

                // Add categories from embedded data
                window.QUESTIONS_DATA.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });

                console.log('🔍 DEBUG: Category filter populated with', window.QUESTIONS_DATA.categories.length, 'categories');
            }

            if (difficultyFilter) {
                // Ensure difficulty options are present
                const difficulties = new Set();
                window.QUESTIONS_DATA.categories.forEach(category => {
                    category.questions.forEach(question => {
                        if (question.difficulty) {
                            difficulties.add(question.difficulty);
                        }
                    });
                });

                // Clear existing options except "All"
                const allOption = difficultyFilter.querySelector('option[value="all"]');
                difficultyFilter.innerHTML = '';
                if (allOption) {
                    difficultyFilter.appendChild(allOption);
                } else {
                    difficultyFilter.innerHTML = '<option value="all">All Difficulties</option>';
                }

                // Add difficulty options
                Array.from(difficulties).sort().forEach(difficulty => {
                    const option = document.createElement('option');
                    option.value = difficulty;
                    option.textContent = difficulty;
                    difficultyFilter.appendChild(option);
                });

                console.log('🔍 DEBUG: Difficulty filter populated with', difficulties.size, 'difficulties');
            }

        } catch (error) {
            console.error('❌ Error populating filters from embedded data:', error);
        }
    }

    searchSuggestion(term) {
        const searchInput = document.getElementById('questionSearch');
        searchInput.value = term;
        this.handleSearchInput(term);
    }

    // Helper function to find question by text
    findQuestionByText(questionText) {
        const cleanText = questionText.trim().toLowerCase();

        // Search through all categories
        for (const category of this.questionsData.categories) {
            for (const question of category.questions) {
                if (question.question.toLowerCase().includes(cleanText) ||
                    cleanText.includes(question.question.toLowerCase().slice(0, 30))) {
                    return {
                        question: question,
                        categoryId: category.id,
                        categoryName: category.name
                    };
                }
            }
        }
        return null;
    }

    // Helper function to navigate to a specific question by ID
    navigateToQuestion(questionId) {
        // Find question in all categories
        for (let categoryIndex = 0; categoryIndex < this.questionsData.categories.length; categoryIndex++) {
            const category = this.questionsData.categories[categoryIndex];
            const questionIndex = category.questions.findIndex(q => q.id === questionId);

            if (questionIndex !== -1) {
                // Update filters to show the correct category
                document.getElementById('categoryFilter').value = category.id;

                // Re-filter questions
                this.filterAndRenderQuestions();

                // Find the question in filtered results and show it
                const filteredIndex = this.filteredQuestions.findIndex(q => q.id === questionId);
                if (filteredIndex !== -1) {
                    this.showQuestion(filteredIndex);
                    return true;
                }
            }
        }

        // If exact ID not found, try searching by text
        return false;
    }

    showQuestion(index) {
        if (index < 0 || index >= this.filteredQuestions.length) return;

        this.currentQuestion = index;
        const question = this.filteredQuestions[index];

        // Hide other views
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dayContent').style.display = 'none';
        document.getElementById('questionsList').style.display = 'none';

        // Show question detail view
        const questionContent = document.getElementById('questionContent');
        questionContent.style.display = 'block';

        // Populate question details
        document.getElementById('questionTitle').textContent = question.question;
        document.getElementById('questionDifficulty').textContent = question.difficulty;
        document.getElementById('questionDifficulty').className =
            `badge difficulty-${question.difficulty.toLowerCase()}`;
        document.getElementById('questionTopic').textContent = question.topic;
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('questionAnswer').textContent = question.answer;

        // Code section
        const codeSection = document.getElementById('codeSection');
        if (question.code) {
            codeSection.style.display = 'block';
            document.getElementById('questionCode').textContent = question.code;
        } else {
            codeSection.style.display = 'none';
        }

        // Companies
        const companiesList = document.getElementById('companiesList');
        companiesList.innerHTML = question.companies.map(company =>
            `<span class="company-tag">${company}</span>`
        ).join('');

        // Follow-up questions - INTELLIGENT HYBRID APPROACH
        const followUpSection = document.getElementById('followUpSection');
        const followUpList = document.getElementById('followUpList');

        // Get intelligent suggestions first
        let intelligentSuggestions = [];
        if (this.questionIntelligence) {
            intelligentSuggestions = this.getIntelligentFollowUps(question.id);
        }

        // Combine original follow-ups with intelligent suggestions
        let allFollowUps = [];

        // Add original follow-ups if they exist
        if (question.followUp && question.followUp.length > 0) {
            allFollowUps = question.followUp.map(followUpId => ({
                type: 'original',
                id: followUpId,
                text: question._followUpCache ? question._followUpCache[followUpId] : followUpId,
                reason: 'Original follow-up'
            }));
        }

        // Add intelligent suggestions
        if (intelligentSuggestions.length > 0) {
            intelligentSuggestions.forEach(suggestion => {
                // Avoid duplicates
                if (!allFollowUps.find(f => f.id === suggestion.questionId)) {
                    allFollowUps.push({
                        type: 'intelligent',
                        id: suggestion.questionId,
                        text: suggestion.mainConcepts ? suggestion.mainConcepts.join(', ') : suggestion.questionId,
                        reason: suggestion.description || suggestion.reason || 'Intelligent suggestion',
                        priority: suggestion.priority
                    });
                }
            });
        }

        if (allFollowUps.length > 0) {
            followUpSection.style.display = 'block';

            // Sort by priority (intelligent suggestions first)
            allFollowUps.sort((a, b) => {
                if (a.type === 'intelligent' && b.type !== 'intelligent') return -1;
                if (a.type !== 'intelligent' && b.type === 'intelligent') return 1;
                return (b.priority || 5) - (a.priority || 5);
            });

            followUpList.innerHTML = allFollowUps.map(followUp => {
                const icon = followUp.type === 'intelligent' ? '🧠' : '🔗';
                const typeLabel = followUp.type === 'intelligent' ? 'AI Suggestion' : 'Direct Link';

                return `<li>
                    <a href="#" class="followup-link" data-question-id="${followUp.id}"
                       title="Click to view: ${followUp.text}">
                        ${icon} ${followUp.text}
                    </a>
                    <span class="followup-category">(${typeLabel})</span>
                    <div class="followup-reason">${followUp.reason}</div>
                </li>`;
            }).join('');

            // Add event listeners for navigation
            followUpList.querySelectorAll('.followup-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const questionId = e.target.dataset.questionId;
                    if (questionId) {
                        console.log(`🔗 Navigating to question via ID: ${questionId}`);
                        const success = this.navigateToQuestion(questionId);
                        if (!success) {
                            console.warn('Could not navigate to question:', questionId);
                            // Try searching for the text as fallback
                            const followUpText = e.target.textContent.replace(/^[🧠🔗]\s*/, '').trim();
                            this.searchSuggestion(followUpText);
                        }
                    }
                });
            });
        } else {
            followUpSection.style.display = 'none';
        }

        // Experience levels
        const experienceLevels = document.getElementById('experienceLevels');
        experienceLevels.innerHTML = question.experienceLevel.map(exp =>
            `<span class="exp-badge">${exp} years</span>`
        ).join('');

        // Handle next question button
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (index < this.filteredQuestions.length - 1) {
            nextBtn.style.display = 'inline-block';
            nextBtn.onclick = () => this.showQuestion(index + 1);
        } else {
            nextBtn.style.display = 'none';
        }

        // Handle mark as studied button
        const markStudiedBtn = document.getElementById('markQuestionStudied');
        markStudiedBtn.onclick = () => {
            this.markQuestionAsStudied(question.id);
            markStudiedBtn.textContent = '✅ Studied';
            markStudiedBtn.disabled = true;
        };

        // Check if question is already studied
        if (this.dashboardData.questions.studied.includes(question.id)) {
            markStudiedBtn.textContent = '✅ Studied';
            markStudiedBtn.disabled = true;
        } else {
            markStudiedBtn.textContent = 'Mark as Studied';
            markStudiedBtn.disabled = false;
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    showQuestionsList() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dayContent').style.display = 'none';
        document.getElementById('questionContent').style.display = 'none';

        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.style.display = 'block';
        }
    }

    getDefaultData() {
        // Fallback data structure
        return {
            standard: {
                name: "Standard Track (4-5 Months)",
                weeks: [
                    {
                        title: "Week 1: Java Fundamentals",
                        days: [
                            {
                                id: 1,
                                title: "Day 1: Variables & Data Types",
                                focus: "Understanding Java basics, variables, and primitive data types",
                                timeCommitment: "2-3 hours",
                                tasks: [
                                    {
                                        title: "Learn about primitive data types",
                                        description: "Study int, double, boolean, char, etc."
                                    },
                                    {
                                        title: "Practice variable declarations",
                                        description: "Write programs using different data types"
                                    }
                                ],
                                practice: [
                                    {
                                        title: "Calculator Program",
                                        description: "Create a simple calculator using variables",
                                        difficulty: "Easy"
                                    }
                                ],
                                resources: [
                                    {
                                        icon: "📖",
                                        title: "Java Documentation",
                                        url: "https://docs.oracle.com/javase/tutorial/"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }

    // Dashboard functionality
    initializeDashboardData() {
        try {
            const saved = localStorage.getItem('dashboardData');

            if (saved) {
                const parsed = JSON.parse(saved);

                // Validate dashboard data structure
                if (this.validateDashboardData(parsed)) {
                    console.log('✅ Dashboard data loaded successfully');
                    return parsed;
                } else {
                    console.warn('⚠️ Invalid dashboard data found, resetting to defaults');
                    this.showErrorMessage('Dashboard data was corrupted and has been reset', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            this.showErrorMessage('Failed to load dashboard data. Using defaults.', 'warning');
        }

        // Return default dashboard data structure
        return {
            streak: {
                current: 0,
                longest: 0,
                lastStudyDate: null,
                studyDates: []
            },
            studyTime: {
                total: 0, // in minutes
                sessions: [],
                averageSession: 0
            },
            questions: {
                studied: [],
                timeSpent: [], // per question in minutes
                categories: {
                    'java': 0,
                    'selenium': 0,
                    'api-testing': 0,
                    'testng': 0,
                    'framework': 0,
                    'leadership': 0
                }
            },
            achievements: {
                'first-day': false,
                'week-warrior': false,
                'streak-master': false,
                'question-solver': false,
                'category-explorer': false,
                'time-keeper': false,
                'consistency-king': false,
                'knowledge-seeker': false
            },
            goals: {
                dailyStreak: 1,
                weeklyDays: 5,
                dailyQuestions: 5,
                weeklyQuestions: 25
            }
        };
    }

    validateDashboardData(data) {
        // Check if data has required structure
        return data &&
               typeof data === 'object' &&
               data.streak &&
               typeof data.streak === 'object' &&
               data.studyTime &&
               typeof data.studyTime === 'object' &&
               data.questions &&
               typeof data.questions === 'object' &&
               data.achievements &&
               typeof data.achievements === 'object';
    }

    saveDashboardData() {
        try {
            // Validate data before saving
            if (!this.validateDashboardData(this.dashboardData)) {
                console.error('❌ Invalid dashboard data, not saving');
                return false;
            }

            const dataString = JSON.stringify(this.dashboardData);

            // Check data size
            if (dataString.length > 2 * 1024 * 1024) { // 2MB limit for dashboard
                console.warn('⚠️ Dashboard data is getting large');
            }

            localStorage.setItem('dashboardData', dataString);
            console.log('✅ Dashboard data saved successfully');
            return true;

        } catch (error) {
            console.error('❌ Error saving dashboard data:', error);

            if (error.name === 'QuotaExceededError') {
                this.showErrorMessage('Storage limit reached! Dashboard data not saved.', 'error');
            } else {
                this.showErrorMessage('Failed to save dashboard data.', 'error');
            }
            return false;
        }
    }

    initializeDashboard() {
        this.updateDashboard();
        this.renderStreakCalendar();
        this.renderAchievements();
        this.generateNewMotivation();
    }

    updateDashboard() {
        this.updateProgressStats();
        this.updateStreakData();
        this.updateWeeklyBreakdown();
        this.updateQuestionsStats();
        this.updateTimeAnalytics();
        this.updateGoalsProgress();
        this.checkAndUnlockAchievements();
    }

    async updateProgressStats() {
        // Use database analytics if available, otherwise fall back to local calculation
        if (this.progress?.analytics && this.progress.source === 'database') {
            this.updateProgressStatsFromDatabase();
        } else {
            this.updateProgressStatsLocal();
        }

        // Try to fetch fresh analytics from database in background
        if (window.apiV2Client) {
            this.refreshAnalyticsInBackground();
        }
    }

    updateProgressStatsFromDatabase() {
        const analytics = this.progress.analytics;
        const completedDaysCount = Object.keys(this.progress.completedDays || {}).length;

        // Update with database analytics
        document.getElementById('dashboardDaysCompleted').textContent = completedDaysCount;

        // Use analytics data if available
        if (analytics.totalStudyTime) {
            const hours = Math.floor(analytics.totalStudyTime / 60);
            const minutes = analytics.totalStudyTime % 60;
            const studyTimeEl = document.getElementById('totalStudyTime');
            if (studyTimeEl) {
                studyTimeEl.textContent = `${hours}h ${minutes}m`;
            }
        }

        // Calculate completion rate
        const trackData = this.practiceData[this.currentTrack];
        const totalDays = trackData.weeks.reduce((sum, week) => sum + week.days.length, 0);
        const progressPercent = Math.round((completedDaysCount / totalDays) * 100);

        document.getElementById('dashboardTotalDays').textContent = totalDays;
        document.getElementById('dashboardCompletionRate').textContent = `${progressPercent}%`;

        const progressBar = document.getElementById('dashboardProgressBar');
        const progressText = document.getElementById('dashboardProgressText');

        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `${progressPercent}% Complete (Database Synced)`;

        console.log('📊 Dashboard updated with database analytics');
    }

    updateProgressStatsLocal() {
        // Fallback to local calculation
        const completedDaysCount = Object.keys(this.progress?.completedDays || {}).length;
        const trackData = this.practiceData[this.currentTrack];
        const totalDays = trackData.weeks.reduce((sum, week) => sum + week.days.length, 0);
        const progressPercent = Math.round((completedDaysCount / totalDays) * 100);

        document.getElementById('dashboardDaysCompleted').textContent = completedDaysCount;
        document.getElementById('dashboardTotalDays').textContent = totalDays;
        document.getElementById('dashboardCompletionRate').textContent = `${progressPercent}%`;

        const progressBar = document.getElementById('dashboardProgressBar');
        const progressText = document.getElementById('dashboardProgressText');

        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `${progressPercent}% Complete`;
    }

    async refreshAnalyticsInBackground() {
        try {
            const statsResult = await window.apiV2Client.getStats();

            if (statsResult.success) {
                // Merge fresh analytics with progress data
                if (!this.progress.analytics) {
                    this.progress.analytics = {};
                }

                this.mergeStatsWithProgress(this.progress, statsResult.data);

                // Update dashboard with fresh data
                this.updateProgressStatsFromDatabase();

                console.log('📊 Analytics refreshed in background');
            }
        } catch (error) {
            console.warn('⚠️ Background analytics refresh failed:', error);
        }
    }

    updateStreakData() {
        this.calculateStreak();

        document.getElementById('currentStreak').textContent = this.dashboardData.streak.current;
        document.getElementById('longestStreak').textContent = this.dashboardData.streak.longest;

        this.renderStreakCalendar();
    }

    calculateStreak() {
        const today = new Date();
        const studyDates = this.dashboardData.streak.studyDates.map(date => new Date(date));

        let currentStreak = 0;
        let checkDate = new Date(today);

        // Calculate current streak
        for (let i = 0; i < 30; i++) {
            const dateString = checkDate.toISOString().split('T')[0];
            if (studyDates.some(date => date.toISOString().split('T')[0] === dateString)) {
                currentStreak++;
            } else if (i > 0) {
                break; // Break if we find a gap (but allow today to be empty)
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }

        this.dashboardData.streak.current = currentStreak;

        // Update longest streak if current is higher
        if (currentStreak > this.dashboardData.streak.longest) {
            this.dashboardData.streak.longest = currentStreak;
        }

        this.saveDashboardData();
    }

    renderStreakCalendar() {
        const calendar = document.getElementById('streakCalendar');
        const today = new Date();
        const studyDates = this.dashboardData.streak.studyDates.map(date => new Date(date));

        calendar.innerHTML = '';

        // Show last 28 days (4 weeks)
        for (let i = 27; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();

            const dateString = date.toISOString().split('T')[0];
            const hasStudied = studyDates.some(studyDate =>
                studyDate.toISOString().split('T')[0] === dateString
            );

            if (hasStudied) {
                dayElement.classList.add('studied');
                if (this.dashboardData.streak.current > 0) {
                    dayElement.classList.add('current-streak');
                }
            }

            if (i === 0) {
                dayElement.classList.add('today');
            }

            calendar.appendChild(dayElement);
        }
    }

    updateWeeklyBreakdown() {
        const weeklyBreakdown = document.getElementById('weeklyBreakdown');
        const trackData = this.practiceData[this.currentTrack];

        weeklyBreakdown.innerHTML = trackData.weeks.map((week, weekIndex) => {
            const completedDays = week.days.filter(day =>
                this.isDayCompleted(weekIndex, day.id)
            ).length;
            const totalDays = week.days.length;
            const progressPercent = Math.round((completedDays / totalDays) * 100);

            return `
                <div class="week-progress-item">
                    <div class="week-info">
                        <div class="week-title">${week.title}</div>
                        <div class="week-subtitle">${week.days.length} days</div>
                    </div>
                    <div class="week-progress-bar">
                        <div class="week-bar-container">
                            <div class="week-bar-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    <div class="week-stats">${completedDays}/${totalDays}</div>
                </div>
            `;
        }).join('');
    }

    updateQuestionsStats() {
        const studiedQuestions = this.dashboardData.questions.studied.length;
        const totalQuestions = this.getAllQuestions().length;
        const avgTime = this.dashboardData.questions.timeSpent.length > 0
            ? Math.round(this.dashboardData.questions.timeSpent.reduce((a, b) => a + b, 0) / this.dashboardData.questions.timeSpent.length)
            : 0;

        document.getElementById('questionsStudied').textContent = studiedQuestions;
        document.getElementById('totalQuestions').textContent = totalQuestions + '+';
        document.getElementById('averageTime').textContent = avgTime;

        this.renderCategoryProgress();
    }

    renderCategoryProgress() {
        const categoryProgress = document.getElementById('categoryProgress');
        const categories = [
            { id: 'java', name: 'Java Programming', icon: '☕' },
            { id: 'selenium', name: 'Selenium WebDriver', icon: '🌐' },
            { id: 'api-testing', name: 'API Testing', icon: '🔌' },
            { id: 'testng', name: 'TestNG Framework', icon: '🧪' },
            { id: 'framework', name: 'Framework Design', icon: '🏗️' },
            { id: 'leadership', name: 'Leadership Skills', icon: '👔' }
        ];

        categoryProgress.innerHTML = categories.map(category => {
            const studiedInCategory = this.dashboardData.questions.categories[category.id] || 0;
            const totalInCategory = this.getQuestionsByCategory(category.id).length;
            const progressPercent = totalInCategory > 0 ? Math.round((studiedInCategory / totalInCategory) * 100) : 0;

            return `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-icon">${category.icon}</span>
                        <span class="category-name">${category.name}</span>
                    </div>
                    <div class="category-bar">
                        <div class="category-bar-container">
                            <div class="category-bar-fill ${category.id}" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    <div class="category-stats">${studiedInCategory}/${totalInCategory}</div>
                </div>
            `;
        }).join('');
    }

    getQuestionsByCategory(categoryId) {
        if (!this.interviewQuestions || !this.interviewQuestions.categories) return [];

        const category = this.interviewQuestions.categories.find(cat => cat.id === categoryId);
        return category ? category.questions : [];
    }

    updateTimeAnalytics() {
        const totalMinutes = this.dashboardData.studyTime.total;
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        const sessions = this.dashboardData.studyTime.sessions.length;
        const avgSession = sessions > 0 ? Math.round(totalMinutes / sessions) : 0;

        document.getElementById('totalStudyTime').textContent = `${totalHours}h ${remainingMinutes}m`;
        document.getElementById('averageSessionTime').textContent = `${avgSession}m`;
        document.getElementById('studySessionsCount').textContent = sessions;
    }

    updateGoalsProgress() {
        // Daily goal - check if studied today
        const today = new Date().toISOString().split('T')[0];
        const studiedToday = this.dashboardData.streak.studyDates.includes(today);
        const dailyProgress = studiedToday ? 100 : 0;

        document.getElementById('dailyGoalProgress').style.width = `${dailyProgress}%`;
        document.getElementById('dailyGoalText').textContent = studiedToday ? '1 / 1 day studied' : '0 / 1 day studied';

        // Weekly goal - check days studied this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

        let daysThisWeek = 0;
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(weekStart);
            checkDate.setDate(weekStart.getDate() + i);
            const dateString = checkDate.toISOString().split('T')[0];
            if (this.dashboardData.streak.studyDates.includes(dateString)) {
                daysThisWeek++;
            }
        }

        const weeklyProgress = Math.round((daysThisWeek / this.dashboardData.goals.weeklyDays) * 100);
        document.getElementById('weeklyGoalProgress').style.width = `${Math.min(weeklyProgress, 100)}%`;
        document.getElementById('weeklyGoalText').textContent = `${daysThisWeek} / ${this.dashboardData.goals.weeklyDays} days this week`;
    }

    checkAndUnlockAchievements() {
        const achievements = this.dashboardData.achievements;
        let newUnlocks = false;

        // First Day achievement
        if (!achievements['first-day'] && Object.keys(this.progress.completedDays).length > 0) {
            achievements['first-day'] = true;
            newUnlocks = true;
        }

        // Week Warrior - complete 7 days
        if (!achievements['week-warrior'] && Object.keys(this.progress.completedDays).length >= 7) {
            achievements['week-warrior'] = true;
            newUnlocks = true;
        }

        // Streak Master - 7 day streak
        if (!achievements['streak-master'] && this.dashboardData.streak.current >= 7) {
            achievements['streak-master'] = true;
            newUnlocks = true;
        }

        // Question Solver - 25 questions
        if (!achievements['question-solver'] && this.dashboardData.questions.studied.length >= 25) {
            achievements['question-solver'] = true;
            newUnlocks = true;
        }

        // Category Explorer - study questions from all categories
        const categoriesStudied = Object.values(this.dashboardData.questions.categories).filter(count => count > 0).length;
        if (!achievements['category-explorer'] && categoriesStudied >= 4) {
            achievements['category-explorer'] = true;
            newUnlocks = true;
        }

        // Time Keeper - 10 hours of study
        if (!achievements['time-keeper'] && this.dashboardData.studyTime.total >= 600) {
            achievements['time-keeper'] = true;
            newUnlocks = true;
        }

        // Consistency King - 14 day streak
        if (!achievements['consistency-king'] && this.dashboardData.streak.current >= 14) {
            achievements['consistency-king'] = true;
            newUnlocks = true;
        }

        // Knowledge Seeker - 100 questions
        if (!achievements['knowledge-seeker'] && this.dashboardData.questions.studied.length >= 100) {
            achievements['knowledge-seeker'] = true;
            newUnlocks = true;
        }

        if (newUnlocks) {
            this.saveDashboardData();
            this.renderAchievements();
        }
    }

    renderAchievements() {
        const achievementsGrid = document.getElementById('achievementsGrid');
        const achievementsList = [
            {
                id: 'first-day',
                icon: '🎯',
                name: 'First Step',
                desc: 'Complete your first day of study'
            },
            {
                id: 'week-warrior',
                icon: '⚔️',
                name: 'Week Warrior',
                desc: 'Complete 7 days of study'
            },
            {
                id: 'streak-master',
                icon: '🔥',
                name: 'Streak Master',
                desc: 'Achieve a 7-day study streak'
            },
            {
                id: 'question-solver',
                icon: '🧩',
                name: 'Question Solver',
                desc: 'Study 25 interview questions'
            },
            {
                id: 'category-explorer',
                icon: '🗺️',
                name: 'Category Explorer',
                desc: 'Study questions from 4+ categories'
            },
            {
                id: 'time-keeper',
                icon: '⏰',
                name: 'Time Keeper',
                desc: 'Study for 10+ hours total'
            },
            {
                id: 'consistency-king',
                icon: '👑',
                name: 'Consistency King',
                desc: 'Achieve a 14-day study streak'
            },
            {
                id: 'knowledge-seeker',
                icon: '📚',
                name: 'Knowledge Seeker',
                desc: 'Study 100+ interview questions'
            }
        ];

        achievementsGrid.innerHTML = achievementsList.map(achievement => {
            const isUnlocked = this.dashboardData.achievements[achievement.id];
            return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            `;
        }).join('');
    }

    getMotivationalMessages() {
        return [
            "Keep up the great work! Every step brings you closer to your dream job! 🌟",
            "Success is the sum of small efforts repeated day after day! 💪",
            "Your consistency today builds your confidence tomorrow! 🚀",
            "Every question you master is a skill in your toolkit! 🔧",
            "The expert in anything was once a beginner! Keep learning! 📚",
            "Progress, not perfection, is the goal! You're doing amazing! ✨",
            "Your future self will thank you for the effort you're putting in today! 🙏",
            "Knowledge is power, and you're building an arsenal! ⚡",
            "Each day of practice makes you stronger and more confident! 💎",
            "The journey of a thousand miles begins with a single step! 🏃‍♂️",
            "Believe in yourself - you have the power to achieve greatness! 🌠",
            "Hard work beats talent when talent doesn't work hard! 🔥",
            "Your dedication today creates opportunities tomorrow! 🌈",
            "Every challenge you overcome makes you interview-ready! 🎯",
            "Success is not final, failure is not fatal: it's the courage to continue! 💯"
        ];
    }

    generateNewMotivation() {
        const messages = this.motivationalMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('motivationText').textContent = randomMessage;
    }

    // Enhanced day completion with dashboard updates
    markDayComplete() {
        const dayKey = `${this.currentWeek}-${this.currentDay}`;
        this.progress.completedDays[dayKey] = true;

        // Update dashboard data
        const today = new Date().toISOString().split('T')[0];
        if (!this.dashboardData.streak.studyDates.includes(today)) {
            this.dashboardData.streak.studyDates.push(today);
        }

        // Add study time (simulate 1-3 hours per day)
        const sessionTime = Math.floor(Math.random() * 120) + 60; // 60-180 minutes
        this.dashboardData.studyTime.total += sessionTime;
        this.dashboardData.studyTime.sessions.push({
            date: today,
            duration: sessionTime
        });

        this.saveProgress();
        this.saveDashboardData();
        this.updateProgressSummary();
        this.renderWeeks();

        // Update UI
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        const nextDayBtn = document.getElementById('nextDayBtn');
        markCompleteBtn.textContent = '✅ Completed';
        markCompleteBtn.disabled = true;
        nextDayBtn.style.display = 'inline-block';

        // Show celebration
        alert('🎉 Congratulations! Day completed successfully!');

        // Update dashboard if it's visible
        if (document.getElementById('dashboardTab').classList.contains('active')) {
            this.updateDashboard();
        }
    }

    // Enhanced question study tracking with database integration
    async markQuestionAsStudied(questionId, timeSpent = 5) {
        try {
            // Use progress manager if available
            if (window.portal && window.portal.progressManager && typeof window.portal.progressManager.markQuestionStudied === 'function') {
                const question = this.getAllQuestions().find(q => q.id === questionId);
                const categoryId = question ? question.categoryId : null;

                const success = await window.portal.progressManager.markQuestionStudied(questionId, categoryId, timeSpent);
                if (success) {
                    // Update local dashboard data as backup
                    this.updateLocalDashboardData(questionId, timeSpent);
                    return;
                }
            }

            // Fallback to local-only tracking
            this.updateLocalDashboardData(questionId, timeSpent);

        } catch (error) {
            console.error('Error tracking question progress:', error);
            // Always update local data as fallback
            this.updateLocalDashboardData(questionId, timeSpent);
        }
    }

    // Helper method to update local dashboard data
    updateLocalDashboardData(questionId, timeSpent) {
        if (!this.dashboardData.questions.studied.includes(questionId)) {
            this.dashboardData.questions.studied.push(questionId);
            this.dashboardData.questions.timeSpent.push(timeSpent);

            // Update category count
            const question = this.getAllQuestions().find(q => q.id === questionId);
            if (question && question.categoryId) {
                this.dashboardData.questions.categories[question.categoryId] =
                    (this.dashboardData.questions.categories[question.categoryId] || 0) + 1;
            }

            this.saveDashboardData();

            // Update dashboard if visible
            if (document.getElementById('dashboardTab').classList.contains('active')) {
                this.updateDashboard();
            }
        }
    }

    // ========================================
    // THEME AND SETTINGS MANAGEMENT
    // ========================================

    /**
     * Initialize theme system
     */
    initializeTheme() {
        try {
            const savedTheme = localStorage.getItem('theme');
            const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

            // Determine initial theme
            let theme = 'light';
            if (savedTheme) {
                theme = savedTheme;
            } else if (systemDarkMode) {
                theme = 'dark';
            }

            this.setTheme(theme);

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });

            console.log('✅ Theme system initialized');
        } catch (error) {
            console.error('❌ Error initializing theme:', error);
        }
    }

    /**
     * Set application theme
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            // Update theme toggle button
            const darkModeBtn = document.getElementById('darkModeToggle');
            if (darkModeBtn) {
                const icon = darkModeBtn.querySelector('.dark-mode-icon');
                if (icon) {
                    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
                }
            }

            console.log(`✅ Theme set to: ${theme}`);
        } catch (error) {
            console.error('❌ Error setting theme:', error);
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);

        this.showErrorMessage(`🎨 Switched to ${newTheme} theme`, 'info');
    }

    /**
     * Load user settings
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('userSettings');

            if (saved) {
                const parsed = JSON.parse(saved);

                if (this.validateSettings(parsed)) {
                    console.log('✅ User settings loaded successfully');
                    return parsed;
                } else {
                    console.warn('⚠️ Invalid settings data found, using defaults');
                    this.showErrorMessage('Settings data was corrupted and has been reset', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            this.showErrorMessage('Failed to load settings. Using defaults.', 'warning');
        }

        // Return default settings
        return {
            theme: 'auto',
            notifications: {
                enabled: true,
                sound: false,
                achievements: true,
                streakReminders: true
            },
            display: {
                compactMode: false,
                showProgress: true,
                animationsEnabled: true,
                fontSize: 'medium'
            },
            study: {
                dailyGoal: 1,
                weeklyGoal: 5,
                autoMarkComplete: false,
                showDifficulty: true
            },
            privacy: {
                analytics: true,
                crashReporting: true
            },
            keyboard: {
                enabled: true,
                shortcuts: {
                    'dashboard': 'KeyD',
                    'schedule': 'KeyS',
                    'questions': 'KeyQ',
                    'practice': 'KeyP',
                    'search': 'Slash',
                    'darkMode': 'KeyT'
                }
            }
        };
    }

    /**
     * Validate settings data structure
     */
    validateSettings(settings) {
        return settings &&
               typeof settings === 'object' &&
               settings.notifications &&
               typeof settings.notifications === 'object' &&
               settings.display &&
               typeof settings.display === 'object' &&
               settings.study &&
               typeof settings.study === 'object';
    }

    /**
     * Save user settings
     */
    saveSettings() {
        try {
            if (!this.validateSettings(this.settings)) {
                console.error('❌ Invalid settings data, not saving');
                return false;
            }

            // Save to localStorage first
            localStorage.setItem('userSettings', JSON.stringify(this.settings));
            console.log('✅ Settings saved to localStorage');

            // Sync to cloud in background if available
            if (window.apiClient) {
                this.syncToCloudBackground();
            }

            return true;
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            this.showErrorMessage('Failed to save settings. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Open settings modal
     */
    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            this.populateSettingsModal();
            modal.style.display = 'block';

            // Focus first input for accessibility
            const firstInput = modal.querySelector('input, select, button');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    /**
     * Close settings modal
     */
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Populate settings modal with current values
     */
    populateSettingsModal() {
        try {
            // Theme setting
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) {
                themeSelect.value = this.settings.theme;
            }

            // Notification settings
            document.getElementById('notificationsEnabled').checked = this.settings.notifications.enabled;
            document.getElementById('notificationSound').checked = this.settings.notifications.sound;
            document.getElementById('achievementNotifications').checked = this.settings.notifications.achievements;
            document.getElementById('streakReminders').checked = this.settings.notifications.streakReminders;

            // Display settings
            document.getElementById('compactMode').checked = this.settings.display.compactMode;
            document.getElementById('showProgress').checked = this.settings.display.showProgress;
            document.getElementById('animationsEnabled').checked = this.settings.display.animationsEnabled;
            document.getElementById('fontSize').value = this.settings.display.fontSize;

            // Study settings
            document.getElementById('dailyGoal').value = this.settings.study.dailyGoal;
            document.getElementById('weeklyGoal').value = this.settings.study.weeklyGoal;
            document.getElementById('autoMarkComplete').checked = this.settings.study.autoMarkComplete;
            document.getElementById('showDifficulty').checked = this.settings.study.showDifficulty;

            // Privacy settings
            document.getElementById('analytics').checked = this.settings.privacy.analytics;
            document.getElementById('crashReporting').checked = this.settings.privacy.crashReporting;

            // Keyboard shortcuts
            document.getElementById('keyboardEnabled').checked = this.settings.keyboard.enabled;

        } catch (error) {
            console.error('❌ Error populating settings modal:', error);
        }
    }

    /**
     * Save settings from modal
     */
    saveSettingsFromModal() {
        try {
            // Update settings object
            this.settings.theme = document.getElementById('themeSelect').value;

            // Notifications
            this.settings.notifications.enabled = document.getElementById('notificationsEnabled').checked;
            this.settings.notifications.sound = document.getElementById('notificationSound').checked;
            this.settings.notifications.achievements = document.getElementById('achievementNotifications').checked;
            this.settings.notifications.streakReminders = document.getElementById('streakReminders').checked;

            // Display
            this.settings.display.compactMode = document.getElementById('compactMode').checked;
            this.settings.display.showProgress = document.getElementById('showProgress').checked;
            this.settings.display.animationsEnabled = document.getElementById('animationsEnabled').checked;
            this.settings.display.fontSize = document.getElementById('fontSize').value;

            // Study
            this.settings.study.dailyGoal = parseInt(document.getElementById('dailyGoal').value);
            this.settings.study.weeklyGoal = parseInt(document.getElementById('weeklyGoal').value);
            this.settings.study.autoMarkComplete = document.getElementById('autoMarkComplete').checked;
            this.settings.study.showDifficulty = document.getElementById('showDifficulty').checked;

            // Privacy
            this.settings.privacy.analytics = document.getElementById('analytics').checked;
            this.settings.privacy.crashReporting = document.getElementById('crashReporting').checked;

            // Keyboard
            this.settings.keyboard.enabled = document.getElementById('keyboardEnabled').checked;

            // Apply settings
            this.applySettings();

            // Save to localStorage
            if (this.saveSettings()) {
                this.closeSettings();
                this.showErrorMessage('⚙️ Settings saved successfully!', 'success');
            }

        } catch (error) {
            console.error('❌ Error saving settings:', error);
            this.showErrorMessage('Failed to save settings. Please try again.', 'error');
        }
    }

    /**
     * Apply current settings to the application
     */
    applySettings() {
        try {
            // Ensure settings exist
            if (!this.settings) {
                this.settings = this.loadSettings();
            }

            // Apply theme
            if (this.settings.theme === 'auto') {
                const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.setTheme(systemDarkMode ? 'dark' : 'light');
            } else {
                this.setTheme(this.settings.theme);
            }

            // Apply display settings
            if (this.settings.display && this.settings.display.compactMode) {
                document.body.classList.add('compact-mode');
            } else {
                document.body.classList.remove('compact-mode');
            }

            // Apply animations setting
            if (this.settings.display && !this.settings.display.animationsEnabled) {
                document.body.classList.add('no-animations');
            } else {
                document.body.classList.remove('no-animations');
            }

            // Apply font size
            if (this.settings.display && this.settings.display.fontSize) {
                document.documentElement.setAttribute('data-font-size', this.settings.display.fontSize);
            }

            // Initialize keyboard shortcuts if enabled
            if (this.settings.keyboard && this.settings.keyboard.enabled) {
                this.initializeKeyboardShortcuts();
            } else {
                this.removeKeyboardShortcuts();
            }

            console.log('✅ Settings applied successfully');

        } catch (error) {
            console.error('❌ Error applying settings:', error);
        }
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            this.settings = this.loadSettings(); // This returns defaults if no saved settings
            localStorage.removeItem('userSettings');

            this.applySettings();
            this.populateSettingsModal();

            this.showErrorMessage('🔄 Settings reset to defaults', 'info');
        }
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        if (this.keyboardListener) {
            this.removeKeyboardShortcuts();
        }

        this.keyboardListener = (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const shortcuts = this.settings.keyboard.shortcuts;

            // Handle shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.code) {
                    case shortcuts.dashboard:
                        e.preventDefault();
                        this.switchTab('dashboard');
                        break;
                    case shortcuts.schedule:
                        e.preventDefault();
                        this.switchTab('schedule');
                        break;
                    case shortcuts.questions:
                        e.preventDefault();
                        this.switchTab('questions');
                        break;
                    case shortcuts.practice:
                        e.preventDefault();
                        this.switchTab('practice');
                        break;
                    case shortcuts.darkMode:
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                }
            }

            // Search shortcut (/)
            if (e.code === shortcuts.search && !e.ctrlKey && !e.metaKey) {
                const searchInput = document.getElementById('questionSearch');
                if (searchInput && document.getElementById('questionsTab').classList.contains('active')) {
                    e.preventDefault();
                    searchInput.focus();
                }
            }
        };

        document.addEventListener('keydown', this.keyboardListener);
        console.log('✅ Keyboard shortcuts initialized');
    }

    /**
     * Remove keyboard shortcuts
     */
    removeKeyboardShortcuts() {
        if (this.keyboardListener) {
            document.removeEventListener('keydown', this.keyboardListener);
            this.keyboardListener = null;
            console.log('✅ Keyboard shortcuts removed');
        }
    }

    /**
     * Export all user data
     */
    exportAllData() {
        try {
            const exportData = {
                progress: this.progress,
                dashboardData: this.dashboardData,
                settings: this.settings,
                exportedAt: new Date().toISOString(),
                version: '2.0.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `interview-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            this.showErrorMessage('📦 Data exported successfully!', 'success');

        } catch (error) {
            console.error('❌ Error exporting data:', error);
            this.showErrorMessage('Failed to export data. Please try again.', 'error');
        }
    }

    /**
     * Import user data from file
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);

                    // Validate import data
                    if (!this.validateImportData(importData)) {
                        throw new Error('Invalid backup file format');
                    }

                    if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                        // Import data
                        this.progress = importData.progress;
                        this.dashboardData = importData.dashboardData;
                        this.settings = importData.settings;

                        // Save imported data
                        this.saveProgress();
                        this.saveDashboardData();
                        this.saveSettings();

                        // Apply new settings
                        this.applySettings();

                        // Refresh UI
                        this.renderWeeks();
                        this.updateProgressSummary();
                        this.updateDashboard();

                        this.showErrorMessage('📥 Data imported successfully!', 'success');
                    }

                } catch (error) {
                    console.error('❌ Error importing data:', error);
                    this.showErrorMessage('Failed to import data. Please check the file format.', 'error');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    /**
     * Validate imported data structure
     */
    validateImportData(data) {
        return data &&
               typeof data === 'object' &&
               data.progress &&
               this.validateProgressData(data.progress) &&
               data.dashboardData &&
               this.validateDashboardData(data.dashboardData) &&
               data.settings &&
               this.validateSettings(data.settings);
    }

    /**
     * Setup practice tab functionality
     */
    setupPracticeTab() {
        // Initialize practice tab content if needed
        console.log('Practice tab activated');
    }

    /**
     * Open practice form in new tab/window
     */
    openPracticeForm() {
        const practiceFormUrl = './selenium-practice-form.html';
        window.open(practiceFormUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    }

    /**
     * Download practice form as HTML file
     */
    downloadPracticeForm() {
        const practiceFormUrl = './selenium-practice-form.html';

        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = practiceFormUrl;
        link.download = 'selenium-practice-form.html';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        this.showNotification('Practice form download started!', 'success');
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: this.getNotificationColor(type),
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '9999',
            maxWidth: '300px',
            animation: 'slideInRight 0.3s ease-out'
        });

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get notification color based on type
     */
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * Sync data to cloud in background (non-blocking)
     */
    syncToCloudBackground() {
        if (!window.apiClient) {
            console.log('💾 Cloud sync not available');
            return;
        }

        // Don't await - let it run in background
        window.apiClient.syncToCloud(
            this.progress,
            this.dashboardData,
            this.settings
        ).then(result => {
            if (result.success) {
                console.log('☁️ Background sync completed');
            } else {
                console.warn('⚠️ Background sync failed:', result.error);
            }
        }).catch(error => {
            console.warn('⚠️ Background sync error:', error);
        });
    }

    // ===================================
    // QUESTION INTELLIGENCE SYSTEM INTEGRATION
    // ===================================

    initializeQuestionIntelligence() {
        try {
            // Initialize the QuestionIntelligence system if available
            if (typeof QuestionIntelligence !== 'undefined') {
                this.questionIntelligence = new QuestionIntelligence();
                console.log('🧠 Question Intelligence System initialized successfully');
            } else {
                console.warn('⚠️ QuestionIntelligence class not available - loading without intelligent features');
            }
        } catch (error) {
            console.error('❌ Error initializing Question Intelligence System:', error);
        }
    }

    getIntelligentFollowUps(questionId) {
        if (!this.questionIntelligence) {
            return [];
        }

        try {
            const suggestions = this.questionIntelligence.getSmartFollowUps(questionId, {
                maxSuggestions: 5,
                includeReview: true,
                includeAdvanced: true
            });

            console.log(`🧠 Generated ${suggestions.length} intelligent follow-ups for question ${questionId}`);
            return suggestions;
        } catch (error) {
            console.error('❌ Error getting intelligent follow-ups:', error);
            return [];
        }
    }

    performSemanticSearch(query, options = {}) {
        if (!this.questionIntelligence) {
            console.warn('⚠️ Semantic search unavailable - Question Intelligence not initialized');
            return [];
        }

        try {
            const results = this.questionIntelligence.semanticSearch(query, options);
            console.log(`🔍 Semantic search for "${query}" returned ${results.length} results`);
            return results;
        } catch (error) {
            console.error('❌ Error performing semantic search:', error);
            return [];
        }
    }
}

// Initialize the portal when DOM is loaded
let portal;
document.addEventListener('DOMContentLoaded', () => {
    portal = new PracticePortal();
});