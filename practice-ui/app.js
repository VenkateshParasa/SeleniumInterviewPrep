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

        this.init();
    }

    async init() {
        await this.loadPracticeData();
        await this.loadInterviewQuestions();
        this.setupEventListeners();
        this.renderWeeks();
        this.updateProgressSummary();
    }

    async loadPracticeData() {
        try {
            // Try to load experience-specific data first (senior/mid/junior)
            let response;
            if (this.currentExperienceLevel === 'senior') {
                response = await fetch('practice-data-senior.json');
            } else {
                response = await fetch('practice-data.json');
            }
            this.practiceData = await response.json();
        } catch (error) {
            console.error('Error loading practice data:', error);
            // Fallback to default data
            this.practiceData = this.getDefaultData();
        }
    }

    async loadInterviewQuestions() {
        try {
            const response = await fetch('interview-questions.json');
            this.interviewQuestions = await response.json();
            this.filteredQuestions = this.getAllQuestions();
        } catch (error) {
            console.error('Error loading interview questions:', error);
            this.interviewQuestions = { categories: [] };
            this.filteredQuestions = [];
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
        const saved = localStorage.getItem('practicePortalProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            completedDays: {},
            tasks: {}
        };
    }

    saveProgress() {
        localStorage.setItem('practicePortalProgress', JSON.stringify(this.progress));
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

        if (tabName === 'schedule') {
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

            return hasRelevantExp;
        });

        this.renderQuestionsList();
    }

    renderQuestionsList() {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) return;

        if (this.filteredQuestions.length === 0) {
            questionsList.innerHTML = '<p class="no-results">No questions found for your filters.</p>';
            return;
        }

        questionsList.innerHTML = this.filteredQuestions.map((q, index) => `
            <div class="question-card" data-question-index="${index}">
                <div class="question-card-header">
                    <h4>${q.question}</h4>
                    <span class="difficulty-badge difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                </div>
                <div class="question-card-meta">
                    <span class="category-badge">${q.categoryName}</span>
                    <span class="topic-badge">${q.topic}</span>
                </div>
                <div class="question-card-footer">
                    <span class="companies-preview">${q.companies.slice(0, 3).join(', ')}${q.companies.length > 3 ? '...' : ''}</span>
                </div>
            </div>
        `).join('');

        // Add click event to question cards
        document.querySelectorAll('.question-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.questionIndex);
                this.showQuestion(index);
            });
        });
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
}

// Initialize the portal when DOM is loaded
let portal;
document.addEventListener('DOMContentLoaded', () => {
    portal = new PracticePortal();
});