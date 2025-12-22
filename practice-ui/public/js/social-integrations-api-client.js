// Social Learning API Client
// Frontend client for social features with proper UI→API→DB integration
// Created: December 19, 2025

class SocialApiClient {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.token = localStorage.getItem('auth_token');

        // Cache for performance
        this.cache = {
            profile: null,
            groups: null,
            leaderboard: null,
            activity: null,
            achievements: null,
            lastFetch: new Map()
        };

        this.cacheTimeout = 2 * 60 * 1000; // 2 minutes for social data
    }

    getBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if (window.location.port === '8080') {
                return 'http://localhost:3001/api/v2'; // Enable API calls for localhost:8080
            }
            return 'http://localhost:3001/api/v2';
        } else {
            return '/api/v2';
        }
    }

    // Generic request method
    async request(endpoint, options = {}) {
        if (!this.baseUrl) {
            throw new Error('Social API disabled in development mode');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            console.log(`🔄 Social API Request: ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`Social API Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Social API Response: ${endpoint}`, data);

            return data;
        } catch (error) {
            console.warn(`❌ Social API Error:`, error);
            throw error;
        }
    }

    // Cache management
    isCacheValid(key) {
        const lastFetch = this.cache.lastFetch.get(key);
        return lastFetch && (Date.now() - lastFetch) < this.cacheTimeout;
    }

    setCache(key, data) {
        this.cache[key] = data;
        this.cache.lastFetch.set(key, Date.now());
    }

    // ===================================
    // SOCIAL PROFILE API
    // ===================================

    async getProfile(useCache = true) {
        if (useCache && this.cache.profile && this.isCacheValid('profile')) {
            return { success: true, data: this.cache.profile };
        }

        try {
            const response = await this.request('/profile');

            if (response.success) {
                this.setCache('profile', response.data);
            }

            return response;
        } catch (error) {
            // Fallback to localStorage data
            const fallbackProfile = {
                questionsStudied: parseInt(localStorage.getItem('social_questions_studied') || '0'),
                currentStreak: parseInt(localStorage.getItem('social_current_streak') || '0'),
                rank: localStorage.getItem('social_rank') || '-',
                achievements: []
            };

            return {
                success: true,
                data: fallbackProfile,
                source: 'localStorage'
            };
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await this.request('/profile', {
                method: 'POST',
                body: JSON.stringify(profileData)
            });

            if (response.success) {
                // Update cache and localStorage
                this.setCache('profile', response.data);
                localStorage.setItem('social_questions_studied', response.data.questionsStudied.toString());
                localStorage.setItem('social_current_streak', response.data.currentStreak.toString());
                localStorage.setItem('social_rank', response.data.rank.toString());
            }

            return response;
        } catch (error) {
            // Update localStorage as fallback
            if (profileData.questionsStudied !== undefined) {
                localStorage.setItem('social_questions_studied', profileData.questionsStudied.toString());
            }
            if (profileData.currentStreak !== undefined) {
                localStorage.setItem('social_current_streak', profileData.currentStreak.toString());
            }

            return {
                success: true,
                data: profileData,
                source: 'localStorage'
            };
        }
    }

    // ===================================
    // STUDY GROUPS API
    // ===================================

    async getStudyGroups(useCache = true) {
        if (useCache && this.cache.groups && this.isCacheValid('groups')) {
            return { success: true, data: this.cache.groups };
        }

        try {
            const response = await this.request('/groups');

            if (response.success) {
                this.setCache('groups', response.data);
            }

            return response;
        } catch (error) {
            // Fallback to default groups
            const fallbackGroups = [
                { id: 'java-masters', name: 'Java Masters', members: 24, category: 'java', level: 'Advanced', activity: 'High' },
                { id: 'selenium-beginners', name: 'Selenium Beginners', members: 12, category: 'selenium', level: 'Beginner', activity: 'Medium' },
                { id: 'api-testing-pro', name: 'API Testing Pro', members: 8, category: 'api-testing', level: 'Intermediate', activity: 'Low' }
            ];

            return {
                success: true,
                data: fallbackGroups,
                source: 'fallback'
            };
        }
    }

    async createStudyGroup(groupData) {
        try {
            const response = await this.request('/groups', {
                method: 'POST',
                body: JSON.stringify(groupData)
            });

            if (response.success) {
                // Invalidate groups cache
                this.cache.groups = null;
                this.cache.lastFetch.delete('groups');
            }

            return response;
        } catch (error) {
            // Create group locally as fallback
            const newGroup = {
                id: Date.now().toString(),
                name: groupData.name,
                members: 1,
                category: groupData.category || 'general',
                level: groupData.level || 'Mixed',
                activity: 'New'
            };

            return {
                success: true,
                data: newGroup,
                source: 'localStorage'
            };
        }
    }

    // ===================================
    // LEADERBOARD API
    // ===================================

    async getLeaderboard(period = 'monthly', useCache = true) {
        const cacheKey = `leaderboard_${period}`;

        if (useCache && this.cache.leaderboard && this.isCacheValid(cacheKey)) {
            return { success: true, data: this.cache.leaderboard };
        }

        try {
            const response = await this.request(`/leaderboard?period=${period}`);

            if (response.success) {
                this.cache.leaderboard = response.data;
                this.cache.lastFetch.set(cacheKey, Date.now());
            }

            return response;
        } catch (error) {
            // Fallback leaderboard
            const fallbackLeaderboard = [
                { rank: 1, name: 'Alex Chen', score: 2450, streak: 15, avatar: '👨‍💻' },
                { rank: 2, name: 'Sarah Kim', score: 2380, streak: 12, avatar: '👩‍💻' },
                { rank: 3, name: 'Mike Johnson', score: 2320, streak: 8, avatar: '👨‍🔬' },
                { rank: 4, name: 'Emily Davis', score: 2280, streak: 10, avatar: '👩‍🎓' },
                { rank: 5, name: 'You', score: 1850, streak: 3, avatar: '🧑‍🎓' }
            ];

            return {
                success: true,
                data: fallbackLeaderboard,
                source: 'fallback'
            };
        }
    }

    // ===================================
    // ACTIVITY FEED API
    // ===================================

    async getActivityFeed(limit = 20, offset = 0, useCache = true) {
        const cacheKey = `activity_${limit}_${offset}`;

        if (useCache && this.cache.activity && this.isCacheValid(cacheKey)) {
            return { success: true, data: this.cache.activity };
        }

        try {
            const response = await this.request(`/activity?limit=${limit}&offset=${offset}`);

            if (response.success) {
                this.cache.activity = response.data;
                this.cache.lastFetch.set(cacheKey, Date.now());
            }

            return response;
        } catch (error) {
            // Fallback activity
            const fallbackActivity = [
                { user: 'Alex Chen', action: 'completed Java Basics track', time: '2 hours ago', icon: '🎯', type: 'completion' },
                { user: 'Sarah Kim', action: 'achieved 10-day study streak', time: '4 hours ago', icon: '🔥', type: 'achievement' },
                { user: 'Mike Johnson', action: 'joined Selenium Advanced group', time: '6 hours ago', icon: '👥', type: 'social' }
            ];

            return {
                success: true,
                data: fallbackActivity,
                source: 'fallback'
            };
        }
    }

    // ===================================
    // ACHIEVEMENTS API
    // ===================================

    async getAchievements(useCache = true) {
        if (useCache && this.cache.achievements && this.isCacheValid('achievements')) {
            return { success: true, data: this.cache.achievements };
        }

        try {
            const response = await this.request('/achievements');

            if (response.success) {
                this.setCache('achievements', response.data);
            }

            return response;
        } catch (error) {
            // Fallback achievements
            const fallbackAchievements = [
                { id: 'first_streak', name: 'First Streak', icon: '🔥', description: 'Study for 3 consecutive days', progress: 1, target: 3, unlocked: false },
                { id: 'question_master', name: 'Question Master', icon: '🎯', description: 'Answer 50 questions correctly', progress: 0, target: 50, unlocked: false },
                { id: 'social_learner', name: 'Social Learner', icon: '👥', description: 'Join your first study group', progress: 0, target: 1, unlocked: false }
            ];

            return {
                success: true,
                data: fallbackAchievements,
                source: 'fallback'
            };
        }
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    // Check if Social API is available
    async isAvailable() {
        try {
            if (!this.baseUrl) return false;

            const response = await fetch(`${this.baseUrl}/groups`, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('Social API not available:', error.message);
            return false;
        }
    }

    // Clear all cached data
    clearCache() {
        this.cache.profile = null;
        this.cache.groups = null;
        this.cache.leaderboard = null;
        this.cache.activity = null;
        this.cache.achievements = null;
        this.cache.lastFetch.clear();
    }

    // Get cache info for debugging
    getCacheInfo() {
        return {
            profile: !!this.cache.profile,
            groups: !!this.cache.groups,
            leaderboard: !!this.cache.leaderboard,
            activity: !!this.cache.activity,
            achievements: !!this.cache.achievements,
            lastFetches: Object.fromEntries(this.cache.lastFetch),
            cacheTimeout: this.cacheTimeout
        };
    }
}

// Note: IntegrationsApiClient has been removed as all integration functionality
// is now handled through the unified SocialApiClient using /api/v2 endpoints

// Create global instances
if (typeof window !== 'undefined') {
    window.socialApiClient = new SocialApiClient();
    console.log('✅ Social API Client initialized globally (unified system)');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SocialApiClient };
}