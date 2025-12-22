// Main Application Class - Modularized
// Interview Prep Platform - Frontend Integration
// Refactored: December 15, 2025

class PracticePortal {
    constructor() {
        // Application state
        this.currentExperienceLevel = 'senior';
        this.currentTrack = 'standard';
        this.currentWeek = null;
        this.currentDay = null;
        this.settings = this.loadSettings();

        // Initialize managers
        this.dataManager = new DataManager();
        this.questionManager = new QuestionManager();
        this.progressManager = new ProgressManager();

        // Expose instance globally
        window.practicePortal = this;

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Practice Portal...');

            // Show loading state
            this.showLoadingState(true);

            // Initialize API clients
            if (window.apiClient) {
                console.log('📡 API Client initialized');
            }
            if (window.apiV2Client) {
                console.log('🗄️ Database API Client initialized');
            }

            // Initialize managers
            this.questionManager.init(this.dataManager);
            await this.progressManager.init();

            // Load initial data
            await this.loadInitialData();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize UI
            this.setupUI();

            console.log('✅ Practice Portal initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing Practice Portal:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    // Load initial application data
    async loadInitialData() {
        try {
            // Load practice data and questions in parallel
            await Promise.all([
                this.dataManager.loadPracticeData(),
                this.dataManager.loadInterviewQuestions()
            ]);

            // Update UI with loaded data
            this.updateProgressSummary();
            this.renderWeeks();

        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            this.showErrorMessage('Some data failed to load. Please check your connection.', 'warning');
        }
    }

    // Setup main event listeners
    setupEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // Sidebar tabs
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Experience level selector
        const experienceLevelSelect = document.getElementById('experienceLevel');
        if (experienceLevelSelect) {
            experienceLevelSelect.addEventListener('change', (e) => {
                this.currentExperienceLevel = e.target.value;
                this.loadInitialData(); // Reload data for new experience level
            });
        }
    }

    // Setup initial UI state
    setupUI() {
        // Apply saved theme
        this.applyTheme(this.settings.theme || 'auto');

        // Set initial tab (schedule is marked active in HTML)
        this.switchTab('schedule');

        // Update progress summary
        this.updateProgressSummary();
    }

    // Show/hide loading state
    showLoadingState(show) {
        let loader = document.getElementById('globalLoader');

        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.className = 'global-loader';
                loader.innerHTML = `
                    <div class="loader-content">
                        <div class="loader-spinner"></div>
                        <div class="loader-text">Loading Interview Prep Platform...</div>
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

    // Show success message
    showSuccessMessage(message, type = 'success') {
        this.showMessage(message, type, '✅');
    }

    // Show error message
    showErrorMessage(message, type = 'error') {
        this.showMessage(message, type, '❌');
    }

    // Show message notification
    showMessage(message, type = 'info', icon = 'ℹ️') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Tab switching
    switchTab(tabName) {
        console.log('🔄 Switching to tab:', tabName);
        
        // Remove active class from all nav tabs
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
            // Reset inline styles for header tabs
            if (btn.style.color) {
                btn.style.color = 'rgba(255, 255, 255, 0.8)';
                btn.style.borderBottomColor = 'transparent';
                btn.style.background = 'transparent';
            }
        });

        // Hide all tab content sections
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Hide other content areas
        const welcomeScreen = document.getElementById('welcomeScreen');
        const dayContent = document.getElementById('dayContent');
        const questionContent = document.getElementById('questionContent');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (dayContent) dayContent.style.display = 'none';
        if (questionContent) questionContent.style.display = 'none';

        // Activate selected tab button
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
            // Apply active styles for header tabs
            if (tabBtn.style.color !== undefined) {
                tabBtn.style.color = 'white';
                tabBtn.style.borderBottomColor = 'white';
                tabBtn.style.background = 'rgba(255, 255, 255, 0.15)';
            }
        }

        // Show corresponding content
        let tabContent;
        switch (tabName) {
            case 'welcome':
                this.showWelcomeScreen();
                break;
            case 'dashboard':
                tabContent = document.getElementById('dashboardTab');
                if (tabContent) {
                    tabContent.style.display = 'block';
                    tabContent.classList.add('active');
                    // Initialize dashboard if needed
                    this.updateProgressSummary();
                }
                break;
            case 'schedule':
                tabContent = document.getElementById('scheduleTab');
                if (tabContent) {
                    tabContent.style.display = 'block';
                    tabContent.classList.add('active');
                    // Render weeks for schedule
                    this.renderWeeks();
                }
                break;
            case 'questions':
                tabContent = document.getElementById('questionsTab');
                if (tabContent) {
                    tabContent.style.display = 'block';
                    tabContent.classList.add('active');
                    // Initialize questions if needed
                    if (this.questionManager) {
                        // Load questions page to ensure data is loaded
                        this.questionManager.loadQuestionsPage();
                    }
                }
                break;
            case 'practice':
                tabContent = document.getElementById('practiceTab');
                if (tabContent) {
                    tabContent.style.display = 'block';
                    tabContent.classList.add('active');
                    // Initialize practice tab
                    this.setupPracticeTab();
                }
                break;
            case 'social':
                tabContent = document.getElementById('socialTab');
                if (tabContent) {
                    tabContent.style.display = 'block';
                    tabContent.classList.add('active');
                    // Initialize social features
                    if (window.socialManager) {
                        window.socialManager.updateSocialDisplay();
                    }
                }
                break;
            case 'integrations':
                tabContent = document.getElementById('integrationsTab');
                if (tabContent) {
                    tabContent.style.display = 'block';
                    tabContent.classList.add('active');
                    // Initialize integrations
                    if (window.integrationsManager) {
                        window.integrationsManager.updateIntegrationsDisplay();
                    }
                }
                break;
            case 'admin':
                // Admin panel - typically hidden
                this.showNotImplementedMessage('Admin Panel', 'Administrative features are not available in this view.');
                break;
            default:
                // Default to schedule tab
                this.switchTab('schedule');
                return;
        }

        // Update URL hash for bookmarking
        if (history.pushState) {
            history.pushState(null, null, `#${tabName}`);
        }
        
        console.log('✅ Tab switched to:', tabName);
    }

    // Show welcome screen
    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'block';

            // Generate dynamic welcome screen with actual functional modules
            welcomeScreen.innerHTML = `
                <div class="welcome-card">
                    <h2>👋 Welcome to Your Interview Prep Platform!</h2>
                    <p>Choose from the available modules below to start your learning journey:</p>

                    <div class="feature-grid">
                        <div class="feature-box" onclick="app.switchTab('dashboard')">
                            <div class="feature-icon">📊</div>
                            <h3>Dashboard</h3>
                            <p>View your progress, statistics, and learning analytics</p>
                            <button class="cta-button">Open Dashboard</button>
                        </div>

                        <div class="feature-box" onclick="app.switchTab('schedule')">
                            <div class="feature-icon">📅</div>
                            <h3>Learning Schedule</h3>
                            <p>Follow structured day-by-day learning paths and track completion</p>
                            <button class="cta-button">View Schedule</button>
                        </div>

                        <div class="feature-box" onclick="app.switchTab('questions')">
                            <div class="feature-icon">❓</div>
                            <h3>Interview Questions</h3>
                            <p>Practice with 250+ curated interview questions across multiple categories</p>
                            <button class="cta-button">Start Practicing</button>
                        </div>

                        <div class="feature-box" onclick="app.switchTab('practice')">
                            <div class="feature-icon">🎯</div>
                            <h3>Selenium Practice</h3>
                            <p>Hands-on coding exercises and automation testing scenarios</p>
                            <button class="cta-button">Begin Practice</button>
                        </div>
                    </div>

                    <div class="welcome-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="totalQuestions">250+</div>
                            <div class="stat-label">Questions Available</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="totalTracks">3</div>
                            <div class="stat-label">Learning Tracks</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="completionRate">0%</div>
                            <div class="stat-label">Overall Progress</div>
                        </div>
                    </div>

                    <div class="quick-start">
                        <h3>🚀 Quick Start Guide</h3>
                        <ol>
                            <li>Start with the <strong>Schedule</strong> to see your learning path</li>
                            <li>Practice with <strong>Interview Questions</strong> by topic</li>
                            <li>Apply knowledge with <strong>Selenium Practice</strong> exercises</li>
                            <li>Monitor progress in your <strong>Dashboard</strong></li>
                        </ol>
                    </div>
                </div>
            `;

            // Update stats with real data if available
            this.updateWelcomeStats();
        }

        // Hide other content areas
        document.getElementById('dayContent').style.display = 'none';
        const questionsList = document.getElementById('questionsList');
        if (questionsList) questionsList.style.display = 'none';
        const questionContent = document.getElementById('questionContent');
        if (questionContent) questionContent.style.display = 'none';
    }

    // Update welcome screen statistics with real data
    updateWelcomeStats() {
        // Update questions count
        if (this.dataManager && this.dataManager.questions) {
            const totalQuestionsEl = document.getElementById('totalQuestions');
            if (totalQuestionsEl) {
                totalQuestionsEl.textContent = this.dataManager.questions.length || '250+';
            }
        }

        // Update completion rate if progress manager is available
        if (this.progressManager) {
            const progress = this.progressManager.getProgress();
            if (progress) {
                const completionRateEl = document.getElementById('completionRate');
                if (completionRateEl) {
                    const rate = Math.round((progress.completedTasks / Math.max(progress.totalTasks, 1)) * 100);
                    completionRateEl.textContent = `${rate}%`;
                }
            }
        }
    }

    // Show not implemented message for tabs that aren't fully developed
    showNotImplementedMessage(title, description) {
        // Create a temporary content area for not implemented features
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'block';
            welcomeScreen.innerHTML = `
                <div class="welcome-card">
                    <h2>🚧 ${title}</h2>
                    <p>${description}</p>
                    <div class="feature-grid">
                        <div class="feature-box">
                            <div class="feature-icon">🔄</div>
                            <h3>In Development</h3>
                            <p>This feature is currently being developed and will be available in a future update.</p>
                        </div>
                        <div class="feature-box">
                            <div class="feature-icon">💡</div>
                            <h3>Suggestions Welcome</h3>
                            <p>Have ideas for this feature? We'd love to hear your feedback and suggestions.</p>
                        </div>
                    </div>
                    <button class="cta-button" onclick="app.switchTab('schedule')">
                        ← Back to Schedule
                    </button>
                </div>
            `;
        }
    }

    // Setup practice tab
    setupPracticeTab() {
        document.getElementById('practiceTab').classList.add('active');
        this.renderWeeks();
    }

    // Render weeks for practice tab
    renderWeeks() {
        const practiceData = this.dataManager.getPracticeData();
        if (!practiceData) {
            console.warn('⚠️ No practice data available');
            return;
        }

        // Try multiple possible container IDs
        let weeksContainer = document.getElementById('weekList') ||
                            document.getElementById('weeksContainer') ||
                            document.querySelector('.week-list');
        
        if (!weeksContainer) {
            console.warn('⚠️ Weeks container not found');
            return;
        }

        const currentTrackData = practiceData[this.currentTrack];
        if (!currentTrackData || !currentTrackData.weeks) {
            weeksContainer.innerHTML = '<div class="no-data">No practice data available for this track.</div>';
            return;
        }

        const weeksHTML = currentTrackData.weeks.map((week, index) => `
            <div class="week-item ${this.isWeekCompleted(index) ? 'completed' : ''}"
                 onclick="practicePortal.toggleWeek(${index})">
                <div class="week-header">
                    <h3>${week.title}</h3>
                    <span class="week-progress">${this.getWeekProgress(index)}% Complete</span>
                </div>
                <div class="week-days" id="week-${index}-days" style="display: none;">
                    ${week.days.map(day => `
                        <div class="day-item ${this.progressManager.isDayCompleted(index, day.id) ? 'completed' : ''}"
                             onclick="practicePortal.showDay(${index}, ${day.id}); event.stopPropagation();">
                            <div class="day-header">
                                <span class="day-title">${day.title}</span>
                                <span class="day-time">${day.timeCommitment}</span>
                            </div>
                            <div class="day-focus">${day.focus}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        weeksContainer.innerHTML = weeksHTML;
        console.log('✅ Weeks rendered:', currentTrackData.weeks.length);
    }

    // Toggle week expansion
    toggleWeek(weekIndex) {
        const weekDays = document.getElementById(`week-${weekIndex}-days`);
        if (weekDays) {
            weekDays.style.display = weekDays.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Show specific day content
    showDay(weekIndex, dayId) {
        const practiceData = this.dataManager.getPracticeData();
        if (!practiceData) return;

        const currentTrackData = practiceData[this.currentTrack];
        if (!currentTrackData || !currentTrackData.weeks[weekIndex]) return;

        const week = currentTrackData.weeks[weekIndex];
        const day = week.days.find(d => d.id === dayId);
        if (!day) return;

        // Update current position
        this.currentWeek = weekIndex;
        this.currentDay = dayId;

        // Hide other content
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('questionsList').style.display = 'none';

        // Show day content
        const dayContent = document.getElementById('dayContent');
        dayContent.style.display = 'block';

        // Render day content
        dayContent.innerHTML = `
            <div class="day-detail">
                <div class="day-header">
                    <h2>${day.title}</h2>
                    <p class="day-focus">${day.focus}</p>
                    <span class="day-time">⏱️ ${day.timeCommitment}</span>
                </div>

                <div class="day-tasks">
                    <h3>📝 Tasks</h3>
                    ${this.renderTasks(day.tasks || [])}
                </div>

                <div class="day-practice">
                    <h3>💻 Practice Exercises</h3>
                    ${this.renderPracticeExercises(day.practice || [])}
                </div>

                <div class="day-resources">
                    <h3>📚 Resources</h3>
                    ${this.renderResources(day.resources || [])}
                </div>

                <div class="day-actions">
                    <button class="complete-day-btn" onclick="practicePortal.markDayComplete()">
                        ${this.progressManager.isDayCompleted(weekIndex, dayId) ? '✅ Completed' : '✅ Mark Complete'}
                    </button>
                    <button class="next-day-btn" onclick="practicePortal.goToNextDay()">Next Day →</button>
                </div>
            </div>
        `;
    }

    // Render tasks list
    renderTasks(tasks) {
        if (!tasks.length) return '<p>No tasks for this day.</p>';

        return tasks.map((task, index) => `
            <div class="task-item">
                <div class="task-header">
                    <h4>${task.title}</h4>
                    <input type="checkbox"
                           id="task-${index}"
                           ${this.isTaskCompleted(`${this.currentWeek}-${this.currentDay}-task-${index}`) ? 'checked' : ''}
                           onchange="practicePortal.toggleTask('${this.currentWeek}-${this.currentDay}-task-${index}')">
                </div>
                <p class="task-description">${task.description}</p>
            </div>
        `).join('');
    }

    // Render practice exercises
    renderPracticeExercises(exercises) {
        if (!exercises.length) return '<p>No practice exercises for this day.</p>';

        return exercises.map(exercise => `
            <div class="exercise-item">
                <div class="exercise-header">
                    <h4>${exercise.title}</h4>
                    <span class="exercise-difficulty">${exercise.difficulty}</span>
                </div>
                <p class="exercise-description">${exercise.description}</p>
                <button class="show-details-btn" onclick="practicePortal.showPracticeDetails('${exercise.title}')">
                    View Details
                </button>
            </div>
        `).join('');
    }

    // Render resources
    renderResources(resources) {
        if (!resources.length) return '<p>No resources for this day.</p>';

        return resources.map(resource => `
            <div class="resource-item">
                <span class="resource-icon">${resource.icon}</span>
                <a href="${resource.url}" target="_blank" class="resource-link">${resource.title}</a>
            </div>
        `).join('');
    }

    // Mark day as complete
    markDayComplete() {
        if (this.currentWeek !== null && this.currentDay !== null) {
            this.progressManager.markDayComplete(this.currentWeek, this.currentDay);
            this.updateProgressSummary();
            this.renderWeeks(); // Refresh the weeks view
        }
    }

    // Toggle task completion
    toggleTask(taskKey) {
        this.progressManager.toggleTask(taskKey);
    }

    // Check if task is completed
    isTaskCompleted(taskKey) {
        const progress = this.progressManager.getProgress();
        return progress?.completedTasks?.includes(taskKey) || false;
    }

    // Go to next day
    goToNextDay() {
        // Implementation for going to next day
        const practiceData = this.dataManager.getPracticeData();
        if (!practiceData) return;

        const currentTrackData = practiceData[this.currentTrack];
        if (!currentTrackData || !currentTrackData.weeks) return;

        // Find next day logic
        const currentWeek = currentTrackData.weeks[this.currentWeek];
        if (currentWeek && currentWeek.days) {
            const currentDayIndex = currentWeek.days.findIndex(d => d.id === this.currentDay);
            if (currentDayIndex < currentWeek.days.length - 1) {
                // Next day in same week
                this.showDay(this.currentWeek, currentWeek.days[currentDayIndex + 1].id);
            } else if (this.currentWeek < currentTrackData.weeks.length - 1) {
                // First day of next week
                const nextWeek = currentTrackData.weeks[this.currentWeek + 1];
                if (nextWeek.days.length > 0) {
                    this.showDay(this.currentWeek + 1, nextWeek.days[0].id);
                }
            }
        }
    }

    // Update progress summary
    updateProgressSummary() {
        const progress = this.progressManager.getProgress();
        if (!progress) return;

        const stats = this.progressManager.getStatistics();

        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const percentage = stats.completionPercentage || 0;
            progressBar.style.width = `${percentage}%`;
        }

        // Update progress text
        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = `${stats.completedDays || 0}/${stats.totalDays || 0} days completed (${stats.completionPercentage || 0}%)`;
        }

        // Update streak
        const streakElement = document.getElementById('currentStreak');
        if (streakElement) {
            streakElement.textContent = `${stats.streak || 0} day streak`;
        }
    }

    // Week completion check
    isWeekCompleted(weekIndex) {
        const practiceData = this.dataManager.getPracticeData();
        if (!practiceData) return false;

        const currentTrackData = practiceData[this.currentTrack];
        if (!currentTrackData || !currentTrackData.weeks[weekIndex]) return false;

        const week = currentTrackData.weeks[weekIndex];
        return week.days.every(day => this.progressManager.isDayCompleted(weekIndex, day.id));
    }

    // Get week progress percentage
    getWeekProgress(weekIndex) {
        const practiceData = this.dataManager.getPracticeData();
        if (!practiceData) return 0;

        const currentTrackData = practiceData[this.currentTrack];
        if (!currentTrackData || !currentTrackData.weeks[weekIndex]) return 0;

        const week = currentTrackData.weeks[weekIndex];
        const completedDays = week.days.filter(day => this.progressManager.isDayCompleted(weekIndex, day.id)).length;
        return Math.round((completedDays / week.days.length) * 100);
    }

    // Settings management
    loadSettings() {
        const defaultSettings = {
            theme: 'auto',
            notifications: true,
            keyboard: {
                enabled: true,
                shortcuts: {
                    nextQuestion: 'ArrowRight',
                    previousQuestion: 'ArrowLeft',
                    showAnswer: 'Space'
                }
            }
        };

        const saved = localStorage.getItem('practiceSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('practiceSettings', JSON.stringify(this.settings));
    }

    // Theme management
    toggleDarkMode() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.settings.theme = newTheme;
        this.saveSettings();
    }

    applyTheme(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
    }

    // Settings modal (placeholder)
    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';

            // Populate current settings
            this.populateSettingsModal();

            // Setup event listeners if not already done
            if (!modal.hasAttribute('data-listeners-attached')) {
                this.setupSettingsModalListeners();
                modal.setAttribute('data-listeners-attached', 'true');
            }
        }
    }

    // Setup event listeners for settings modal
    setupSettingsModalListeners() {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;

        // Close button
        const closeBtn = document.getElementById('closeSettingsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Settings tabs
        modal.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchSettingsTab(tabName);
            });
        });

        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme(e.target.value);
                this.saveSettings();
            });
        }

        // Notifications checkbox
        const notificationsCheckbox = document.getElementById('notificationsEnabled');
        if (notificationsCheckbox) {
            notificationsCheckbox.addEventListener('change', (e) => {
                this.settings.notifications = e.target.checked;
                this.saveSettings();
            });
        }

        // Save button (if exists)
        const saveBtn = modal.querySelector('.btn-primary, .save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettingsFromModal();
                modal.style.display = 'none';
                this.showSuccessMessage('Settings saved successfully!');
            });
        }
    }

    // Switch tabs within settings modal
    switchSettingsTab(tabName) {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;

        // Remove active class from all tabs
        modal.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        modal.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Activate selected tab
        const selectedTab = modal.querySelector(`[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Show corresponding content
        const tabContent = document.getElementById(`${tabName}Tab`);
        if (tabContent) {
            tabContent.classList.add('active');
            tabContent.style.display = 'block';
        }
    }

    // Populate settings modal with current values
    populateSettingsModal() {
        // Theme selection
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.settings.theme || 'auto';
        }

        // Notifications
        const notificationsCheckbox = document.getElementById('notificationsEnabled');
        if (notificationsCheckbox) {
            notificationsCheckbox.checked = this.settings.notifications !== false;
        }

        // Other settings can be added here as needed
    }

    // Save settings from modal form
    saveSettingsFromModal() {
        // Theme
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            this.settings.theme = themeSelect.value;
        }

        // Notifications
        const notificationsCheckbox = document.getElementById('notificationsEnabled');
        if (notificationsCheckbox) {
            this.settings.notifications = notificationsCheckbox.checked;
        }

        // Save to localStorage
        this.saveSettings();

        // Apply theme changes
        this.applyTheme(this.settings.theme);
    }

    showPracticeDetails(exerciseTitle) {
        console.log('Practice details for:', exerciseTitle);
        this.showSuccessMessage(`Practice details for "${exerciseTitle}" would open here`, 'info');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize API clients first
    if (typeof APIClient !== 'undefined') {
        window.apiClient = new APIClient();
    }
    if (typeof ApiV2Client !== 'undefined') {
        window.apiV2Client = new ApiV2Client();
    }

    // Initialize main application
    new PracticePortal();
});