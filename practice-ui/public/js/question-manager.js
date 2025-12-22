// Question Manager Module
// Handles question search, pagination, filtering, and display
// Interview Prep Platform - Frontend Integration
// Created: December 15, 2025

class QuestionManager {
    constructor() {
        this.currentQuestionPage = 1;
        this.questionsPerPage = 20;
        this.totalQuestions = 0;
        this.totalPages = 0;
        this.hasNextPage = false;
        this.hasPrevPage = false;
        this.filteredQuestions = [];
        this.currentQuestion = null;
        this.searchTimeout = null;
        this.dataManager = null; // Will be injected
    }

    // Initialize with dependencies
    init(dataManager) {
        this.dataManager = dataManager;
        this.setupEventListeners();
    }

    // Setup event listeners for question-related controls
    setupEventListeners() {
        // Category and difficulty filters
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

        if (document.getElementById('experienceFilter')) {
            document.getElementById('experienceFilter').addEventListener('change', () => {
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
    }

    // Handle search input with debouncing
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

    // Clear search input and refresh results
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

    // Filter and render questions (main entry point)
    filterAndRenderQuestions() {
        // Reset to page 1 when filters change
        this.currentQuestionPage = 1;

        // Use database API with filters
        this.loadQuestionsPage();
    }

    // Load questions page with current filters
    async loadQuestionsPage() {
        try {
            // Show loading state
            this.showPaginationLoading(true);

            // Get current filter values
            const category = document.getElementById('categoryFilter')?.value || 'all';
            const difficulty = document.getElementById('difficultyFilter')?.value || 'all';
            const experience = document.getElementById('experienceFilter')?.value || 'all';
            const searchTerm = document.getElementById('questionSearch')?.value?.trim() || '';

            // Build filters object
            const filters = {};
            if (category !== 'all') filters.category = category;
            if (difficulty !== 'all') filters.difficulty = difficulty;
            if (experience !== 'all') filters.experience = experience;
            if (searchTerm) filters.search = searchTerm;

            // Load questions using DataManager
            const result = await this.dataManager.loadQuestionsPage(
                this.currentQuestionPage,
                this.questionsPerPage,
                filters
            );

            if (result.pagination) {
                this.totalQuestions = result.pagination.total;
                this.totalPages = result.pagination.totalPages;
                this.hasNextPage = result.pagination.hasNext;
                this.hasPrevPage = result.pagination.hasPrev;
                this.currentQuestionPage = result.pagination.currentPage;
            }

            // Update filtered questions
            this.filteredQuestions = this.dataManager.getAllQuestions();

            console.log(`✅ Questions loaded from ${result.source}: ${this.totalQuestions} total, showing ${this.filteredQuestions.length} questions`);

            // Render questions and update UI
            this.renderQuestions();
            this.updatePaginationControls();
            this.updateSearchStats();

        } catch (error) {
            console.error('❌ Error loading questions page:', error);
            this.showErrorMessage('Failed to load questions. Please try again.', 'error');
        } finally {
            this.showPaginationLoading(false);
        }
    }

    // Navigation methods
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

    // Show specific question details
    showQuestion(index) {
        if (index < 0 || index >= this.filteredQuestions.length) return;

        this.currentQuestion = index;
        const question = this.filteredQuestions[index];

        // CRITICAL FIX: Add null/undefined checks for question data
        if (!question) {
            console.error(`❌ Question at index ${index} is undefined`);
            this.showErrorMessage('Question data is not available', 'error');
            return;
        }

        const questionText = question.question || question.text || 'No question text available';
        const answerText = question.answer || 'No answer available';
        const categoryName = question.categoryName || question.category || 'Unknown Category';
        const difficulty = question.difficulty || 'Medium';

        // Hide other views
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('dayContent').style.display = 'none';
        document.getElementById('questionsList').style.display = 'none';

        // Show question detail view
        const questionContent = document.getElementById('questionContent');
        questionContent.style.display = 'block';

        // Render question content
        questionContent.innerHTML = `
            <div class="question-detail">
                <div class="question-header">
                    <div class="question-meta">
                        <span class="question-category">${categoryName}</span>
                        <span class="question-difficulty difficulty-${difficulty.toLowerCase()}">${difficulty}</span>
                    </div>
                    <button class="back-btn" onclick="practicePortal.questionManager.backToQuestionsList()">
                        ← Back to Questions
                    </button>
                </div>

                <div class="question-content">
                    <h2 class="question-title">Question ${index + 1}</h2>
                    <div class="question-text">${questionText}</div>
                </div>

                <div class="answer-section">
                    <button class="show-answer-btn" onclick="this.nextElementSibling.style.display='block'; this.style.display='none';">
                        Show Answer
                    </button>
                    <div class="answer-content" style="display: none;">
                        <h3>Answer:</h3>
                        <div class="answer-text">${answerText}</div>
                    </div>
                </div>

                <div class="question-navigation">
                    <button onclick="practicePortal.questionManager.showQuestion(${index - 1})"
                            ${index === 0 ? 'disabled' : ''}>← Previous</button>
                    <button onclick="practicePortal.questionManager.showQuestion(${index + 1})"
                            ${index === this.filteredQuestions.length - 1 ? 'disabled' : ''}>Next →</button>
                </div>
            </div>
        `;
    }

    // Go back to questions list
    backToQuestionsList() {
        document.getElementById('questionContent').style.display = 'none';
        document.getElementById('questionsList').style.display = 'block';
    }

    // Render questions list
    renderQuestions() {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) return;

        const questionsContainer = questionsList.querySelector('.questions-container') || questionsList;

        if (this.filteredQuestions.length === 0) {
            questionsContainer.innerHTML = '<div class="no-questions">No questions found matching your criteria.</div>';
            return;
        }

        const questionsHTML = this.filteredQuestions.map((question, index) => {
            // CRITICAL FIX: Add null/undefined checks for question data
            if (!question) {
                console.warn(`⚠️ Question at index ${index} is undefined`);
                return '<div class="question-item error">Invalid question data</div>';
            }

            const questionText = question.question || question.text || 'No question text available';
            const categoryName = question.categoryName || question.category || 'Unknown Category';
            const difficulty = question.difficulty || 'Medium';
            const tags = question.tags || [];

            return `
                <div class="question-item" onclick="practicePortal.questionManager.showQuestion(${index})">
                    <div class="question-header">
                        <span class="question-category">${categoryName}</span>
                        <span class="question-difficulty difficulty-${difficulty.toLowerCase()}">${difficulty}</span>
                    </div>
                    <div class="question-preview">
                        ${questionText.substring(0, 150)}${questionText.length > 150 ? '...' : ''}
                    </div>
                    <div class="question-tags">
                        ${Array.isArray(tags) ? tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            `;
        }).join('');

        questionsContainer.innerHTML = questionsHTML;
    }

    // Update pagination controls
    updatePaginationControls() {
        const paginationContainer = document.getElementById('paginationContainer');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const paginationInfo = document.getElementById('paginationInfo');
        const paginationMeta = document.getElementById('paginationMeta');

        if (!paginationContainer) return;

        // Show pagination if we have multiple pages
        const shouldShowPagination = this.totalPages > 1;

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
            }

            if (nextBtn) {
                nextBtn.disabled = !this.hasNextPage;
            }

        } else {
            paginationContainer.style.display = 'none';
        }
    }

    // Update search statistics
    updateSearchStats() {
        const searchStats = document.getElementById('searchStats');
        const searchInput = document.getElementById('questionSearch');

        if (searchStats && searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.trim();
            searchStats.innerHTML = `
                <span>Found ${this.totalQuestions} questions for "${searchTerm}"</span>
                <button onclick="practicePortal.questionManager.clearSearch()">Clear</button>
            `;
            searchStats.style.display = 'block';
        } else if (searchStats) {
            searchStats.style.display = 'none';
        }
    }

    // Show/hide pagination loading state
    showPaginationLoading(show) {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) return;

        if (show) {
            questionsList.innerHTML = '<div class="loading-pagination">🔄 Loading questions...</div>';
        }
    }

    // Helper functions (will delegate to main app)
    showErrorMessage(message, type = 'error') {
        if (window.practicePortal && window.practicePortal.showErrorMessage) {
            window.practicePortal.showErrorMessage(message, type);
        } else {
            console.error(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Getters
    getCurrentQuestion() {
        return this.currentQuestion;
    }

    getFilteredQuestions() {
        return this.filteredQuestions;
    }

    getPaginationInfo() {
        return {
            currentPage: this.currentQuestionPage,
            totalPages: this.totalPages,
            totalQuestions: this.totalQuestions,
            hasNext: this.hasNextPage,
            hasPrev: this.hasPrevPage
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.QuestionManager = QuestionManager;
}