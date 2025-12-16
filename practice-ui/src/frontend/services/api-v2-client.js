// API v2 Client for Database-Powered Endpoints
// Interview Prep Platform - Frontend Integration
// Created: December 15, 2025

class ApiV2Client {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.token = localStorage.getItem('auth_token');
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second

        // Cache for performance
        this.cache = {
            categories: null,
            tracks: null,
            questions: new Map(),
            lastFetch: new Map()
        };

        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    getBaseUrl() {
        // Auto-detect API base URL based on environment
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3001/api/v2';
        } else {
            // Production or deployed environment
            return '/api/v2';
        }
    }

    // Generic API request method with retry logic
    async request(endpoint, options = {}) {
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

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🔄 API v2 Request: ${options.method || 'GET'} ${url} (attempt ${attempt})`);

                const response = await fetch(url, config);

                if (!response.ok) {
                    if (response.status === 401) {
                        // Clear invalid token
                        this.clearAuthToken();
                    }

                    throw new Error(`API Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log(`✅ API v2 Response: ${endpoint}`, data);

                return data;

            } catch (error) {
                console.warn(`❌ API v2 Error (attempt ${attempt}/${this.retryAttempts}):`, error);

                if (attempt === this.retryAttempts) {
                    throw error;
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
    }

    // Authentication methods
    setAuthToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearAuthToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
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

    clearCache() {
        this.cache.categories = null;
        this.cache.tracks = null;
        this.cache.questions.clear();
        this.cache.lastFetch.clear();
    }

    // ===================================
    // CATEGORIES API
    // ===================================

    async getCategories(useCache = true) {
        if (useCache && this.cache.categories && this.isCacheValid('categories')) {
            return { success: true, data: this.cache.categories };
        }

        try {
            const response = await this.request('/categories');

            if (response.success) {
                this.setCache('categories', response.data);
            }

            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCategory(slug) {
        try {
            const response = await this.request(`/categories/${slug}`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // TRACKS API
    // ===================================

    async getTracks(useCache = true) {
        if (useCache && this.cache.tracks && this.isCacheValid('tracks')) {
            return { success: true, data: this.cache.tracks };
        }

        try {
            const response = await this.request('/tracks');

            if (response.success) {
                this.setCache('tracks', response.data);
            }

            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTrack(slug) {
        try {
            const response = await this.request(`/tracks/${slug}`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTrackProgress(slug) {
        try {
            const response = await this.request(`/tracks/${slug}/progress`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // QUESTIONS API WITH PAGINATION
    // ===================================

    async getQuestions(options = {}) {
        const {
            page = 1,
            limit = 20,
            category_id = null,
            difficulty = null,
            search = null,
            useCache = false // Questions change frequently, cache cautiously
        } = options;

        const cacheKey = `questions_${JSON.stringify(options)}`;

        if (useCache && this.cache.questions.has(cacheKey) && this.isCacheValid(cacheKey)) {
            return { success: true, ...this.cache.questions.get(cacheKey) };
        }

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (category_id) params.append('category_id', category_id.toString());
            if (difficulty) params.append('difficulty', difficulty.toString());
            if (search) params.append('search', search);

            const response = await this.request(`/questions?${params}`);

            if (response.success && useCache) {
                this.cache.questions.set(cacheKey, response);
                this.cache.lastFetch.set(cacheKey, Date.now());
            }

            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getQuestion(id) {
        try {
            const response = await this.request(`/questions/${id}`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getQuestionsByCategory(categorySlug, options = {}) {
        const { page = 1, limit = 20 } = options;

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await this.request(`/categories/${categorySlug}/questions?${params}`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // SEARCH API
    // ===================================

    async search(query, options = {}) {
        const {
            type = 'all',
            page = 1,
            limit = 20
        } = options;

        try {
            const params = new URLSearchParams({
                q: query,
                type,
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await this.request(`/search?${params}`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // PROGRESS API
    // ===================================

    async getProgress(trackId = null) {
        try {
            const params = trackId ? `?track_id=${trackId}` : '';
            const response = await this.request(`/progress${params}`);
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateProgress(trackId, dayNumber, progressData) {
        try {
            const response = await this.request('/progress', {
                method: 'POST',
                body: JSON.stringify({
                    track_id: trackId,
                    day_number: dayNumber,
                    ...progressData
                })
            });
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getStats() {
        try {
            const response = await this.request('/stats');
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    // Check if API v2 is available
    async isAvailable() {
        try {
            const response = await this.request('/health');
            return response.success;
        } catch (error) {
            console.warn('API v2 not available:', error.message);
            return false;
        }
    }

    // Batch load multiple endpoints for efficiency
    async batchLoad() {
        try {
            console.log('🚀 Loading API v2 data in batch...');

            const [categories, tracks] = await Promise.allSettled([
                this.getCategories(false),
                this.getTracks(false)
            ]);

            const results = {
                categories: categories.status === 'fulfilled' ? categories.value : null,
                tracks: tracks.status === 'fulfilled' ? tracks.value : null
            };

            console.log('✅ API v2 batch load completed:', results);
            return results;
        } catch (error) {
            console.error('❌ API v2 batch load failed:', error);
            return null;
        }
    }

    // Get cached data summary for debugging
    getCacheInfo() {
        return {
            categories: !!this.cache.categories,
            tracks: !!this.cache.tracks,
            questionsCount: this.cache.questions.size,
            lastFetches: Object.fromEntries(this.cache.lastFetch),
            cacheTimeout: this.cacheTimeout
        };
    }

    // Hybrid fallback: try API v2, fallback to embedded data
    async getQuestionsHybrid(options = {}) {
        try {
            // Try API v2 first
            const apiResult = await this.getQuestions(options);
            if (apiResult.success) {
                return {
                    source: 'api_v2',
                    ...apiResult
                };
            }
        } catch (error) {
            console.warn('API v2 failed, falling back to embedded data');
        }

        // Fallback to embedded data
        if (window.QUESTIONS_DATA) {
            const embeddedData = this.filterEmbeddedQuestions(window.QUESTIONS_DATA, options);
            return {
                source: 'embedded',
                success: true,
                data: embeddedData.questions,
                pagination: {
                    page: options.page || 1,
                    limit: options.limit || 20,
                    total: embeddedData.total,
                    totalPages: Math.ceil(embeddedData.total / (options.limit || 20)),
                    hasNext: false,
                    hasPrev: false
                }
            };
        }

        return { success: false, error: 'No data source available' };
    }

    // Filter embedded questions to match API v2 format
    filterEmbeddedQuestions(questionsData, options = {}) {
        const { category_id, difficulty, search, page = 1, limit = 20 } = options;

        let allQuestions = [];

        // Flatten embedded questions structure
        questionsData.categories?.forEach(category => {
            category.questions?.forEach(question => {
                allQuestions.push({
                    ...question,
                    category_id: category.id,
                    category_name: category.name,
                    category_slug: category.id
                });
            });
        });

        // Apply filters
        let filtered = allQuestions;

        if (category_id) {
            filtered = filtered.filter(q => q.category_id === category_id);
        }

        if (difficulty) {
            filtered = filtered.filter(q => q.difficulty === difficulty);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(q =>
                q.question?.toLowerCase().includes(searchLower) ||
                q.answer?.toLowerCase().includes(searchLower) ||
                q.topic?.toLowerCase().includes(searchLower)
            );
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedQuestions = filtered.slice(startIndex, startIndex + limit);

        return {
            questions: paginatedQuestions,
            total: filtered.length
        };
    }
}

// Create global instance
window.apiV2Client = new ApiV2Client();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiV2Client;
}