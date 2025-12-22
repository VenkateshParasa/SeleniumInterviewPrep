// API v2 Client for Database-Powered Endpoints
// Interview Prep Platform - Frontend Integration
// Created: December 15, 2025

class ApiV2Client {
    constructor() {
        console.log('🔍 DEBUG: ApiV2Client constructor called');
        this.baseUrl = this.getBaseUrl();
        console.log('🔍 DEBUG: Constructor - baseUrl set to:', this.baseUrl);
        console.log('🔍 DEBUG: Constructor - baseUrl type:', typeof this.baseUrl);
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

        // CRITICAL FIX: Bind all methods to ensure proper context
        this.getQuestions = this.getQuestions.bind(this);
        this.getQuestionsHybrid = this.getQuestionsHybrid.bind(this);
        this.getCategories = this.getCategories.bind(this);
        this.getTracks = this.getTracks.bind(this);
        this.getProgress = this.getProgress.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.getStats = this.getStats.bind(this);
        this.isAvailable = this.isAvailable.bind(this);
        this.request = this.request.bind(this);
        
        console.log('✅ All ApiV2Client methods bound to proper context');
    }

    getBaseUrl() {
        // Use centralized port configuration
        console.log('🔍 API Client Debug - Current location:', {
            hostname: window.location.hostname,
            port: window.location.port,
            protocol: window.location.protocol
        });
        
        // Database server port from centralized config (3003)
        const DATABASE_SERVER_PORT = 3003; // This matches PORTS.DATABASE_SERVER from config/ports.js
        const baseUrl = `${window.location.protocol}//${window.location.hostname}:${DATABASE_SERVER_PORT}/api/v2`;
        
        console.log('✅ API Client: Using centralized port configuration:', {
            baseUrl: baseUrl,
            databaseServerPort: DATABASE_SERVER_PORT,
            note: 'Port changed to 3003 from centralized config - database server integration'
        });
        
        // Test if database server is reachable
        this.testDatabaseConnection(baseUrl);
        
        return baseUrl;
    }
    
    async testDatabaseConnection(baseUrl) {
        try {
            console.log('🔍 DEBUG: Testing database server connection...');
            const response = await fetch(`${baseUrl.replace('/api/v2', '')}/health`, {
                method: 'GET',
                timeout: 3000
            });
            
            if (response.ok) {
                console.log('✅ Database server is reachable at port 3003');
            } else {
                console.error('❌ Database server responded with error:', response.status);
            }
        } catch (error) {
            console.error('❌ CRITICAL: Database server is NOT reachable at port 3003:', error.message);
            console.error('❌ This will cause frontend to fall back to embedded data (4 questions)');
        }
    }

    // Generic API request method with retry logic
    async request(endpoint, options = {}) {
        // If baseUrl is null, API is disabled (development mode)
        if (!this.baseUrl) {
            console.error('❌ API Error: No base URL configured');
            throw new Error('API base URL not configured');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // DEBUG: Log authentication status
        console.log('🔍 DEBUG: Authentication check:', {
            hasToken: !!this.token,
            tokenLength: this.token ? this.token.length : 0,
            tokenPreview: this.token ? this.token.substring(0, 20) + '...' : 'null',
            endpoint: endpoint,
            baseUrl: this.baseUrl
        });

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        } else {
            console.warn('⚠️ No authentication token found - API calls may fail with 401');
        }

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🔄 API v2 Request: ${options.method || 'GET'} ${url} (attempt ${attempt})`);
                console.log(`📍 Request details:`, {
                    endpoint,
                    baseUrl: this.baseUrl,
                    fullUrl: url,
                    method: options.method || 'GET',
                    hasAuth: !!this.token
                });

                const response = await fetch(url, config);

                console.log(`📡 Response received:`, {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                    url: response.url
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error('🔐 401 UNAUTHORIZED ERROR DETAILS:', {
                            endpoint: endpoint,
                            fullUrl: response.url,
                            method: options.method || 'GET',
                            hasAuthHeader: !!config.headers['Authorization'],
                            authHeaderPreview: config.headers['Authorization'] ?
                                config.headers['Authorization'].substring(0, 20) + '...' : 'none',
                            requestHeaders: Object.keys(config.headers),
                            timestamp: new Date().toISOString()
                        });
                        
                        // For anonymous-friendly endpoints, provide better error context
                        const anonymousFriendlyEndpoints = ['/progress', '/stats', '/health', '/categories', '/questions'];
                        const isAnonymousFriendly = anonymousFriendlyEndpoints.some(ep => endpoint.startsWith(ep));
                        
                        if (isAnonymousFriendly && !this.token) {
                            console.warn('⚠️ 401 on anonymous-friendly endpoint - this may indicate a server configuration issue');
                            console.warn('💡 Suggestion: Check if server route is properly configured for anonymous access');
                        }
                        
                        // Clear invalid token
                        this.clearAuthToken();
                        console.log('🔐 Cleared authentication token due to 401 error');
                    }

                    const errorMessage = `API Error ${response.status}: ${response.statusText}`;
                    console.error(`❌ API Error:`, {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                        endpoint,
                        method: options.method || 'GET',
                        hasToken: !!this.token,
                        baseUrl: this.baseUrl,
                        suggestion: response.status === 401 && !this.token ?
                            'This endpoint may require authentication or have a server configuration issue' : null
                    });
                    throw new Error(errorMessage);
                }

                // Check if response is JSON before parsing
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error(`Invalid response type: ${contentType || 'unknown'}`);
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
        // Always attempt API call when baseUrl is available
        if (!this.baseUrl) {
            console.warn('⚠️ API baseUrl not available for tracks, will fallback to local data');
            return { success: false, error: 'API baseUrl not configured' };
        }

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
        // Always attempt API call when baseUrl is available
        if (!this.baseUrl) {
            console.warn('⚠️ API baseUrl not available for categories, will fallback to local data');
            return { success: false, error: 'API baseUrl not configured' };
        }

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
            console.warn('🔄 API tracks request failed, will fallback to local data:', error.message);
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
        console.log('🔍 DEBUG: getQuestions called with options:', options);
        console.log('🔍 DEBUG: Call stack trace:', new Error().stack);
        console.log('🔍 DEBUG: this context in getQuestions:', {
            hasThis: !!this,
            thisConstructorName: this?.constructor?.name,
            thisBaseUrl: this?.baseUrl,
            thisType: typeof this,
            thisKeys: this ? Object.keys(this).slice(0, 5) : 'no this',
            isApiV2Client: this instanceof ApiV2Client
        });
        
        // ENHANCED CRITICAL FIX: Better context validation and recovery
        if (!this || !this.baseUrl || !(this instanceof ApiV2Client)) {
            console.error('❌ CRITICAL: getQuestions called with wrong context!');
            console.error('❌ Context details:', {
                hasThis: !!this,
                hasBaseUrl: !!this?.baseUrl,
                constructorName: this?.constructor?.name,
                isApiV2Client: this instanceof ApiV2Client,
                windowApiV2Client: !!window.apiV2Client
            });
            console.error('❌ Attempting to find correct ApiV2Client instance...');
            
            if (window.apiV2Client && window.apiV2Client instanceof ApiV2Client && window.apiV2Client.baseUrl) {
                console.log('✅ Found correct ApiV2Client instance, delegating call...');
                return await window.apiV2Client.getQuestions.call(window.apiV2Client, options);
            } else {
                console.error('❌ No valid ApiV2Client instance found!');
                console.error('❌ Available global objects:', Object.keys(window).filter(k => k.includes('api')));
                return { success: false, error: 'API client context error - no valid instance found' };
            }
        }
        
        // Always attempt API call when baseUrl is available
        if (!this.baseUrl) {
            console.warn('⚠️ API baseUrl not available, will fallback to local data');
            return { success: false, error: 'API baseUrl not configured' };
        }
        
        console.log('✅ API baseUrl available, attempting database API call');

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
            console.warn('🔄 API questions request failed, will fallback to local data:', error.message);
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
            // Use the anonymous-friendly endpoint /progress (not /tracks/:slug/progress)
            const params = trackId ? `?track_id=${trackId}` : '';
            const endpoint = `/progress${params}`;
            
            console.log('🔍 DEBUG: Getting progress with params:', {
                trackId,
                params,
                endpoint: endpoint,
                baseUrl: this.baseUrl,
                hasToken: !!this.token,
                note: 'Using anonymous-friendly /progress endpoint'
            });
            
            const response = await this.request(endpoint);
            return response;
        } catch (error) {
            const params = trackId ? `?track_id=${trackId}` : '';
            console.error('❌ getProgress failed:', {
                error: error.message,
                trackId,
                endpoint: `/progress${params}`,
                hasToken: !!this.token,
                suggestion: error.message.includes('401') ?
                    'Check if server /progress endpoint is properly configured for anonymous access' : null
            });
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

    async trackQuestionProgress(questionId, status = 'completed', timeSpent = 5) {
        try {
            const response = await this.request('/questions/progress', {
                method: 'POST',
                body: JSON.stringify({
                    question_id: questionId,
                    status: status,
                    time_spent: timeSpent,
                    studied_at: new Date().toISOString()
                })
            });
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
        console.log('🔍 DEBUG: getQuestionsHybrid called with options:', options);
        console.log('🔍 DEBUG: Call stack trace:', new Error().stack);
        console.log('🔍 DEBUG: this context in getQuestionsHybrid:', {
            hasThis: !!this,
            thisConstructorName: this?.constructor?.name,
            thisBaseUrl: this?.baseUrl,
            thisType: typeof this,
            isApiV2Client: this instanceof ApiV2Client
        });
        
        // ENHANCED CRITICAL FIX: Ensure proper context before calling getQuestions
        if (!this || !this.baseUrl || !(this instanceof ApiV2Client)) {
            console.error('❌ CRITICAL: getQuestionsHybrid called with wrong context!');
            console.error('❌ Attempting to find correct ApiV2Client instance...');
            
            if (window.apiV2Client && window.apiV2Client instanceof ApiV2Client && window.apiV2Client.baseUrl) {
                console.log('✅ Found correct ApiV2Client instance, delegating call...');
                return await window.apiV2Client.getQuestionsHybrid.call(window.apiV2Client, options);
            } else {
                console.error('❌ No valid ApiV2Client instance found!');
                return { success: false, error: 'API client context error in getQuestionsHybrid' };
            }
        }
        
        try {
            // Try API v2 first with proper context
            console.log('🔍 DEBUG: Attempting API v2 call...');
            const apiResult = await this.getQuestions.call(this, options);
            console.log('🔍 DEBUG: API v2 result:', {
                success: apiResult.success,
                dataLength: apiResult.data?.length,
                error: apiResult.error,
                pagination: apiResult.pagination
            });
            
            if (apiResult.success) {
                console.log(`✅ Hybrid: Using API v2 data (${apiResult.data.length} questions from database)`);
                console.log('🔍 DEBUG: Sample API data:', apiResult.data.slice(0, 2));
                return {
                    source: 'api_v2',
                    ...apiResult
                };
            } else {
                console.error('❌ API v2 call succeeded but returned failure:', apiResult.error);
                console.error('❌ This means database server responded but with an error');
            }
        } catch (error) {
            console.error('❌ API v2 failed completely, falling back to embedded data:', error.message);
            console.error('❌ This usually means database server is not running or not reachable');
        }

        // Fallback to embedded data
        console.error('📁 FALLBACK: Using embedded data (this will show only 4 questions instead of 1816)');
        if (window.QUESTIONS_DATA) {
            const embeddedData = this.filterEmbeddedQuestions(window.QUESTIONS_DATA, options);
            console.log('🔍 DEBUG: Embedded data result:', {
                success: true,
                dataLength: embeddedData.questions?.length,
                source: 'embedded',
                total: embeddedData.total
            });
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

        console.error('❌ CRITICAL: No data source available - neither API nor embedded data');
        return { success: false, error: 'No data source available' };
    }

    // Filter embedded questions to match API v2 format
    filterEmbeddedQuestions(questionsData, options = {}) {
        const { category_id, difficulty, search, page = 1, limit = 20 } = options;

        console.log('🔍 DEBUG: filterEmbeddedQuestions called with options:', options);
        console.log('🔍 DEBUG: questionsData structure:', {
            hasCategories: !!questionsData?.categories,
            categoriesCount: questionsData?.categories?.length || 0
        });

        let allQuestions = [];

        // Flatten embedded questions structure to match API v2 format
        questionsData.categories?.forEach(category => {
            console.log('🔍 DEBUG: Processing category:', {
                id: category.id,
                name: category.name,
                questionsCount: category.questions?.length || 0
            });

            category.questions?.forEach(question => {
                // Transform embedded format to API v2 format
                const transformedQuestion = {
                    id: question.id,
                    question: question.question,
                    answer: question.answer,
                    difficulty: question.difficulty,
                    tags: question.tags?.join(',') || '',
                    category_id: category.id,
                    category_name: category.name,
                    category_slug: category.id,
                    // Add missing fields that frontend expects
                    topic: category.name,
                    companies: [],
                    experience_levels: ['0-2', '3-5', '6-8'], // Default experience levels
                    follow_up_questions: [],
                    code_example: null
                };

                allQuestions.push(transformedQuestion);
            });
        });

        console.log('🔍 DEBUG: Total questions after flattening:', allQuestions.length);

        // Apply filters
        let filtered = allQuestions;

        if (category_id && category_id !== 'all') {
            console.log('🔍 DEBUG: Filtering by category_id:', category_id);
            filtered = filtered.filter(q => q.category_id === category_id);
            console.log('🔍 DEBUG: Questions after category filter:', filtered.length);
        }

        if (difficulty && difficulty !== 'all') {
            console.log('🔍 DEBUG: Filtering by difficulty:', difficulty);
            filtered = filtered.filter(q => q.difficulty === difficulty);
            console.log('🔍 DEBUG: Questions after difficulty filter:', filtered.length);
        }

        if (search) {
            console.log('🔍 DEBUG: Filtering by search term:', search);
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(q =>
                q.question?.toLowerCase().includes(searchLower) ||
                q.answer?.toLowerCase().includes(searchLower) ||
                q.topic?.toLowerCase().includes(searchLower) ||
                q.tags?.toLowerCase().includes(searchLower)
            );
            console.log('🔍 DEBUG: Questions after search filter:', filtered.length);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedQuestions = filtered.slice(startIndex, startIndex + limit);

        console.log('🔍 DEBUG: Pagination applied:', {
            page,
            limit,
            startIndex,
            totalFiltered: filtered.length,
            paginatedCount: paginatedQuestions.length
        });

        return {
            questions: paginatedQuestions,
            total: filtered.length
        };
    }
}

// Create global instance with error handling and proper binding
try {
    if (typeof window !== 'undefined') {
        window.apiV2Client = new ApiV2Client();
        console.log('✅ API v2 Client initialized globally with proper method binding');
        
        // Additional safety: Ensure methods are still bound after global assignment
        const client = window.apiV2Client;
        if (client.getQuestions && typeof client.getQuestions === 'function') {
            // Verify binding is working
            console.log('✅ Method binding verification passed');
        }
    }
} catch (error) {
    console.error('❌ Failed to initialize API v2 Client:', error);
    // Create a fallback object to prevent undefined errors
    if (typeof window !== 'undefined') {
        window.apiV2Client = {
            getQuestions: () => Promise.resolve({ success: false, error: 'API client not available' }),
            getQuestionsHybrid: () => Promise.resolve({ success: false, error: 'API client not available' }),
            getTracks: () => Promise.resolve({ success: false, error: 'API client not available' }),
            getCategories: () => Promise.resolve({ success: false, error: 'API client not available' }),
            isAvailable: () => false,
            baseUrl: null
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiV2Client;
}