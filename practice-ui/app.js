// Practice Portal Application
class PracticePortal {
    constructor() {
        this.currentExperienceLevel = 'senior'; // Default to senior
        this.currentTrack = 'standard';
        this.currentWeek = null;
        this.currentDay = null;
        this.progress = this.loadProgress();
        this.practiceData = null;
        this.interviewQuestions = null;
        this.currentQuestion = null;
        this.filteredQuestions = [];
        this.dashboardData = this.initializeDashboardData();
        this.motivationalMessages = this.getMotivationalMessages();
        this.settings = this.loadSettings();
        this.keyboardListener = null;
        this.isAuthenticated = false;
        this.currentUser = null;

        // Expose instance globally for WebSocket callbacks
        window.practicePortal = this;

        this.init();
    }

    // ===================================
    // AUTHENTICATION METHODS
    // ===================================

    async checkAuthentication() {
        try {
            if (!window.apiClient.token) {
                return false;
            }

            const user = await window.apiClient.getCurrentUser();
            this.currentUser = user;
            this.isAuthenticated = true;
            return true;
        } catch (error) {
            console.log('Authentication check failed:', error);
            return false;
        }
    }

    async showLoginModal() {
        return new Promise((resolve, reject) => {
            // Create login modal HTML
            const modalHTML = `
                <div id="loginModal" class="modal" style="display: block;">
                    <div class="modal-content" style="max-width: 400px;">
                        <span class="close" onclick="document.getElementById('loginModal').remove(); location.reload();">&times;</span>
                        <h2 id="modalTitle" style="margin-bottom: 1.5rem; color: var(--primary-color);">Login to Continue</h2>
                        <div id="modalBody">
                            <form id="loginForm">
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label for="loginUsername" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Username or Email:</label>
                                    <input type="text" id="loginUsername" required
                                           style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px;">
                                </div>
                                <div class="form-group" style="margin-bottom: 1.5rem;">
                                    <label for="loginPassword" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password:</label>
                                    <input type="password" id="loginPassword" required
                                           style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px;">
                                </div>
                                <button type="submit" class="btn-primary" style="width: 100%; margin-bottom: 1rem;">
                                    Login
                                </button>
                                <div style="text-align: center; font-size: 0.9rem; color: var(--text-secondary);">
                                    <p><strong>Demo Accounts:</strong></p>
                                    <p>Username: <code>demo_user</code> Password: <code>demo123</code></p>
                                    <p>Username: <code>john_doe</code> Password: <code>password123</code></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const loginForm = document.getElementById('loginForm');
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('loginUsername').value.trim();
                const password = document.getElementById('loginPassword').value;

                if (!username || !password) {
                    this.showErrorMessage('Please enter both username and password', 'warning');
                    return;
                }

                try {
                    const submitBtn = loginForm.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Logging in...';

                    const userData = await window.apiClient.login(username, password);
                    this.currentUser = userData.user;
                    this.isAuthenticated = true;

                    // Show success message
                    this.showErrorMessage(`Welcome back, ${userData.user.name}!`, 'success');

                    // Remove modal and resolve
                    document.getElementById('loginModal').remove();
                    resolve(userData);

                } catch (error) {
                    console.error('Login failed:', error);
                    this.showErrorMessage(error.message || 'Login failed. Please try again.', 'error');

                    const submitBtn = loginForm.querySelector('button[type="submit"]');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Login';
                }
            });
        });
    }

    async logout() {
        try {
            await window.apiClient.logout();
            this.isAuthenticated = false;
            this.currentUser = null;

            this.showErrorMessage('Logged out successfully', 'success');

            // Clear local data and reload
            setTimeout(() => {
                location.reload();
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            this.showErrorMessage('Logout failed, but local session cleared', 'warning');
            location.reload();
        }
    }

    updateHeaderForAuthentication() {
        const headerControls = document.querySelector('.header-controls');

        if (this.isAuthenticated && this.currentUser) {
            // Add user info and logout button
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                padding: 0.5rem 1rem;
                border-radius: 8px;
                color: white;
                font-size: 0.9rem;
            `;
            userInfo.innerHTML = `
                <span>👤 ${this.currentUser.name}</span>
                <button id="logoutBtn" class="header-btn" title="Logout"
                        style="background: rgba(255, 255, 255, 0.1); margin-left: 0.5rem;">
                    <span class="header-btn-icon">🚪</span>
                </button>
            `;

            headerControls.insertBefore(userInfo, headerControls.firstChild);

            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        }
    }

    // ===================================
    // DATA SYNCHRONIZATION METHODS
    // ===================================

    async syncDataWithServer() {
        try {
            if (!this.isAuthenticated) return;

            console.log('🔄 Syncing data with server...');

            // Check if we're online
            const isOnline = await window.apiClient.isOnline();
            if (!isOnline) {
                console.log('📱 Offline mode - using local data');
                this.showErrorMessage('Working offline - data will sync when connection is restored', 'info');
                return;
            }

            // Sync data
            const syncedData = await window.apiClient.syncData();

            // Update local properties with synced data
            this.progress = syncedData.progress || {};
            this.dashboardData = syncedData.dashboardData || this.initializeDashboardData();
            this.settings = syncedData.settings || this.loadSettings();

            console.log('✅ Data synced successfully');

        } catch (error) {
            console.warn('⚠️ Data sync failed, using local data:', error);

            // Fall back to local data if sync fails
            this.progress = this.loadProgress();
            this.dashboardData = this.initializeDashboardData();
            this.settings = this.loadSettings();
        }
    }

    async saveProgressToServer() {
        if (!this.isAuthenticated) return;

        try {
            const isOnline = await window.apiClient.isOnline();
            if (!isOnline) {
                // Queue for sync when online
                window.apiClient.queueForSync('progress', {
                    progress: this.progress,
                    dashboardData: this.dashboardData
                });
                return;
            }

            await window.apiClient.updateProgress(this.progress, this.dashboardData);

            // Send real-time update via WebSocket
            window.apiClient.sendProgressUpdate(this.progress, this.dashboardData);

            console.log('✅ Progress saved to server');

        } catch (error) {
            console.error('❌ Failed to save progress to server:', error);
            // Queue for retry
            window.apiClient.queueForSync('progress', {
                progress: this.progress,
                dashboardData: this.dashboardData
            });
        }
    }

    async saveSettingsToServer() {
        if (!this.isAuthenticated) return;

        try {
            const isOnline = await window.apiClient.isOnline();
            if (!isOnline) {
                window.apiClient.queueForSync('settings', this.settings);
                return;
            }

            await window.apiClient.updateSettings(this.settings);

            // Send real-time update via WebSocket
            window.apiClient.sendSettingsUpdate(this.settings);

            console.log('✅ Settings saved to server');

        } catch (error) {
            console.error('❌ Failed to save settings to server:', error);
            window.apiClient.queueForSync('settings', this.settings);
        }
    }

    // ===================================
    // WEBSOCKET EVENT HANDLERS
    // ===================================

    /**
     * Handle progress update from WebSocket
     */
    onProgressUpdate(data) {
        try {
            // Update local data
            this.progress = data.progress;
            this.dashboardData = data.dashboardData;

            // Refresh UI components
            this.updateProgressSummary();
            this.renderWeeks();
            this.updateDashboard();

            console.log('🔄 UI updated from real-time progress sync');

        } catch (error) {
            console.error('❌ Error handling WebSocket progress update:', error);
        }
    }

    /**
     * Handle settings update from WebSocket
     */
    onSettingsUpdate(data) {
        try {
            // Update local settings
            this.settings = data.settings;

            // Apply new settings to UI
            this.applySettings();

            console.log('⚙️ UI updated from real-time settings sync');

        } catch (error) {
            console.error('❌ Error handling WebSocket settings update:', error);
        }
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

            // Check authentication first
            const isAuthenticated = await this.checkAuthentication();

            if (!isAuthenticated) {
                this.showLoadingState(false);
                await this.showLoginModal();
                this.showLoadingState(true);
            }

            // Update header with user info
            this.updateHeaderForAuthentication();

            // Sync data with server
            await this.syncDataWithServer();

            await this.loadPracticeData();
            await this.loadInterviewQuestions();

            this.setupEventListeners();
            this.initializeTheme();
            this.applySettings();
            this.renderWeeks();
            this.updateProgressSummary();
            this.initializeDashboard();

            // Hide loading state
            this.showLoadingState(false);

            // Show success message
            this.showErrorMessage('✅ Application loaded successfully!', 'success');

        } catch (error) {
            console.error('❌ Critical error during initialization:', error);
            this.showErrorMessage('Failed to initialize the application. Please refresh the page.', 'error');
            this.showLoadingState(false);
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
            // Try API first if authenticated
            if (this.isAuthenticated) {
                try {
                    const apiData = await window.apiClient.getPracticeData(this.currentExperienceLevel);
                    this.practiceData = apiData;
                    console.log('✅ Practice data loaded from API');
                    return;
                } catch (error) {
                    console.warn('⚠️ API failed, falling back to local files:', error);
                }
            }

            // Fallback to local files
            let response;
            let dataFile;

            if (this.currentExperienceLevel === 'senior') {
                dataFile = 'practice-data-senior.json';
                response = await fetch(dataFile);
            } else {
                dataFile = 'practice-data.json';
                response = await fetch(dataFile);
            }

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`Failed to fetch ${dataFile}: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Validate data structure
            if (!data || !data.standard || !data.standard.weeks) {
                throw new Error('Invalid practice data structure');
            }

            this.practiceData = data;
            console.log(`✅ Successfully loaded practice data: ${dataFile}`);

        } catch (error) {
            console.error('❌ Error loading practice data:', error);
            this.showErrorMessage('Failed to load practice data. Using default content.', 'warning');

            // Fallback to default data
            this.practiceData = this.getDefaultData();
        }
    }

    async loadInterviewQuestions() {
        try {
            // Try API first if authenticated
            if (this.isAuthenticated) {
                try {
                    const apiData = await window.apiClient.getInterviewQuestions();
                    this.interviewQuestions = apiData;
                    this.filteredQuestions = this.getAllQuestions();
                    console.log('✅ Interview questions loaded from API');
                    return;
                } catch (error) {
                    console.warn('⚠️ API failed for questions, falling back to local file:', error);
                }
            }

            // Fallback to local file
            const response = await fetch('interview-questions.json');

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`Failed to fetch interview questions: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Validate data structure
            if (!data || !data.categories || !Array.isArray(data.categories)) {
                throw new Error('Invalid interview questions data structure');
            }

            this.interviewQuestions = data;
            this.filteredQuestions = this.getAllQuestions();
            console.log(`✅ Successfully loaded ${data.categories.length} question categories`);

        } catch (error) {
            console.error('❌ Error loading interview questions:', error);
            this.showErrorMessage('Failed to load interview questions. Using fallback content.', 'warning');

            // Fallback to minimal structure
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
        }
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
        const trackData = this.practiceData[this.currentTrack];
        const totalDays = trackData.weeks.reduce((sum, week) => sum + week.days.length, 0);
        const progressPercent = Math.round((completedDaysCount / totalDays) * 100);

        document.getElementById('completedDays').textContent = completedDaysCount;
        document.getElementById('totalProgress').textContent = `${progressPercent}%`;
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('practicePortalProgress');

            if (saved) {
                const parsed = JSON.parse(saved);

                // Validate progress data structure
                if (this.validateProgressData(parsed)) {
                    console.log('✅ Progress data loaded successfully');
                    return parsed;
                } else {
                    console.warn('⚠️ Invalid progress data found, resetting to defaults');
                    this.showErrorMessage('Progress data was corrupted and has been reset', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error loading progress from localStorage:', error);
            this.showErrorMessage('Failed to load saved progress. Starting fresh.', 'warning');
        }

        // Return default progress structure
        return {
            completedDays: {},
            tasks: {}
        };
    }

    validateProgressData(data) {
        // Check if data has required structure
        return data &&
               typeof data === 'object' &&
               typeof data.completedDays === 'object' &&
               typeof data.tasks === 'object';
    }

    saveProgress() {
        try {
            // Validate data before saving
            if (!this.validateProgressData(this.progress)) {
                console.error('❌ Invalid progress data, not saving');
                return false;
            }

            const dataString = JSON.stringify(this.progress);

            // Check if we're within localStorage limits (usually ~5MB)
            if (dataString.length > 4 * 1024 * 1024) { // 4MB limit
                console.warn('⚠️ Progress data is getting large, consider cleanup');
                this.showErrorMessage('Progress data is large. Consider exporting and resetting.', 'warning');
            }

            localStorage.setItem('practicePortalProgress', dataString);
            console.log('✅ Progress saved successfully');

            // Sync with server if authenticated
            this.saveProgressToServer();

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
        }
    }

    filterAndRenderQuestions() {
        const category = document.getElementById('categoryFilter').value;
        const difficulty = document.getElementById('difficultyFilter').value;
        const searchTerm = document.getElementById('questionSearch')?.value?.toLowerCase().trim() || '';

        this.filteredQuestions = this.getAllQuestions().filter(q => {
            // Filter by category
            if (category !== 'all' && q.categoryId !== category) {
                return false;
            }

            // Filter by difficulty
            if (difficulty !== 'all' && q.difficulty !== difficulty) {
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

                return searchableText.includes(searchTerm);
            }

            return true;
        });

        this.renderQuestionsList();
        this.updateSearchStats();
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
            this.filterAndRenderQuestions();
        }, 300);
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
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) return;

        if (this.filteredQuestions.length === 0) {
            const searchTerm = document.getElementById('questionSearch')?.value?.trim();

            if (searchTerm) {
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
                // Show filter-specific empty state
                questionsList.innerHTML = '<p class="no-results">No questions found for your current filters.</p>';
            }
            return;
        }

        const searchTerm = document.getElementById('questionSearch')?.value?.trim();

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

        // Add click event to question cards
        document.querySelectorAll('.question-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.questionIndex);
                this.showQuestion(index);
            });
        });
    }

    searchSuggestion(term) {
        const searchInput = document.getElementById('questionSearch');
        searchInput.value = term;
        this.handleSearchInput(term);
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

        // Follow-up questions
        const followUpSection = document.getElementById('followUpSection');
        if (question.followUp && question.followUp.length > 0) {
            followUpSection.style.display = 'block';
            const followUpList = document.getElementById('followUpList');
            followUpList.innerHTML = question.followUp.map(q =>
                `<li>${q}</li>`
            ).join('');
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

    updateProgressStats() {
        const completedDaysCount = Object.keys(this.progress.completedDays).length;
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

    // Enhanced question study tracking
    markQuestionAsStudied(questionId, timeSpent = 5) {
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

            localStorage.setItem('userSettings', JSON.stringify(this.settings));
            console.log('✅ Settings saved successfully');

            // Sync with server if authenticated
            this.saveSettingsToServer();

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
            // Apply theme
            if (this.settings.theme === 'auto') {
                const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.setTheme(systemDarkMode ? 'dark' : 'light');
            } else {
                this.setTheme(this.settings.theme);
            }

            // Apply display settings
            if (this.settings.display.compactMode) {
                document.body.classList.add('compact-mode');
            } else {
                document.body.classList.remove('compact-mode');
            }

            // Apply animations setting
            if (!this.settings.display.animationsEnabled) {
                document.body.classList.add('no-animations');
            } else {
                document.body.classList.remove('no-animations');
            }

            // Apply font size
            document.documentElement.setAttribute('data-font-size', this.settings.display.fontSize);

            // Initialize keyboard shortcuts if enabled
            if (this.settings.keyboard.enabled) {
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
}

// Initialize the portal when DOM is loaded
let portal;
document.addEventListener('DOMContentLoaded', () => {
    portal = new PracticePortal();
});