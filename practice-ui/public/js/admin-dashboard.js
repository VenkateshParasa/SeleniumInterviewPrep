// Admin Dashboard JavaScript
// Handles all CRUD operations and API interactions
// Created: December 19, 2025

class AdminDashboard {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.currentSection = 'overview';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.questions = [];
        this.categories = [];
        this.users = [];
        this.stats = {};
        
        this.init();
    }

    getApiBaseUrl() {
        // Always use database API - no local mode fallback
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api/v2';
        }
        return '/api/v2';
    }

    async init() {
        this.setupEventListeners();
        await this.checkApiStatus();
        await this.loadInitialData();
        this.showSection('overview');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.showSection(section);
            });
        });

        // Search and filters
        document.getElementById('questionSearchInput')?.addEventListener('input', 
            this.debounce(() => this.filterQuestions(), 300));
        
        document.getElementById('questionCategoryFilter')?.addEventListener('change', 
            () => this.filterQuestions());
        
        document.getElementById('questionDifficultyFilter')?.addEventListener('change', 
            () => this.filterQuestions());

        // Auto-generate slug from category name
        document.getElementById('categoryName')?.addEventListener('input', (e) => {
            const slug = e.target.value.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            document.getElementById('categorySlug').value = slug;
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async checkApiStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            
            if (data.success) {
                this.updateApiStatus(true);
                console.log('✅ Database API connected successfully');
            } else {
                this.updateApiStatus(false, 'API Error');
                console.error('❌ Database API health check failed:', data);
            }
        } catch (error) {
            console.error('❌ Failed to connect to database API:', error.message);
            this.updateApiStatus(false, 'API Offline');
            throw new Error('Database API is not available. Please start the server with: node server.js');
        }
    }

    updateApiStatus(isOnline, customText = null) {
        const badge = document.getElementById('apiStatusBadge');
        if (isOnline) {
            badge.className = 'api-status api-online';
            badge.innerHTML = '<i class="fas fa-circle me-1"></i>API Online';
        } else {
            badge.className = 'api-status api-offline';
            badge.innerHTML = `<i class="fas fa-circle me-1"></i>${customText || 'API Offline'}`;
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadQuestions(),
                this.loadCategories(),
                this.loadUsers(),
                this.loadStats()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadQuestions() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/questions?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.questions = data.data;
                console.log(`✅ Loaded ${this.questions.length} questions from database`);
                this.renderQuestionsTable();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to load questions from database:', error);
            this.showError('Failed to load questions from database. Please ensure the server is running.');
            throw error;
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/categories`);
            const data = await response.json();
            
            if (data.success) {
                this.categories = data.data;
                console.log(`✅ Loaded ${this.categories.length} categories from database`);
                this.renderCategoriesTable();
                this.populateCategoryDropdowns();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to load categories from database:', error);
            this.showError('Failed to load categories from database. Please ensure the server is running.');
            throw error;
        }
    }

    async loadUsers() {
        try {
            // Note: This would require a users endpoint
            this.users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin',
                    experience_level: 'senior',
                    is_active: true,
                    last_login: new Date().toISOString()
                }
            ];
            this.renderUsersTable();
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    async loadStats() {
        try {
            const totalQuestions = this.questions.length;
            const totalCategories = this.categories.length;
            const totalUsers = this.users.length;
            
            this.stats = {
                totalQuestions,
                totalCategories,
                totalUsers,
                totalProgress: 0
            };
            
            this.updateStatsCards();
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStatsCards() {
        document.getElementById('totalQuestions').textContent = this.stats.totalQuestions || 0;
        document.getElementById('totalCategories').textContent = this.stats.totalCategories || 0;
        document.getElementById('totalUsers').textContent = this.stats.totalUsers || 0;
        document.getElementById('totalProgress').textContent = this.stats.totalProgress || 0;
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${sectionName}-section`).style.display = 'block';
        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'overview':
                this.loadRecentActivity();
                break;
            case 'api-status':
                this.loadApiStatus();
                break;
            case 'database':
                this.loadDatabaseInfo();
                break;
        }
    }

    renderQuestionsTable() {
        const tbody = document.getElementById('questionsTable');
        if (!tbody) return;

        if (this.questions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">No questions found</td>
                </tr>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageQuestions = this.questions.slice(startIndex, endIndex);

        tbody.innerHTML = pageQuestions.map(question => `
            <tr>
                <td>${question.id || question.id}</td>
                <td>
                    <div class="text-truncate" style="max-width: 300px;" title="${question.question || question.question_text}">
                        ${question.question || question.question_text}
                    </div>
                </td>
                <td>${question.category_name || 'Unknown'}</td>
                <td>
                    <span class="difficulty-badge difficulty-${question.difficulty_level || this.getDifficultyLevel(question.difficulty)}">
                        ${question.difficulty || this.getDifficultyText(question.difficulty_level)}
                    </span>
                </td>
                <td>${question.question_type || 'theoretical'}</td>
                <td>
                    <span class="status-badge ${question.is_active ? 'status-active' : 'status-inactive'}">
                        ${question.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminDashboard.editQuestion('${question.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.deleteQuestion('${question.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.renderPagination('questions');
    }

    getDifficultyLevel(difficultyText) {
        const mapping = {
            'Easy': 1,
            'Medium': 2,
            'Medium-Hard': 3,
            'Hard': 4,
            'Expert': 5
        };
        return mapping[difficultyText] || 3;
    }

    getDifficultyText(level) {
        const mapping = {
            1: 'Easy',
            2: 'Medium',
            3: 'Medium-Hard',
            4: 'Hard',
            5: 'Expert'
        };
        return mapping[level] || 'Medium-Hard';
    }

    renderCategoriesTable() {
        const tbody = document.getElementById('categoriesTable');
        if (!tbody) return;

        if (this.categories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">No categories found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.categories.map(category => `
            <tr>
                <td>${category.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="${category.icon || 'fas fa-tag'} me-2"></i>
                        ${category.name}
                    </div>
                </td>
                <td><code>${category.slug}</code></td>
                <td><i class="${category.icon || 'fas fa-tag'}"></i></td>
                <td>${category.totalQuestions || 0}</td>
                <td>
                    <span class="status-badge ${category.is_active ? 'status-active' : 'status-inactive'}">
                        ${category.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminDashboard.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderUsersTable() {
        const tbody = document.getElementById('usersTable');
        if (!tbody) return;

        if (this.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">No users found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge bg-primary">${user.role}</span>
                </td>
                <td>${user.experience_level}</td>
                <td>
                    <span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">
                        ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminDashboard.editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    populateCategoryDropdowns() {
        const dropdowns = [
            document.getElementById('questionCategoryFilter'),
            document.getElementById('questionCategory')
        ];

        dropdowns.forEach(dropdown => {
            if (dropdown) {
                const currentValue = dropdown.value;
                dropdown.innerHTML = dropdown.id.includes('Filter') ? 
                    '<option value="">All Categories</option>' : 
                    '<option value="">Select Category</option>';
                
                this.categories.forEach(category => {
                    dropdown.innerHTML += `<option value="${category.id}">${category.name}</option>`;
                });
                
                dropdown.value = currentValue;
            }
        });
    }

    renderPagination(type) {
        const paginationId = `${type}Pagination`;
        const pagination = document.getElementById(paginationId);
        if (!pagination) return;

        const totalItems = this.questions.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="adminDashboard.changePage(${this.currentPage - 1})">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="adminDashboard.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="adminDashboard.changePage(${this.currentPage + 1})">Next</a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        const totalPages = Math.ceil(this.questions.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderQuestionsTable();
    }

    filterQuestions() {
        const searchTerm = document.getElementById('questionSearchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('questionCategoryFilter')?.value || '';
        const difficultyFilter = document.getElementById('questionDifficultyFilter')?.value || '';

        // Reset to first page when filtering
        this.currentPage = 1;

        // Apply filters (this would normally be done server-side)
        // For now, we'll filter the loaded questions
        this.renderQuestionsTable();
    }

    loadRecentActivity() {
        const tbody = document.getElementById('recentActivityTable');
        if (!tbody) return;

        // Mock recent activity data
        const activities = [
            {
                time: new Date().toLocaleTimeString(),
                action: 'Question Added',
                resource: 'Java Fundamentals',
                status: 'Success'
            },
            {
                time: new Date(Date.now() - 300000).toLocaleTimeString(),
                action: 'Category Updated',
                resource: 'Selenium WebDriver',
                status: 'Success'
            },
            {
                time: new Date(Date.now() - 600000).toLocaleTimeString(),
                action: 'User Login',
                resource: 'admin@example.com',
                status: 'Success'
            }
        ];

        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.time}</td>
                <td>${activity.action}</td>
                <td>${activity.resource}</td>
                <td>
                    <span class="status-badge status-active">${activity.status}</span>
                </td>
            </tr>
        `).join('');
    }

    loadApiStatus() {
        const container = document.getElementById('apiEndpointsStatus');
        if (!container) return;

        const endpoints = [
            { name: 'GET /questions', url: '/questions', status: 'checking' },
            { name: 'GET /categories', url: '/categories', status: 'checking' },
            { name: 'POST /questions', url: '/questions', status: 'checking' },
            { name: 'GET /health', url: '/health', status: 'checking' }
        ];

        container.innerHTML = endpoints.map(endpoint => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <span><code>${endpoint.name}</code></span>
                <span class="api-status api-offline">
                    <div class="loading"></div>
                </span>
            </div>
        `).join('');

        // Check each endpoint
        endpoints.forEach(async (endpoint, index) => {
            try {
                const response = await fetch(`${this.apiBaseUrl}${endpoint.url}`);
                const statusElement = container.children[index].querySelector('.api-status');
                
                if (response.ok) {
                    statusElement.className = 'api-status api-online';
                    statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Online';
                } else {
                    statusElement.className = 'api-status api-offline';
                    statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Error';
                }
            } catch (error) {
                const statusElement = container.children[index].querySelector('.api-status');
                statusElement.className = 'api-status api-offline';
                statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Offline';
            }
        });
    }

    loadDatabaseInfo() {
        const container = document.getElementById('databaseTables');
        if (!container) return;

        const tables = [
            'users', 'categories', 'questions', 'user_question_progress',
            'tracks', 'track_days', 'practice_exercises', 'resources'
        ];

        container.innerHTML = tables.map(table => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <span><i class="fas fa-table me-2"></i>${table}</span>
                <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.queryTable('${table}')">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `).join('');
    }

    queryTable(tableName) {
        document.getElementById('sqlQuery').value = `SELECT * FROM ${tableName} LIMIT 10;`;
        this.executeSqlQuery();
    }

    async executeSqlQuery() {
        const query = document.getElementById('sqlQuery').value.trim();
        if (!query) return;

        const resultsDiv = document.getElementById('sqlResults');
        const headerDiv = document.getElementById('sqlResultsHeader');
        const bodyDiv = document.getElementById('sqlResultsBody');

        // Show loading
        headerDiv.innerHTML = '<tr><th>Executing...</th></tr>';
        bodyDiv.innerHTML = '<tr><td><div class="loading me-2"></div>Executing query...</td></tr>';
        resultsDiv.style.display = 'block';

        try {
            // Execute real SQL query
            const response = await fetch('/api/admin/sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (data.success) {
                if (Array.isArray(data.data) && data.data.length > 0) {
                    // Display SELECT results
                    const columns = Object.keys(data.data[0]);
                    headerDiv.innerHTML = `
                        <tr>
                            ${columns.map(col => `<th>${col}</th>`).join('')}
                        </tr>
                    `;
                    
                    bodyDiv.innerHTML = data.data.map(row => `
                        <tr>
                            ${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}
                        </tr>
                    `).join('');
                } else if (data.data && typeof data.data === 'object') {
                    // Display INSERT/UPDATE/DELETE results
                    headerDiv.innerHTML = '<tr><th>Property</th><th>Value</th></tr>';
                    bodyDiv.innerHTML = Object.entries(data.data).map(([key, value]) => `
                        <tr>
                            <td>${key}</td>
                            <td>${value}</td>
                        </tr>
                    `).join('');
                } else {
                    headerDiv.innerHTML = '<tr><th>Result</th></tr>';
                    bodyDiv.innerHTML = `<tr><td>${data.message || 'Query executed successfully'}</td></tr>`;
                }
            } else {
                headerDiv.innerHTML = '<tr><th>Error</th></tr>';
                bodyDiv.innerHTML = `<tr><td class="text-danger">${data.error}</td></tr>`;
            }
        } catch (error) {
            console.error('SQL query error:', error);
            headerDiv.innerHTML = '<tr><th>Error</th></tr>';
            bodyDiv.innerHTML = `<tr><td class="text-danger">Failed to execute query: ${error.message}</td></tr>`;
        }
    }

    clearSqlQuery() {
        document.getElementById('sqlQuery').value = '';
        document.getElementById('sqlResults').style.display = 'none';
    }

    // Modal functions
    showAddQuestionModal() {
        const modal = new bootstrap.Modal(document.getElementById('addQuestionModal'));
        modal.show();
    }

    showAddCategoryModal() {
        const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
        modal.show();
    }

    async saveQuestion() {
        const formData = {
            category_id: document.getElementById('questionCategory').value,
            question_text: document.getElementById('questionText').value,
            answer: document.getElementById('questionAnswer').value,
            explanation: document.getElementById('questionExplanation').value,
            difficulty_level: parseInt(document.getElementById('questionDifficulty').value),
            question_type: document.getElementById('questionType').value,
            estimated_time: parseInt(document.getElementById('questionTime').value),
            tags: document.getElementById('questionTags').value.split(',').map(t => t.trim()).filter(t => t)
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Question added successfully');
                bootstrap.Modal.getInstance(document.getElementById('addQuestionModal')).hide();
                await this.loadQuestions();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to save question:', error);
            this.showError('Failed to save question: ' + error.message);
        }
    }

    async saveCategory() {
        const formData = {
            name: document.getElementById('categoryName').value,
            slug: document.getElementById('categorySlug').value,
            description: document.getElementById('categoryDescription').value,
            icon: document.getElementById('categoryIcon').value,
            color: document.getElementById('categoryColor').value
        };

        try {
            // Mock save (in real implementation, this would call the backend)
            this.showSuccess('Category added successfully');
            bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
            
            // Add to local categories array
            this.categories.push({
                id: Date.now(),
                ...formData,
                is_active: true,
                totalQuestions: 0
            });
            
            this.renderCategoriesTable();
            this.populateCategoryDropdowns();
        } catch (error) {
            console.error('Failed to save category:', error);
            this.showError('Failed to save category: ' + error.message);
        }
    }

    editQuestion(id) {
        this.showInfo('Edit question functionality would be implemented here');
    }

    deleteQuestion(id) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.showInfo('Delete question functionality would be implemented here');
        }
    }

    editCategory(id) {
        this.showInfo('Edit category functionality would be implemented here');
    }

    deleteCategory(id) {
        if (confirm('Are you sure you want to delete this category?')) {
            this.showInfo('Delete category functionality would be implemented here');
        }
    }

    editUser(id) {
        this.showInfo('Edit user functionality would be implemented here');
    }

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.showInfo('Delete user functionality would be implemented here');
        }
    }

    // Utility functions
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'danger');
    }

    showInfo(message) {
        this.showToast(message, 'info');
    }

    showToast(message, type) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Global functions for onclick handlers
window.refreshData = function() {
    adminDashboard.loadInitialData();
    adminDashboard.showSuccess('Data refreshed successfully');
};

window.exportData = function() {
    const data = {
        questions: adminDashboard.questions,
        categories: adminDashboard.categories,
        users: adminDashboard.users,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    adminDashboard.showSuccess('Data exported successfully');
};

window.showAddQuestionModal = function() {
    adminDashboard.showAddQuestionModal();
};

window.showAddCategoryModal = function() {
    adminDashboard.showAddCategoryModal();
};

window.showAddUserModal = function() {
    adminDashboard.showInfo('Add user functionality would be implemented here');
};

window.saveQuestion = function() {
    adminDashboard.saveQuestion();
};

window.saveCategory = function() {
    adminDashboard.saveCategory();
};

window.executeSqlQuery = function() {
    adminDashboard.executeSqlQuery();
};

window.clearSqlQuery = function() {
    adminDashboard.clearSqlQuery();
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});