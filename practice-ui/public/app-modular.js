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
        document.querySelectorAll('.tab-btn').forEach(btn => {
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

        // Set initial tab
        this.switchTab('welcome');

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
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');

        // Activate selected tab
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        }

        // Show corresponding content
        if (tabName === 'welcome') {
            this.showWelcomeScreen();
        } else if (tabName === 'questions') {
            document.getElementById('questionsList').style.display = 'block';
            this.questionManager.filterAndRenderQuestions();
        } else if (tabName === 'practice') {
            this.setupPracticeTab();
        }
    }

    // Show welcome screen
    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('dayContent').style.display = 'none';
        document.getElementById('questionsList').style.display = 'none';
        document.getElementById('questionContent').style.display = 'none';
    }

    // Setup practice tab
    setupPracticeTab() {
        document.getElementById('practiceTab').classList.add('active');
        this.renderWeeks();
    }

    // Render weeks for practice tab
    renderWeeks() {
        const practiceData = this.dataManager.getPracticeData();
        if (!practiceData) return;

        const weeksContainer = document.getElementById('weeksContainer');
        if (!weeksContainer) return;

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
        console.log('Settings modal would open here');
        this.showSuccessMessage('Settings modal not implemented in this refactored version', 'info');
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