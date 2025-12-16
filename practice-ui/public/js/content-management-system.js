// Content Management System
// Admin interface and content management for Interview Prep Platform
// Created: December 15, 2025

class ContentManagementSystem {
    constructor(apiClient, analyticsManager) {
        this.apiClient = apiClient;
        this.analyticsManager = analyticsManager;
        this.currentUser = null;
        this.permissions = new Set();
        this.contentTypes = {
            questions: 'questions',
            tracks: 'tracks',
            categories: 'categories',
            users: 'users'
        };

        this.workflows = {
            draft: 'draft',
            review: 'review',
            approved: 'approved',
            published: 'published',
            archived: 'archived'
        };

        this.bulkOperations = new Map();
        this.versionHistory = new Map();
        this.pendingApprovals = [];

        this.initialize();
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    async initialize() {
        await this.loadCurrentUser();
        await this.loadPermissions();
        this.setupEventListeners();

        console.log('🎛️ Content Management System initialized');
    }

    async loadCurrentUser() {
        try {
            if (this.apiClient && this.apiClient.getCurrentUser) {
                const response = await this.apiClient.getCurrentUser();
                this.currentUser = response.success ? response.data : null;
            }
        } catch (error) {
            console.error('❌ Failed to load current user:', error);
        }
    }

    async loadPermissions() {
        if (!this.currentUser) return;

        // Set permissions based on user role
        switch (this.currentUser.role) {
            case 'admin':
                this.permissions.add('create_questions');
                this.permissions.add('edit_questions');
                this.permissions.add('delete_questions');
                this.permissions.add('approve_content');
                this.permissions.add('manage_users');
                this.permissions.add('bulk_operations');
                this.permissions.add('system_settings');
                break;

            case 'moderator':
                this.permissions.add('create_questions');
                this.permissions.add('edit_questions');
                this.permissions.add('approve_content');
                this.permissions.add('bulk_operations');
                break;

            case 'content_creator':
                this.permissions.add('create_questions');
                this.permissions.add('edit_own_questions');
                break;

            default:
                // Regular users have no admin permissions
                break;
        }

        console.log(`👤 Permissions loaded for ${this.currentUser.role}:`, Array.from(this.permissions));
    }

    setupEventListeners() {
        // Listen for permission changes
        document.addEventListener('userRoleChanged', (event) => {
            this.currentUser = event.detail.user;
            this.loadPermissions();
        });
    }

    // ===================================
    // ADMIN INTERFACE
    // ===================================

    createAdminInterface() {
        if (!this.hasPermission('create_questions')) {
            console.warn('⚠️ User does not have admin permissions');
            return null;
        }

        const adminContainer = document.createElement('div');
        adminContainer.className = 'cms-admin-interface';
        adminContainer.innerHTML = `
            <div class="cms-header">
                <h2>📋 Content Management System</h2>
                <div class="cms-user-info">
                    <span>Welcome, ${this.currentUser?.name || 'Admin'}</span>
                    <span class="cms-role-badge">${this.currentUser?.role || 'admin'}</span>
                </div>
            </div>

            <div class="cms-navigation">
                <button class="cms-nav-btn active" data-section="questions">❓ Questions</button>
                <button class="cms-nav-btn" data-section="tracks">📚 Tracks</button>
                <button class="cms-nav-btn" data-section="categories">🏷️ Categories</button>
                <button class="cms-nav-btn" data-section="users">👥 Users</button>
                <button class="cms-nav-btn" data-section="analytics">📊 Analytics</button>
                <button class="cms-nav-btn" data-section="approvals">✅ Approvals</button>
            </div>

            <div class="cms-toolbar">
                <div class="cms-toolbar-left">
                    <button id="cmsNewContent" class="btn-primary">➕ New Content</button>
                    <button id="cmsBulkImport" class="btn-secondary">📥 Bulk Import</button>
                    <button id="cmsBulkExport" class="btn-secondary">📤 Bulk Export</button>
                </div>
                <div class="cms-toolbar-right">
                    <input type="search" id="cmsSearch" placeholder="🔍 Search content..." class="cms-search">
                    <select id="cmsFilter" class="cms-filter">
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </div>

            <div id="cmsContent" class="cms-content">
                <!-- Content sections will be loaded here -->
            </div>

            <div id="cmsModal" class="cms-modal" style="display: none;">
                <div class="cms-modal-content">
                    <span class="cms-modal-close">&times;</span>
                    <div id="cmsModalBody">
                        <!-- Modal content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        this.setupAdminEventListeners(adminContainer);
        this.loadQuestionsSection(); // Load default section

        return adminContainer;
    }

    setupAdminEventListeners(container) {
        // Navigation
        container.querySelectorAll('.cms-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.cms-nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadSection(e.target.dataset.section);
            });
        });

        // Toolbar actions
        const newContentBtn = container.querySelector('#cmsNewContent');
        if (newContentBtn) {
            newContentBtn.addEventListener('click', () => this.showNewContentModal());
        }

        const bulkImportBtn = container.querySelector('#cmsBulkImport');
        if (bulkImportBtn) {
            bulkImportBtn.addEventListener('click', () => this.showBulkImportModal());
        }

        const bulkExportBtn = container.querySelector('#cmsBulkExport');
        if (bulkExportBtn) {
            bulkExportBtn.addEventListener('click', () => this.performBulkExport());
        }

        // Search and filter
        const searchInput = container.querySelector('#cmsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filterContent(e.target.value);
            }, 300));
        }

        const filterSelect = container.querySelector('#cmsFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }

        // Modal close
        const modalClose = container.querySelector('.cms-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                container.querySelector('#cmsModal').style.display = 'none';
            });
        }
    }

    // ===================================
    // CONTENT SECTIONS
    // ===================================

    loadSection(section) {
        const contentContainer = document.querySelector('#cmsContent');
        if (!contentContainer) return;

        switch (section) {
            case 'questions':
                this.loadQuestionsSection();
                break;
            case 'tracks':
                this.loadTracksSection();
                break;
            case 'categories':
                this.loadCategoriesSection();
                break;
            case 'users':
                this.loadUsersSection();
                break;
            case 'analytics':
                this.loadAnalyticsSection();
                break;
            case 'approvals':
                this.loadApprovalsSection();
                break;
        }
    }

    async loadQuestionsSection() {
        const contentContainer = document.querySelector('#cmsContent');
        if (!contentContainer) return;

        try {
            // Show loading
            contentContainer.innerHTML = '<div class="cms-loading">Loading questions...</div>';

            // Fetch questions
            const questions = await this.fetchQuestions();

            contentContainer.innerHTML = `
                <div class="cms-questions-section">
                    <div class="cms-section-header">
                        <h3>❓ Questions Management</h3>
                        <div class="cms-stats">
                            <span class="cms-stat">Total: ${questions.length}</span>
                            <span class="cms-stat">Published: ${questions.filter(q => q.status === 'published').length}</span>
                            <span class="cms-stat">Draft: ${questions.filter(q => q.status === 'draft').length}</span>
                        </div>
                    </div>

                    <div class="cms-questions-list">
                        ${this.renderQuestionsList(questions)}
                    </div>
                </div>
            `;

            this.setupQuestionEventListeners();

        } catch (error) {
            console.error('❌ Failed to load questions section:', error);
            contentContainer.innerHTML = '<div class="cms-error">Failed to load questions</div>';
        }
    }

    renderQuestionsList(questions) {
        return questions.map(question => `
            <div class="cms-question-item" data-id="${question.id}">
                <div class="cms-question-header">
                    <span class="cms-question-category">${question.category}</span>
                    <span class="cms-question-difficulty cms-difficulty-${question.difficulty?.toLowerCase()}">${question.difficulty}</span>
                    <span class="cms-question-status cms-status-${question.status || 'draft'}">${question.status || 'draft'}</span>
                </div>

                <div class="cms-question-content">
                    <h4>${question.question?.substring(0, 100)}...</h4>
                    <p class="cms-question-meta">
                        Created: ${new Date(question.createdAt || Date.now()).toLocaleDateString()}
                        ${question.author ? `| Author: ${question.author}` : ''}
                        ${question.tags ? `| Tags: ${question.tags.join(', ')}` : ''}
                    </p>
                </div>

                <div class="cms-question-actions">
                    <button class="cms-btn cms-btn-edit" data-action="edit" data-id="${question.id}">✏️ Edit</button>
                    <button class="cms-btn cms-btn-duplicate" data-action="duplicate" data-id="${question.id}">📋 Duplicate</button>
                    ${this.hasPermission('approve_content') ?
                        `<button class="cms-btn cms-btn-approve" data-action="approve" data-id="${question.id}">✅ Approve</button>` : ''}
                    <button class="cms-btn cms-btn-delete" data-action="delete" data-id="${question.id}">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    setupQuestionEventListeners() {
        document.querySelectorAll('.cms-question-item .cms-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const questionId = e.target.dataset.id;
                this.handleQuestionAction(action, questionId);
            });
        });
    }

    async handleQuestionAction(action, questionId) {
        switch (action) {
            case 'edit':
                await this.editQuestion(questionId);
                break;
            case 'duplicate':
                await this.duplicateQuestion(questionId);
                break;
            case 'approve':
                await this.approveQuestion(questionId);
                break;
            case 'delete':
                await this.deleteQuestion(questionId);
                break;
        }
    }

    // ===================================
    // QUESTION MANAGEMENT
    // ===================================

    async editQuestion(questionId) {
        try {
            const question = await this.fetchQuestionById(questionId);
            this.showQuestionEditModal(question);
        } catch (error) {
            console.error('❌ Failed to load question for editing:', error);
        }
    }

    showQuestionEditModal(question = null) {
        const modal = document.querySelector('#cmsModal');
        const modalBody = document.querySelector('#cmsModalBody');

        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="cms-question-editor">
                <h3>${question ? '✏️ Edit Question' : '➕ New Question'}</h3>

                <form id="cmsQuestionForm" class="cms-form">
                    <div class="cms-form-group">
                        <label for="questionText">Question Text *</label>
                        <textarea id="questionText" required rows="4" placeholder="Enter the interview question...">${question?.question || ''}</textarea>
                    </div>

                    <div class="cms-form-row">
                        <div class="cms-form-group">
                            <label for="questionCategory">Category *</label>
                            <select id="questionCategory" required>
                                <option value="">Select Category</option>
                                <option value="java" ${question?.category === 'java' ? 'selected' : ''}>☕ Java</option>
                                <option value="selenium" ${question?.category === 'selenium' ? 'selected' : ''}>🌐 Selenium</option>
                                <option value="api-testing" ${question?.category === 'api-testing' ? 'selected' : ''}>🔌 API Testing</option>
                                <option value="testng" ${question?.category === 'testng' ? 'selected' : ''}>🧪 TestNG</option>
                                <option value="framework" ${question?.category === 'framework' ? 'selected' : ''}>🏗️ Framework</option>
                                <option value="leadership" ${question?.category === 'leadership' ? 'selected' : ''}>👔 Leadership</option>
                            </select>
                        </div>

                        <div class="cms-form-group">
                            <label for="questionDifficulty">Difficulty *</label>
                            <select id="questionDifficulty" required>
                                <option value="">Select Difficulty</option>
                                <option value="Basic" ${question?.difficulty === 'Basic' ? 'selected' : ''}>Basic</option>
                                <option value="Medium" ${question?.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                                <option value="Hard" ${question?.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
                            </select>
                        </div>
                    </div>

                    <div class="cms-form-group">
                        <label for="questionAnswer">Answer *</label>
                        <textarea id="questionAnswer" required rows="6" placeholder="Enter the detailed answer...">${question?.answer || ''}</textarea>
                    </div>

                    <div class="cms-form-group">
                        <label for="questionCode">Code Example (Optional)</label>
                        <textarea id="questionCode" rows="8" placeholder="Enter code example if applicable...">${question?.code || ''}</textarea>
                    </div>

                    <div class="cms-form-group">
                        <label for="questionTags">Tags</label>
                        <input type="text" id="questionTags" placeholder="Enter tags separated by commas" value="${question?.tags?.join(', ') || ''}">
                    </div>

                    <div class="cms-form-row">
                        <div class="cms-form-group">
                            <label for="questionCompanies">Companies</label>
                            <input type="text" id="questionCompanies" placeholder="Companies that asked this question" value="${question?.companies?.join(', ') || ''}">
                        </div>

                        <div class="cms-form-group">
                            <label for="questionExperience">Experience Levels</label>
                            <select id="questionExperience" multiple>
                                <option value="junior" ${question?.experienceLevels?.includes('junior') ? 'selected' : ''}>Junior (0-3 years)</option>
                                <option value="mid" ${question?.experienceLevels?.includes('mid') ? 'selected' : ''}>Mid-Level (4-7 years)</option>
                                <option value="senior" ${question?.experienceLevels?.includes('senior') ? 'selected' : ''}>Senior (8+ years)</option>
                            </select>
                        </div>
                    </div>

                    <div class="cms-form-group">
                        <label for="questionFollowUp">Follow-up Questions</label>
                        <textarea id="questionFollowUp" rows="3" placeholder="Enter follow-up questions, one per line">${question?.followUpQuestions?.join('\n') || ''}</textarea>
                    </div>

                    <div class="cms-form-actions">
                        <button type="button" id="cmsSaveDraft" class="btn-secondary">💾 Save as Draft</button>
                        <button type="button" id="cmsSubmitReview" class="btn-primary">📋 Submit for Review</button>
                        ${this.hasPermission('approve_content') ?
                            '<button type="button" id="cmsPublishNow" class="btn-success">🚀 Publish Now</button>' : ''}
                        <button type="button" id="cmsCancelEdit" class="btn-cancel">❌ Cancel</button>
                    </div>
                </form>
            </div>
        `;

        // Setup form event listeners
        this.setupQuestionFormListeners(question);

        modal.style.display = 'block';
    }

    setupQuestionFormListeners(existingQuestion) {
        const saveDraftBtn = document.querySelector('#cmsSaveDraft');
        const submitReviewBtn = document.querySelector('#cmsSubmitReview');
        const publishNowBtn = document.querySelector('#cmsPublishNow');
        const cancelBtn = document.querySelector('#cmsCancelEdit');

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.saveQuestion('draft', existingQuestion?.id);
            });
        }

        if (submitReviewBtn) {
            submitReviewBtn.addEventListener('click', () => {
                this.saveQuestion('review', existingQuestion?.id);
            });
        }

        if (publishNowBtn) {
            publishNowBtn.addEventListener('click', () => {
                this.saveQuestion('published', existingQuestion?.id);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.querySelector('#cmsModal').style.display = 'none';
            });
        }
    }

    async saveQuestion(status, questionId = null) {
        try {
            const formData = this.collectQuestionFormData();
            formData.status = status;
            formData.lastModified = new Date().toISOString();
            formData.author = this.currentUser?.name || 'Unknown';

            if (questionId) {
                // Update existing question
                formData.id = questionId;
                await this.updateQuestion(formData);
                console.log(`✅ Question updated with status: ${status}`);
            } else {
                // Create new question
                formData.id = this.generateQuestionId();
                formData.createdAt = new Date().toISOString();
                await this.createQuestion(formData);
                console.log(`✅ Question created with status: ${status}`);
            }

            // Track analytics
            if (this.analyticsManager) {
                this.analyticsManager.trackEvent('cms_question_saved', {
                    questionId: formData.id,
                    status,
                    action: questionId ? 'update' : 'create'
                });
            }

            // Close modal and refresh
            document.querySelector('#cmsModal').style.display = 'none';
            this.loadQuestionsSection();

        } catch (error) {
            console.error('❌ Failed to save question:', error);
            this.showNotification('Failed to save question', 'error');
        }
    }

    collectQuestionFormData() {
        return {
            question: document.querySelector('#questionText').value.trim(),
            category: document.querySelector('#questionCategory').value,
            difficulty: document.querySelector('#questionDifficulty').value,
            answer: document.querySelector('#questionAnswer').value.trim(),
            code: document.querySelector('#questionCode').value.trim() || null,
            tags: document.querySelector('#questionTags').value
                .split(',').map(tag => tag.trim()).filter(Boolean),
            companies: document.querySelector('#questionCompanies').value
                .split(',').map(company => company.trim()).filter(Boolean),
            experienceLevels: Array.from(document.querySelector('#questionExperience').selectedOptions)
                .map(option => option.value),
            followUpQuestions: document.querySelector('#questionFollowUp').value
                .split('\n').map(q => q.trim()).filter(Boolean)
        };
    }

    // ===================================
    // BULK OPERATIONS
    // ===================================

    showBulkImportModal() {
        if (!this.hasPermission('bulk_operations')) {
            this.showNotification('You do not have permission for bulk operations', 'error');
            return;
        }

        const modal = document.querySelector('#cmsModal');
        const modalBody = document.querySelector('#cmsModalBody');

        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="cms-bulk-import">
                <h3>📥 Bulk Import Questions</h3>

                <div class="cms-import-options">
                    <div class="cms-import-method">
                        <h4>Import Method</h4>
                        <label class="cms-radio-option">
                            <input type="radio" name="importMethod" value="json" checked>
                            JSON Format
                        </label>
                        <label class="cms-radio-option">
                            <input type="radio" name="importMethod" value="csv">
                            CSV Format
                        </label>
                        <label class="cms-radio-option">
                            <input type="radio" name="importMethod" value="excel">
                            Excel Format
                        </label>
                    </div>

                    <div class="cms-import-settings">
                        <h4>Import Settings</h4>
                        <label class="cms-checkbox-option">
                            <input type="checkbox" id="skipDuplicates" checked>
                            Skip duplicate questions
                        </label>
                        <label class="cms-checkbox-option">
                            <input type="checkbox" id="validateBeforeImport" checked>
                            Validate before import
                        </label>
                        <label class="cms-checkbox-option">
                            <input type="checkbox" id="createBackup">
                            Create backup before import
                        </label>
                    </div>
                </div>

                <div class="cms-file-upload">
                    <input type="file" id="cmsImportFile" accept=".json,.csv,.xlsx,.xls" class="cms-file-input">
                    <label for="cmsImportFile" class="cms-file-label">
                        📁 Choose File or Drag & Drop Here
                    </label>
                    <div class="cms-file-info" id="cmsFileInfo" style="display: none;">
                        <span id="cmsFileName"></span>
                        <span id="cmsFileSize"></span>
                    </div>
                </div>

                <div class="cms-preview-area" id="cmsImportPreview" style="display: none;">
                    <h4>Preview (First 5 items)</h4>
                    <div id="cmsPreviewContent"></div>
                </div>

                <div class="cms-form-actions">
                    <button type="button" id="cmsPreviewImport" class="btn-secondary" disabled>👁️ Preview</button>
                    <button type="button" id="cmsStartImport" class="btn-primary" disabled>📥 Start Import</button>
                    <button type="button" id="cmsCancelImport" class="btn-cancel">❌ Cancel</button>
                </div>

                <div class="cms-progress" id="cmsImportProgress" style="display: none;">
                    <div class="cms-progress-bar">
                        <div class="cms-progress-fill" id="cmsProgressFill"></div>
                    </div>
                    <div class="cms-progress-text" id="cmsProgressText">Processing...</div>
                </div>
            </div>
        `;

        this.setupBulkImportListeners();
        modal.style.display = 'block';
    }

    setupBulkImportListeners() {
        const fileInput = document.querySelector('#cmsImportFile');
        const previewBtn = document.querySelector('#cmsPreviewImport');
        const importBtn = document.querySelector('#cmsStartImport');
        const cancelBtn = document.querySelector('#cmsCancelImport');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleImportFileSelect(e.target.files[0]);
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewImportFile();
            });
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.startBulkImport();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.querySelector('#cmsModal').style.display = 'none';
            });
        }
    }

    async handleImportFileSelect(file) {
        if (!file) return;

        const fileInfo = document.querySelector('#cmsFileInfo');
        const fileName = document.querySelector('#cmsFileName');
        const fileSize = document.querySelector('#cmsFileSize');
        const previewBtn = document.querySelector('#cmsPreviewImport');

        if (fileInfo && fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            fileInfo.style.display = 'block';
        }

        if (previewBtn) {
            previewBtn.disabled = false;
        }
    }

    async previewImportFile() {
        const fileInput = document.querySelector('#cmsImportFile');
        const file = fileInput?.files[0];

        if (!file) return;

        try {
            const content = await this.readImportFile(file);
            const preview = this.generateImportPreview(content);

            const previewArea = document.querySelector('#cmsImportPreview');
            const previewContent = document.querySelector('#cmsPreviewContent');
            const importBtn = document.querySelector('#cmsStartImport');

            if (previewArea && previewContent) {
                previewContent.innerHTML = preview;
                previewArea.style.display = 'block';
            }

            if (importBtn) {
                importBtn.disabled = false;
            }

        } catch (error) {
            console.error('❌ Failed to preview import file:', error);
            this.showNotification('Failed to preview file', 'error');
        }
    }

    async performBulkExport() {
        if (!this.hasPermission('bulk_operations')) {
            this.showNotification('You do not have permission for bulk operations', 'error');
            return;
        }

        try {
            const questions = await this.fetchQuestions();
            const exportData = {
                exportDate: new Date().toISOString(),
                totalQuestions: questions.length,
                exportedBy: this.currentUser?.name || 'Unknown',
                questions: questions
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interview-questions-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Questions exported successfully', 'success');

            // Track analytics
            if (this.analyticsManager) {
                this.analyticsManager.trackEvent('cms_bulk_export', {
                    totalQuestions: questions.length,
                    format: 'json'
                });
            }

        } catch (error) {
            console.error('❌ Failed to export questions:', error);
            this.showNotification('Failed to export questions', 'error');
        }
    }

    // ===================================
    // API INTEGRATION
    // ===================================

    async fetchQuestions() {
        try {
            if (this.apiClient && this.apiClient.getQuestions) {
                const response = await this.apiClient.getQuestions();
                return response.success ? response.data : [];
            }

            // Fallback: return mock data for demo
            return this.generateMockQuestions();

        } catch (error) {
            console.error('❌ Failed to fetch questions:', error);
            return [];
        }
    }

    async fetchQuestionById(id) {
        try {
            if (this.apiClient && this.apiClient.getQuestion) {
                const response = await this.apiClient.getQuestion(id);
                return response.success ? response.data : null;
            }

            // Fallback: return mock question
            return this.generateMockQuestion(id);

        } catch (error) {
            console.error('❌ Failed to fetch question:', error);
            return null;
        }
    }

    async createQuestion(questionData) {
        try {
            if (this.apiClient && this.apiClient.createQuestion) {
                const response = await this.apiClient.createQuestion(questionData);
                return response.success ? response.data : null;
            }

            // Fallback: simulate success
            console.log('🔧 Demo mode: Question would be created:', questionData);
            return questionData;

        } catch (error) {
            console.error('❌ Failed to create question:', error);
            throw error;
        }
    }

    async updateQuestion(questionData) {
        try {
            if (this.apiClient && this.apiClient.updateQuestion) {
                const response = await this.apiClient.updateQuestion(questionData.id, questionData);
                return response.success ? response.data : null;
            }

            // Fallback: simulate success
            console.log('🔧 Demo mode: Question would be updated:', questionData);
            return questionData;

        } catch (error) {
            console.error('❌ Failed to update question:', error);
            throw error;
        }
    }

    async deleteQuestion(questionId) {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            if (this.apiClient && this.apiClient.deleteQuestion) {
                const response = await this.apiClient.deleteQuestion(questionId);
                if (response.success) {
                    this.showNotification('Question deleted successfully', 'success');
                    this.loadQuestionsSection();
                }
            } else {
                // Fallback: simulate success
                console.log('🔧 Demo mode: Question would be deleted:', questionId);
                this.showNotification('Question deleted successfully', 'success');
                this.loadQuestionsSection();
            }

        } catch (error) {
            console.error('❌ Failed to delete question:', error);
            this.showNotification('Failed to delete question', 'error');
        }
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    hasPermission(permission) {
        return this.permissions.has(permission);
    }

    generateQuestionId() {
        return 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cms-notification cms-notification-${type}`;
        notification.innerHTML = `
            <span class="cms-notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="cms-notification-text">${message}</span>
            <button class="cms-notification-close">&times;</button>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Setup close handler
        notification.querySelector('.cms-notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    generateMockQuestions() {
        return [
            {
                id: 'q_1',
                question: 'What is the difference between ArrayList and LinkedList in Java?',
                answer: 'ArrayList uses a dynamic array internally while LinkedList uses a doubly-linked list...',
                category: 'java',
                difficulty: 'Medium',
                status: 'published',
                tags: ['collections', 'data-structures'],
                companies: ['Google', 'Microsoft'],
                experienceLevels: ['mid', 'senior'],
                createdAt: new Date().toISOString(),
                author: 'Demo User'
            },
            {
                id: 'q_2',
                question: 'How do you handle dynamic elements in Selenium WebDriver?',
                answer: 'Dynamic elements can be handled using WebDriverWait with expected conditions...',
                category: 'selenium',
                difficulty: 'Hard',
                status: 'draft',
                tags: ['webdriver', 'dynamic-elements'],
                companies: ['Amazon', 'Facebook'],
                experienceLevels: ['mid', 'senior'],
                createdAt: new Date().toISOString(),
                author: 'Demo User'
            }
        ];
    }

    generateMockQuestion(id) {
        return {
            id,
            question: 'Sample question for editing',
            answer: 'Sample answer content',
            category: 'java',
            difficulty: 'Medium',
            status: 'draft',
            tags: ['sample'],
            companies: ['Sample Company'],
            experienceLevels: ['mid'],
            createdAt: new Date().toISOString(),
            author: 'Demo User'
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ContentManagementSystem = ContentManagementSystem;
}