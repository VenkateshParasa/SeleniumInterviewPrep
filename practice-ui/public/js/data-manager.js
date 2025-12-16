// Data Manager Module
// Handles all data loading and API integration operations
// Interview Prep Platform - Frontend Integration
// Created: December 15, 2025

class DataManager {
    constructor() {
        this.practiceData = null;
        this.interviewQuestions = null;
        this.cache = {
            tracks: null,
            questions: new Map(),
            lastFetch: new Map()
        };
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Show success/error messages (will be injected by main app)
    showSuccessMessage(message, type = 'success') {
        if (window.practicePortal && window.practicePortal.showSuccessMessage) {
            window.practicePortal.showSuccessMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    showErrorMessage(message, type = 'error') {
        if (window.practicePortal && window.practicePortal.showErrorMessage) {
            window.practicePortal.showErrorMessage(message, type);
        } else {
            console.error(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Load practice tracks with fallback mechanism
    async loadPracticeData() {
        console.log('🔄 Starting practice data load...');

        // Try database first, then fallback to local files
        try {
            const data = await this.loadFromDatabase();
            if (data) {
                this.practiceData = data;
                console.log(`✅ Successfully loaded practice tracks from database`);
                this.showSuccessMessage(`Practice data loaded from database`, 'success');
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Database load failed, trying local files...', error.message);
        }

        // Fallback to local JSON files
        try {
            const data = await this.loadFromLocalFiles();
            if (data) {
                this.practiceData = data;
                console.log(`✅ Successfully loaded practice tracks from local files`);
                this.showSuccessMessage(`Practice data loaded from local files`, 'info');
                return data;
            }
        } catch (error) {
            console.error('❌ Error loading practice data from local files:', error);
            this.showErrorMessage('Failed to load practice data. Please check if data files exist.', 'error');
            throw error;
        }

        throw new Error('No practice data could be loaded from any source');
    }

    // Try loading from database API
    async loadFromDatabase() {
        if (!window.apiV2Client) {
            throw new Error('Database API client not available');
        }

        console.log('🗄️ Loading tracks from database...');
        const tracksResponse = await window.apiV2Client.getTracks();

        if (!tracksResponse || !tracksResponse.success) {
            throw new Error('Failed to load tracks from database: ' + (tracksResponse?.error || 'Load failed'));
        }

        if (!tracksResponse.data || tracksResponse.data.length === 0) {
            throw new Error('No tracks found in database');
        }

        // Transform database tracks to expected format
        const data = {};
        let tracksProcessed = 0;

        tracksResponse.data.forEach(track => {
            const trackKey = track.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            data[trackKey] = {
                id: track.id,
                name: track.name,
                description: track.description,
                duration: track.duration,
                difficulty: track.difficulty,
                weeks: this.transformDaysToWeeks(track.days || [])
            };
            tracksProcessed++;
        });

        if (tracksProcessed === 0) {
            throw new Error('No valid tracks could be processed from database');
        }

        return data;
    }

    // Fallback to local JSON files
    async loadFromLocalFiles() {
        console.log('📁 Loading tracks from local files...');

        // First try embedded data
        if (window.PRACTICE_DATA) {
            console.log('✅ Using embedded practice data');
            return window.PRACTICE_DATA;
        }

        // Try to load the main practice data file
        const dataFiles = [
            'data/practice/practice-data.json',
            'data/practice/practice-data-comprehensive.json',
            'data/practice/practice-data-senior.json'
        ];

        for (const filePath of dataFiles) {
            try {
                console.log(`🔍 Trying to load: ${filePath}`);
                const response = await fetch(filePath);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Successfully loaded from ${filePath}`);
                    return data;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load ${filePath}:`, error.message);
                continue;
            }
        }

        throw new Error('No local practice data files could be loaded');
    }

    // Helper function to transform database days to weeks structure
    transformDaysToWeeks(days) {
        if (!days || !Array.isArray(days)) {
            return [];
        }

        const weeks = [];
        let currentWeek = null;
        let currentWeekDays = [];

        days.forEach(day => {
            const weekTitle = day.week_title || `Week ${Math.ceil(day.day_number / 7)}`;

            if (!currentWeek || currentWeek !== weekTitle) {
                if (currentWeek) {
                    weeks.push({
                        title: currentWeek,
                        days: [...currentWeekDays]
                    });
                }
                currentWeek = weekTitle;
                currentWeekDays = [];
            }

            currentWeekDays.push({
                id: day.day_number,
                title: day.title,
                focus: day.focus,
                timeCommitment: day.time_commitment,
                tasks: day.tasks ? JSON.parse(day.tasks) : [],
                practice: day.practice ? JSON.parse(day.practice) : [],
                resources: day.resources ? JSON.parse(day.resources) : []
            });
        });

        if (currentWeek && currentWeekDays.length > 0) {
            weeks.push({
                title: currentWeek,
                days: currentWeekDays
            });
        }

        return weeks;
    }

    // Load interview questions with fallback mechanism
    async loadInterviewQuestions() {
        console.log('🔄 Starting questions load...');

        // Try database first, then fallback to local files
        try {
            const result = await this.loadQuestionsFromDatabase();
            if (result) {
                console.log(`✅ Successfully loaded questions from database`);
                this.showSuccessMessage(`Questions loaded from database`, 'success');
                return result;
            }
        } catch (error) {
            console.warn('⚠️ Database questions load failed, trying local files...', error.message);
        }

        // Fallback to local JSON files
        try {
            const result = await this.loadQuestionsFromLocalFiles();
            if (result) {
                console.log(`✅ Successfully loaded questions from local files`);
                this.showSuccessMessage(`Questions loaded from local files`, 'info');
                return result;
            }
        } catch (error) {
            console.error('❌ Error loading questions from local files:', error);
            this.showErrorMessage('Failed to load questions. Please check if data files exist.', 'error');
            throw error;
        }

        throw new Error('No questions could be loaded from any source');
    }

    // Try loading questions from database API
    async loadQuestionsFromDatabase() {
        if (!window.apiV2Client) {
            throw new Error('Database API client not available');
        }

        console.log('🗄️ Loading questions from database...');
        const apiResult = await window.apiV2Client.getQuestions({
            page: 1,
            limit: 20,
            useCache: true
        });

        if (!apiResult || !apiResult.success) {
            throw new Error('Failed to load questions from database: ' + (apiResult?.error || 'Load failed'));
        }

        if (!apiResult.data || apiResult.data.length === 0) {
            throw new Error('No questions found in database');
        }

        // Convert database format to existing frontend format
        this.interviewQuestions = this.convertDatabaseToLegacyFormat(apiResult.data);

        return {
            questions: this.interviewQuestions,
            pagination: apiResult.pagination
        };
    }

    // Fallback to local JSON question files
    async loadQuestionsFromLocalFiles() {
        console.log('📁 Loading questions from local files...');

        // First try embedded data
        if (window.INTERVIEW_QUESTIONS) {
            console.log('✅ Using embedded questions data');
            this.interviewQuestions = window.INTERVIEW_QUESTIONS;

            return {
                questions: window.INTERVIEW_QUESTIONS,
                pagination: {
                    total: this.countTotalQuestions(window.INTERVIEW_QUESTIONS),
                    page: 1,
                    limit: 1000
                }
            };
        }

        // Try to load question data files
        const questionFiles = [
            'data/questions/interview-questions-fixed.json',
            'data/questions/interview-questions.json',
            'data/questions/expanded-questions-comprehensive.json'
        ];

        for (const filePath of questionFiles) {
            try {
                console.log(`🔍 Trying to load: ${filePath}`);
                const response = await fetch(filePath);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Successfully loaded from ${filePath}`);

                    // Store the questions data
                    this.interviewQuestions = data;

                    return {
                        questions: data,
                        pagination: {
                            total: this.countTotalQuestions(data),
                            page: 1,
                            limit: 1000
                        }
                    };
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load ${filePath}:`, error.message);
                continue;
            }
        }

        throw new Error('No local question data files could be loaded');
    }

    // Helper to count total questions in nested structure
    countTotalQuestions(data) {
        if (!data || !data.categories) return 0;

        let total = 0;
        data.categories.forEach(category => {
            if (category.questions && Array.isArray(category.questions)) {
                total += category.questions.length;
            }
        });
        return total;
    }

    // Helper function to convert database format to legacy frontend format
    convertDatabaseToLegacyFormat(questions) {
        if (!questions || !Array.isArray(questions)) {
            return { categories: [] };
        }

        // Group questions by category
        const categoriesMap = new Map();

        questions.forEach(question => {
            const categoryName = question.category || 'General';

            if (!categoriesMap.has(categoryName)) {
                categoriesMap.set(categoryName, {
                    name: categoryName,
                    questions: []
                });
            }

            categoriesMap.get(categoryName).questions.push({
                id: question.id,
                question: question.question,
                answer: question.answer,
                difficulty: question.difficulty || 'medium',
                tags: question.tags ? question.tags.split(',').map(t => t.trim()) : [],
                category: categoryName
            });
        });

        return {
            categories: Array.from(categoriesMap.values())
        };
    }

    // Get all questions in flat array format
    getAllQuestions() {
        if (!this.interviewQuestions || !this.interviewQuestions.categories) {
            return [];
        }

        const allQuestions = [];
        this.interviewQuestions.categories.forEach(category => {
            if (category.questions) {
                category.questions.forEach(question => {
                    allQuestions.push({
                        ...question,
                        categoryId: category.name.toLowerCase().replace(/\s+/g, '-'),
                        categoryName: category.name
                    });
                });
            }
        });

        return allQuestions;
    }

    // Load paginated questions with filters and search
    async loadQuestionsPage(page = 1, limit = 20, filters = {}) {
        try {
            if (!window.apiV2Client) {
                throw new Error('Database API client not available');
            }

            const options = {
                page: page,
                limit: limit,
                useCache: false // Don't cache during pagination for fresh results
            };

            // Add filters
            if (filters.category && filters.category !== 'all') {
                options.category_id = filters.category;
            }
            if (filters.difficulty && filters.difficulty !== 'all') {
                options.difficulty = filters.difficulty;
            }
            if (filters.search) {
                options.search = filters.search;
            }

            const apiResult = await window.apiV2Client.getQuestions(options);

            if (!apiResult || !apiResult.success) {
                throw new Error('Failed to load questions page: ' + (apiResult?.error || 'Unknown error'));
            }

            // Convert to legacy format
            const questions = this.convertDatabaseToLegacyFormat(apiResult.data);

            return {
                questions: questions,
                pagination: apiResult.pagination,
                source: 'database'
            };

        } catch (error) {
            console.error('❌ Error loading questions page:', error);
            throw error;
        }
    }

    // Get practice data
    getPracticeData() {
        return this.practiceData;
    }

    // Get interview questions
    getInterviewQuestions() {
        return this.interviewQuestions;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}