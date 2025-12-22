// Social Features System
// Groups, sharing, and collaborative learning
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class SocialFeaturesSystem {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.currentUser = null;
        this.userGroups = [];
        this.socialConnections = new Map();
        this.sharedContent = new Map();
        this.collaborativeStudySessions = new Map();

        this.notifications = [];
        this.socialStats = {
            groupsJoined: 0,
            contentShared: 0,
            helpGiven: 0,
            studyPartnerships: 0
        };

        this.initialize();
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    async initialize() {
        await this.loadCurrentUser();
        await this.loadUserGroups();
        await this.loadSocialConnections();
        this.setupEventListeners();

        console.log('👥 Social Features System initialized');
    }

    async loadCurrentUser() {
        try {
            if (this.apiClient && this.apiClient.getCurrentUser) {
                const response = await this.apiClient.getCurrentUser();
                this.currentUser = response.success ? response.data : null;
            }
        } catch (error) {
            console.error('❌ Failed to load current user for social features:', error);
        }
    }

    async loadUserGroups() {
        try {
            if (this.currentUser) {
                const groups = await this.fetchUserGroups(this.currentUser.id);
                this.userGroups = groups || [];
                console.log(`👥 Loaded ${this.userGroups.length} user groups`);
            }
        } catch (error) {
            console.error('❌ Failed to load user groups:', error);
        }
    }

    async loadSocialConnections() {
        try {
            if (this.currentUser) {
                const connections = await this.fetchSocialConnections(this.currentUser.id);
                this.socialConnections = new Map(connections || []);
                console.log(`🤝 Loaded ${this.socialConnections.size} social connections`);
            }
        } catch (error) {
            console.error('❌ Failed to load social connections:', error);
        }
    }

    setupEventListeners() {
        // Listen for social events
        document.addEventListener('socialFeatures.shareContent', (event) => {
            this.handleContentShare(event.detail);
        });

        document.addEventListener('socialFeatures.joinGroup', (event) => {
            this.handleGroupJoin(event.detail);
        });

        document.addEventListener('socialFeatures.startCollaboration', (event) => {
            this.handleCollaborationStart(event.detail);
        });
    }

    // ===================================
    // GROUP MANAGEMENT
    // ===================================

    createSocialInterface() {
        const socialContainer = document.createElement('div');
        socialContainer.className = 'social-features-interface';
        socialContainer.innerHTML = `
            <div class="social-header">
                <h2>👥 Social Learning Hub</h2>
                <div class="social-user-info">
                    <span class="social-username">${this.currentUser?.name || 'Anonymous'}</span>
                    <span class="social-level">${this.calculateUserLevel()}</span>
                </div>
            </div>

            <div class="social-navigation">
                <button class="social-nav-btn active" data-section="groups">🏘️ Study Groups</button>
                <button class="social-nav-btn" data-section="leaderboard">🏆 Leaderboards</button>
                <button class="social-nav-btn" data-section="shared">📚 Shared Content</button>
                <button class="social-nav-btn" data-section="collaboration">🤝 Study Together</button>
                <button class="social-nav-btn" data-section="achievements">🎖️ Achievements</button>
            </div>

            <div class="social-quick-actions">
                <button id="socialCreateGroup" class="btn-primary">➕ Create Group</button>
                <button id="socialShareProgress" class="btn-secondary">📊 Share Progress</button>
                <button id="socialFindPartner" class="btn-secondary">👥 Find Study Partner</button>
            </div>

            <div id="socialContent" class="social-content">
                <!-- Social content sections will be loaded here -->
            </div>

            <div id="socialModal" class="social-modal" style="display: none;">
                <div class="social-modal-content">
                    <span class="social-modal-close">&times;</span>
                    <div id="socialModalBody">
                        <!-- Modal content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        this.setupSocialEventListeners(socialContainer);
        this.loadGroupsSection(); // Load default section

        return socialContainer;
    }

    setupSocialEventListeners(container) {
        // Navigation
        container.querySelectorAll('.social-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.social-nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadSocialSection(e.target.dataset.section);
            });
        });

        // Quick actions
        const createGroupBtn = container.querySelector('#socialCreateGroup');
        if (createGroupBtn) {
            createGroupBtn.addEventListener('click', () => this.showCreateGroupModal());
        }

        const shareProgressBtn = container.querySelector('#socialShareProgress');
        if (shareProgressBtn) {
            shareProgressBtn.addEventListener('click', () => this.shareUserProgress());
        }

        const findPartnerBtn = container.querySelector('#socialFindPartner');
        if (findPartnerBtn) {
            findPartnerBtn.addEventListener('click', () => this.showFindPartnerModal());
        }

        // Modal close
        const modalClose = container.querySelector('.social-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                container.querySelector('#socialModal').style.display = 'none';
            });
        }
    }

    loadSocialSection(section) {
        const contentContainer = document.querySelector('#socialContent');
        if (!contentContainer) return;

        switch (section) {
            case 'groups':
                this.loadGroupsSection();
                break;
            case 'leaderboard':
                this.loadLeaderboardSection();
                break;
            case 'shared':
                this.loadSharedContentSection();
                break;
            case 'collaboration':
                this.loadCollaborationSection();
                break;
            case 'achievements':
                this.loadAchievementsSection();
                break;
        }
    }

    async loadGroupsSection() {
        const contentContainer = document.querySelector('#socialContent');
        if (!contentContainer) return;

        try {
            contentContainer.innerHTML = '<div class="social-loading">Loading study groups...</div>';

            // Get available groups and user's groups
            const allGroups = await this.fetchAllGroups();
            const userGroups = this.userGroups;

            contentContainer.innerHTML = `
                <div class="social-groups-section">
                    <div class="social-section-header">
                        <h3>🏘️ Study Groups</h3>
                        <div class="social-stats">
                            <span class="social-stat">Joined: ${userGroups.length}</span>
                            <span class="social-stat">Available: ${allGroups.length}</span>
                        </div>
                    </div>

                    <div class="social-groups-tabs">
                        <button class="social-tab-btn active" data-tab="my-groups">My Groups</button>
                        <button class="social-tab-btn" data-tab="discover">Discover</button>
                        <button class="social-tab-btn" data-tab="recommended">Recommended</button>
                    </div>

                    <div class="social-tab-content">
                        <div id="socialMyGroups" class="social-tab-panel active">
                            ${this.renderUserGroups(userGroups)}
                        </div>

                        <div id="socialDiscover" class="social-tab-panel">
                            ${this.renderAllGroups(allGroups)}
                        </div>

                        <div id="socialRecommended" class="social-tab-panel">
                            ${this.renderRecommendedGroups(allGroups)}
                        </div>
                    </div>
                </div>
            `;

            this.setupGroupsEventListeners();

        } catch (error) {
            console.error('❌ Failed to load groups section:', error);
            contentContainer.innerHTML = '<div class="social-error">Failed to load groups</div>';
        }
    }

    renderUserGroups(groups) {
        if (groups.length === 0) {
            return `
                <div class="social-empty-state">
                    <h4>No groups joined yet</h4>
                    <p>Join study groups to collaborate with other learners!</p>
                    <button class="btn-primary" onclick="document.querySelector('[data-tab=discover]').click()">
                        Discover Groups
                    </button>
                </div>
            `;
        }

        return groups.map(group => `
            <div class="social-group-card user-group" data-id="${group.id}">
                <div class="group-header">
                    <div class="group-info">
                        <h4>${group.name}</h4>
                        <span class="group-category">${group.category}</span>
                        <span class="group-privacy ${group.isPrivate ? 'private' : 'public'}">
                            ${group.isPrivate ? '🔒 Private' : '🌐 Public'}
                        </span>
                    </div>
                    <div class="group-stats">
                        <span class="group-members">👥 ${group.memberCount}</span>
                        <span class="group-activity">📈 ${group.activityLevel}</span>
                    </div>
                </div>

                <div class="group-description">
                    <p>${group.description}</p>
                </div>

                <div class="group-recent-activity">
                    <h5>Recent Activity</h5>
                    ${this.renderGroupActivity(group.recentActivity)}
                </div>

                <div class="group-actions">
                    <button class="social-btn social-btn-primary" data-action="open" data-id="${group.id}">
                        💬 Open Group
                    </button>
                    <button class="social-btn social-btn-secondary" data-action="share" data-id="${group.id}">
                        📤 Share Content
                    </button>
                    <button class="social-btn social-btn-secondary" data-action="leave" data-id="${group.id}">
                        🚪 Leave Group
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAllGroups(groups) {
        return `
            <div class="social-groups-filter">
                <input type="search" id="groupSearch" placeholder="🔍 Search groups..." class="social-search">
                <select id="categoryFilter" class="social-filter">
                    <option value="all">All Categories</option>
                    <option value="java">☕ Java</option>
                    <option value="selenium">🌐 Selenium</option>
                    <option value="api-testing">🔌 API Testing</option>
                    <option value="general">💬 General Discussion</option>
                </select>
                <select id="levelFilter" class="social-filter">
                    <option value="all">All Levels</option>
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">🌿 Intermediate</option>
                    <option value="advanced">🌳 Advanced</option>
                </select>
            </div>

            <div class="social-groups-list">
                ${groups.map(group => this.renderDiscoverGroup(group)).join('')}
            </div>
        `;
    }

    renderDiscoverGroup(group) {
        const isJoined = this.userGroups.some(ug => ug.id === group.id);

        return `
            <div class="social-group-card discover-group" data-id="${group.id}">
                <div class="group-header">
                    <div class="group-info">
                        <h4>${group.name}</h4>
                        <div class="group-tags">
                            <span class="group-category">${group.category}</span>
                            <span class="group-level">${group.level}</span>
                            <span class="group-privacy ${group.isPrivate ? 'private' : 'public'}">
                                ${group.isPrivate ? '🔒' : '🌐'}
                            </span>
                        </div>
                    </div>
                    <div class="group-stats">
                        <span class="group-members">👥 ${group.memberCount}</span>
                        <span class="group-activity">📈 ${group.activityLevel}</span>
                        <span class="group-rating">⭐ ${group.rating.toFixed(1)}</span>
                    </div>
                </div>

                <div class="group-description">
                    <p>${group.description}</p>
                </div>

                <div class="group-highlights">
                    <div class="group-highlight">
                        <strong>Study Focus:</strong> ${group.studyFocus}
                    </div>
                    <div class="group-highlight">
                        <strong>Meeting Schedule:</strong> ${group.meetingSchedule}
                    </div>
                    <div class="group-highlight">
                        <strong>Created by:</strong> ${group.creator.name} (${group.creator.level})
                    </div>
                </div>

                <div class="group-actions">
                    ${isJoined ?
                        `<button class="social-btn social-btn-success" disabled>✅ Joined</button>` :
                        `<button class="social-btn social-btn-primary" data-action="join" data-id="${group.id}">
                            ${group.isPrivate ? '📝 Request to Join' : '➕ Join Group'}
                         </button>`
                    }
                    <button class="social-btn social-btn-secondary" data-action="preview" data-id="${group.id}">
                        👁️ Preview
                    </button>
                </div>
            </div>
        `;
    }

    // ===================================
    // CONTENT SHARING
    // ===================================

    async shareUserProgress() {
        try {
            const progressData = await this.collectUserProgressForSharing();
            this.showShareProgressModal(progressData);
        } catch (error) {
            console.error('❌ Failed to prepare progress for sharing:', error);
        }
    }

    showShareProgressModal(progressData) {
        const modal = document.querySelector('#socialModal');
        const modalBody = document.querySelector('#socialModalBody');

        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="social-share-progress">
                <h3>📊 Share Your Progress</h3>

                <div class="progress-preview">
                    <h4>Your Learning Journey</h4>
                    <div class="progress-stats">
                        <div class="stat-card">
                            <span class="stat-number">${progressData.questionsStudied}</span>
                            <span class="stat-label">Questions Studied</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${progressData.currentStreak}</span>
                            <span class="stat-label">Day Streak</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${progressData.categoriesMastered}</span>
                            <span class="stat-label">Categories Explored</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${progressData.studyHours}h</span>
                            <span class="stat-label">Study Time</span>
                        </div>
                    </div>

                    <div class="progress-achievements">
                        <h5>Recent Achievements</h5>
                        <div class="achievements-list">
                            ${progressData.recentAchievements.map(achievement => `
                                <span class="achievement-badge">${achievement.icon} ${achievement.title}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="share-options">
                    <h4>Share Options</h4>

                    <div class="share-destination">
                        <h5>Where to share:</h5>
                        <div class="share-targets">
                            <label class="share-target">
                                <input type="checkbox" name="shareTarget" value="groups" checked>
                                <span class="target-icon">🏘️</span>
                                <span class="target-name">My Study Groups</span>
                            </label>
                            <label class="share-target">
                                <input type="checkbox" name="shareTarget" value="leaderboard">
                                <span class="target-icon">🏆</span>
                                <span class="target-name">Global Leaderboard</span>
                            </label>
                            <label class="share-target">
                                <input type="checkbox" name="shareTarget" value="social">
                                <span class="target-icon">📱</span>
                                <span class="target-name">Social Media</span>
                            </label>
                        </div>
                    </div>

                    <div class="share-customization">
                        <h5>Customize message:</h5>
                        <textarea id="shareMessage" rows="3" placeholder="Add a personal message...">
Just hit ${progressData.questionsStudied} questions studied! 🎯 Loving this learning journey. Who wants to study together? #InterviewPrep
                        </textarea>
                    </div>

                    <div class="share-privacy">
                        <h5>Privacy:</h5>
                        <label class="privacy-option">
                            <input type="radio" name="sharePrivacy" value="public" checked>
                            <span>🌐 Public - Everyone can see</span>
                        </label>
                        <label class="privacy-option">
                            <input type="radio" name="sharePrivacy" value="groups">
                            <span>👥 Groups only - Only group members</span>
                        </label>
                        <label class="privacy-option">
                            <input type="radio" name="sharePrivacy" value="connections">
                            <span>🤝 Connections - Only people I follow</span>
                        </label>
                    </div>
                </div>

                <div class="share-actions">
                    <button type="button" id="shareProgressConfirm" class="btn-primary">📤 Share Progress</button>
                    <button type="button" id="shareProgressCancel" class="btn-cancel">❌ Cancel</button>
                </div>
            </div>
        `;

        // Setup share event listeners
        this.setupShareEventListeners(progressData);

        modal.style.display = 'block';
    }

    setupShareEventListeners(progressData) {
        const confirmBtn = document.querySelector('#shareProgressConfirm');
        const cancelBtn = document.querySelector('#shareProgressCancel');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.executeProgressShare(progressData);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.querySelector('#socialModal').style.display = 'none';
            });
        }
    }

    async executeProgressShare(progressData) {
        try {
            const shareTargets = Array.from(document.querySelectorAll('input[name="shareTarget"]:checked'))
                .map(checkbox => checkbox.value);

            const shareMessage = document.querySelector('#shareMessage').value;
            const sharePrivacy = document.querySelector('input[name="sharePrivacy"]:checked').value;

            const shareData = {
                type: 'progress',
                content: progressData,
                message: shareMessage,
                privacy: sharePrivacy,
                targets: shareTargets,
                timestamp: new Date().toISOString(),
                author: this.currentUser
            };

            // Execute sharing based on targets
            for (const target of shareTargets) {
                await this.shareToTarget(target, shareData);
            }

            this.showNotification('Progress shared successfully! 🎉', 'success');
            document.querySelector('#socialModal').style.display = 'none';

        } catch (error) {
            console.error('❌ Failed to share progress:', error);
            this.showNotification('Failed to share progress', 'error');
        }
    }

    // ===================================
    // COLLABORATIVE STUDY SESSIONS
    // ===================================

    showFindPartnerModal() {
        const modal = document.querySelector('#socialModal');
        const modalBody = document.querySelector('#socialModalBody');

        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="social-find-partner">
                <h3>👥 Find Study Partner</h3>

                <div class="partner-preferences">
                    <h4>Study Preferences</h4>

                    <div class="preference-group">
                        <label>Study Focus:</label>
                        <select id="partnerStudyFocus" class="social-select">
                            <option value="any">Any Topic</option>
                            <option value="java">☕ Java</option>
                            <option value="selenium">🌐 Selenium</option>
                            <option value="api-testing">🔌 API Testing</option>
                            <option value="mixed">🔄 Mixed Topics</option>
                        </select>
                    </div>

                    <div class="preference-group">
                        <label>Experience Level:</label>
                        <select id="partnerExperience" class="social-select">
                            <option value="similar">Similar to mine</option>
                            <option value="beginner">🌱 Beginner</option>
                            <option value="intermediate">🌿 Intermediate</option>
                            <option value="advanced">🌳 Advanced</option>
                            <option value="any">Any Level</option>
                        </select>
                    </div>

                    <div class="preference-group">
                        <label>Study Time:</label>
                        <div class="time-slots">
                            <label class="time-slot">
                                <input type="checkbox" value="morning">
                                <span>🌅 Morning (6-12 PM)</span>
                            </label>
                            <label class="time-slot">
                                <input type="checkbox" value="afternoon">
                                <span>☀️ Afternoon (12-6 PM)</span>
                            </label>
                            <label class="time-slot">
                                <input type="checkbox" value="evening">
                                <span>🌆 Evening (6-10 PM)</span>
                            </label>
                            <label class="time-slot">
                                <input type="checkbox" value="night">
                                <span>🌙 Night (10 PM-12 AM)</span>
                            </label>
                        </div>
                    </div>

                    <div class="preference-group">
                        <label>Session Duration:</label>
                        <select id="partnerDuration" class="social-select">
                            <option value="15-30">15-30 minutes</option>
                            <option value="30-60" selected>30-60 minutes</option>
                            <option value="60-120">1-2 hours</option>
                            <option value="120+">2+ hours</option>
                        </select>
                    </div>
                </div>

                <div class="partner-matching">
                    <button id="findPartnerBtn" class="btn-primary">🔍 Find Partners</button>
                </div>

                <div id="partnerResults" class="partner-results" style="display: none;">
                    <!-- Partner results will be loaded here -->
                </div>

                <div class="partner-actions">
                    <button type="button" id="findPartnerCancel" class="btn-cancel">❌ Cancel</button>
                </div>
            </div>
        `;

        this.setupFindPartnerListeners();
        modal.style.display = 'block';
    }

    setupFindPartnerListeners() {
        const findBtn = document.querySelector('#findPartnerBtn');
        const cancelBtn = document.querySelector('#findPartnerCancel');

        if (findBtn) {
            findBtn.addEventListener('click', () => {
                this.findStudyPartners();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.querySelector('#socialModal').style.display = 'none';
            });
        }
    }

    async findStudyPartners() {
        try {
            const preferences = this.collectPartnerPreferences();
            const partners = await this.matchStudyPartners(preferences);

            const resultsContainer = document.querySelector('#partnerResults');
            if (resultsContainer) {
                resultsContainer.innerHTML = this.renderPartnerResults(partners);
                resultsContainer.style.display = 'block';
            }

        } catch (error) {
            console.error('❌ Failed to find study partners:', error);
        }
    }

    collectPartnerPreferences() {
        const studyFocus = document.querySelector('#partnerStudyFocus').value;
        const experience = document.querySelector('#partnerExperience').value;
        const duration = document.querySelector('#partnerDuration').value;

        const timeSlots = Array.from(document.querySelectorAll('.time-slot input:checked'))
            .map(checkbox => checkbox.value);

        return {
            studyFocus,
            experience,
            timeSlots,
            duration
        };
    }

    renderPartnerResults(partners) {
        if (partners.length === 0) {
            return `
                <div class="no-partners">
                    <h4>No partners found</h4>
                    <p>Try adjusting your preferences or check back later!</p>
                </div>
            `;
        }

        return `
            <h4>Found ${partners.length} potential study partners:</h4>
            <div class="partners-list">
                ${partners.map(partner => `
                    <div class="partner-card">
                        <div class="partner-info">
                            <div class="partner-avatar">
                                ${partner.avatar || '👤'}
                            </div>
                            <div class="partner-details">
                                <h5>${partner.name}</h5>
                                <span class="partner-level">${partner.level}</span>
                                <span class="partner-match">Match: ${partner.matchScore}%</span>
                            </div>
                        </div>

                        <div class="partner-stats">
                            <div class="partner-stat">
                                <span class="stat-label">Focus:</span>
                                <span class="stat-value">${partner.studyFocus}</span>
                            </div>
                            <div class="partner-stat">
                                <span class="stat-label">Available:</span>
                                <span class="stat-value">${partner.availability.join(', ')}</span>
                            </div>
                            <div class="partner-stat">
                                <span class="stat-label">Streak:</span>
                                <span class="stat-value">${partner.streak} days</span>
                            </div>
                        </div>

                        <div class="partner-actions">
                            <button class="social-btn social-btn-primary" data-action="connect" data-partner="${partner.id}">
                                🤝 Connect
                            </button>
                            <button class="social-btn social-btn-secondary" data-action="invite" data-partner="${partner.id}">
                                📅 Invite to Study
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ===================================
    // API INTEGRATION & DATA
    // ===================================

    async fetchUserGroups(userId) {
        try {
            // In a real implementation, this would fetch from API
            return this.generateMockGroups().filter(group =>
                group.members.includes(userId)
            );
        } catch (error) {
            console.error('❌ Failed to fetch user groups:', error);
            return [];
        }
    }

    async fetchAllGroups() {
        try {
            // In a real implementation, this would fetch from API
            return this.generateMockGroups();
        } catch (error) {
            console.error('❌ Failed to fetch all groups:', error);
            return [];
        }
    }

    async fetchSocialConnections(userId) {
        try {
            // In a real implementation, this would fetch from API
            return [];
        } catch (error) {
            console.error('❌ Failed to fetch social connections:', error);
            return [];
        }
    }

    async collectUserProgressForSharing() {
        // Collect user progress data for sharing
        return {
            questionsStudied: 125,
            currentStreak: 7,
            categoriesMastered: 4,
            studyHours: 23,
            recentAchievements: [
                { icon: '🔥', title: 'Week Warrior' },
                { icon: '🎯', title: 'Java Master' },
                { icon: '⚡', title: 'Speed Learner' }
            ]
        };
    }

    async shareToTarget(target, shareData) {
        switch (target) {
            case 'groups':
                await this.shareToGroups(shareData);
                break;
            case 'leaderboard':
                await this.shareToLeaderboard(shareData);
                break;
            case 'social':
                await this.shareToSocialMedia(shareData);
                break;
        }
    }

    async matchStudyPartners(preferences) {
        // In a real implementation, this would use matching algorithms
        return this.generateMockPartners().filter(partner => {
            // Simple matching logic
            return partner.studyFocus === preferences.studyFocus ||
                   preferences.studyFocus === 'any';
        });
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    generateMockGroups() {
        return [
            {
                id: 'group_1',
                name: 'Java Masters',
                description: 'Advanced Java interview preparation group',
                category: 'java',
                level: 'advanced',
                memberCount: 156,
                isPrivate: false,
                activityLevel: 'High',
                rating: 4.8,
                studyFocus: 'Advanced Java Concepts',
                meetingSchedule: 'Weekdays 7-9 PM EST',
                creator: { name: 'Sarah Chen', level: 'Expert' },
                members: ['user_1', 'user_2'],
                recentActivity: [
                    { type: 'discussion', content: 'New thread: Garbage Collection' },
                    { type: 'share', content: 'Mock interview questions shared' }
                ]
            },
            {
                id: 'group_2',
                name: 'Selenium Automation Hub',
                description: 'Learn Selenium WebDriver together',
                category: 'selenium',
                level: 'intermediate',
                memberCount: 89,
                isPrivate: false,
                activityLevel: 'Medium',
                rating: 4.6,
                studyFocus: 'Selenium WebDriver & Testing',
                meetingSchedule: 'Weekends 2-4 PM EST',
                creator: { name: 'Mike Johnson', level: 'Senior' },
                members: ['user_3', 'user_4'],
                recentActivity: [
                    { type: 'discussion', content: 'Help with dynamic elements' }
                ]
            }
        ];
    }

    generateMockPartners() {
        return [
            {
                id: 'partner_1',
                name: 'Alex Kumar',
                level: 'Intermediate',
                studyFocus: 'java',
                availability: ['morning', 'evening'],
                streak: 12,
                matchScore: 85,
                avatar: '👨‍💻'
            },
            {
                id: 'partner_2',
                name: 'Emma Davis',
                level: 'Advanced',
                studyFocus: 'selenium',
                availability: ['afternoon', 'evening'],
                streak: 8,
                matchScore: 78,
                avatar: '👩‍💻'
            }
        ];
    }

    calculateUserLevel() {
        // Calculate user level based on progress
        if (!this.currentUser) return 'Beginner';
        return 'Intermediate'; // Simplified
    }

    renderGroupActivity(activities) {
        if (!activities || activities.length === 0) {
            return '<p class="no-activity">No recent activity</p>';
        }

        return activities.map(activity => `
            <div class="activity-item">
                <span class="activity-type">${this.getActivityIcon(activity.type)}</span>
                <span class="activity-content">${activity.content}</span>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            discussion: '💬',
            share: '📤',
            join: '➕',
            achievement: '🏆'
        };
        return icons[type] || '📝';
    }

    showNotification(message, type = 'info') {
        // Reuse notification system from CMS
        const notification = document.createElement('div');
        notification.className = `social-notification social-notification-${type}`;
        notification.innerHTML = `
            <span class="social-notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="social-notification-text">${message}</span>
            <button class="social-notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        notification.querySelector('.social-notification-close').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.SocialFeaturesSystem = SocialFeaturesSystem;
}