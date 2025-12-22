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

        // Check if API is available - if not, will fallback to local data
        if (!window.apiV2Client.baseUrl) {
            console.warn('⚠️ API baseUrl not available, will fallback to local data');
            throw new Error('API baseUrl not configured - using local data');
        }

        console.log('🗄️ Loading questions from database...');

        try {
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
        } catch (error) {
            // Log error but don't spam console in development mode
            if (!error.message.includes('development mode')) {
                console.warn('🔄 Database load failed:', error.message);
            }
            throw error;
        }
    }

    // Fallback to local JSON question files
    async loadQuestionsFromLocalFiles() {
        console.log('📁 Loading questions from local files...');

        // First try embedded data (primary format)
        if (window.INTERVIEW_QUESTIONS && window.INTERVIEW_QUESTIONS.categories) {
            console.log('✅ Using embedded INTERVIEW_QUESTIONS data');
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

        // Try alternative format
        if (window.QUESTIONS_DATA && window.QUESTIONS_DATA.categories) {
            console.log('✅ Using embedded QUESTIONS_DATA');
            this.interviewQuestions = window.QUESTIONS_DATA;

            return {
                questions: window.QUESTIONS_DATA,
                pagination: {
                    total: this.countTotalQuestions(window.QUESTIONS_DATA),
                    page: 1,
                    limit: 1000
                }
            };
        }

        // Try to load question data files
        const questionFiles = [
            'data/questions/testng-framework-questions.json',
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

                    // If this is the TestNG file, we need to merge it with Java/Selenium questions
                    if (filePath.includes('testng-framework-questions.json')) {
                        const mergedData = await this.mergeWithBaseQuestions(data);
                        this.interviewQuestions = mergedData;
                        
                        return {
                            questions: mergedData,
                            pagination: {
                                total: this.countTotalQuestions(mergedData),
                                page: 1,
                                limit: 1000
                            }
                        };
                    } else {
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
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load ${filePath}:`, error.message);
                continue;
            }
        }

        throw new Error('No local question data files could be loaded');
    }

    // Helper method to merge TestNG questions with base Java/Selenium questions
    async mergeWithBaseQuestions(testngData) {
        // Base questions for Java and Selenium
        const baseQuestions = {
            version: "3.0.0",
            lastUpdated: "2024-12-19",
            totalQuestions: 63,
            description: "Comprehensive Interview questions database for QA Automation Engineers - Enhanced with TestNG and Framework Design",
            note: "Complete question bank covering Java, Selenium, TestNG Framework, and Test Framework Design for all experience levels.",
            categories: [
                {
                    id: "java",
                    name: "Java Programming",
                    icon: "☕",
                    totalQuestions: 5,
                    questions: [
                        {
                            id: "java-001",
                            question: "Explain the difference between == and .equals() in Java",
                            difficulty: "Medium",
                            experienceLevel: ["0-2", "3-5"],
                            answer: "== compares references (memory addresses) while .equals() compares object content. For primitives, == compares values. String literals with same value may share memory (interning), but new String() creates new objects.",
                            companies: ["All Java applications", "Banking", "E-commerce"],
                            topic: "Java Fundamentals",
                            followUp: ["What is String interning?", "When should you override equals()?"]
                        },
                        {
                            id: "java-002",
                            question: "What is the difference between String, StringBuilder, and StringBuffer?",
                            difficulty: "Medium",
                            experienceLevel: ["0-2", "3-5"],
                            answer: "String is immutable - creates new objects on modification. StringBuilder is mutable and not thread-safe, best for single-threaded string building. StringBuffer is mutable and thread-safe but slower due to synchronization.",
                            companies: ["Performance-critical applications", "Banking", "Real-time systems"],
                            topic: "Java Fundamentals",
                            followUp: ["When would you use each type?", "What is string immutability?"]
                        },
                        {
                            id: "java-003",
                            question: "Explain Java exception handling and the difference between checked and unchecked exceptions",
                            difficulty: "Medium",
                            experienceLevel: ["0-2", "3-5"],
                            answer: "Exception handling manages runtime errors using try-catch-finally blocks. Checked exceptions (compile-time) must be caught or declared (IOException, SQLException). Unchecked exceptions (runtime) don't require explicit handling (NullPointerException, ArrayIndexOutOfBoundsException).",
                            companies: ["All Java applications", "Banking", "Healthcare", "E-commerce"],
                            topic: "Exception Handling",
                            followUp: ["What is try-with-resources?", "When should you create custom exceptions?"]
                        },
                        {
                            id: "java-004",
                            question: "What are Java Collections and explain the difference between List, Set, and Map",
                            difficulty: "Medium",
                            experienceLevel: ["3-5", "6-8"],
                            answer: "Collections framework provides data structures. List allows duplicates and maintains order (ArrayList, LinkedList). Set doesn't allow duplicates (HashSet, TreeSet). Map stores key-value pairs (HashMap, TreeMap). Choose based on use case: ArrayList for random access, LinkedList for frequent insertions, HashMap for key lookups.",
                            companies: ["All Java applications", "Data processing", "Enterprise applications"],
                            topic: "Collections",
                            followUp: ["What's the difference between ArrayList and LinkedList?", "When to use HashMap vs TreeMap?"]
                        },
                        {
                            id: "java-005",
                            question: "Explain Java multithreading and synchronization",
                            difficulty: "Hard",
                            experienceLevel: ["3-5", "6-8"],
                            answer: "Multithreading allows concurrent execution. Create threads by extending Thread or implementing Runnable. Synchronization prevents race conditions using synchronized keyword, locks, or concurrent collections. Thread states: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.",
                            companies: ["High-performance applications", "Real-time systems", "Banking"],
                            topic: "Multithreading",
                            followUp: ["What is deadlock and how to prevent it?", "Explain volatile keyword"]
                        }
                    ]
                },
                {
                    id: "selenium",
                    name: "Selenium WebDriver",
                    icon: "🌐",
                    totalQuestions: 3,
                    questions: [
                        {
                            id: "selenium-001",
                            question: "What is Selenium WebDriver and how does it work?",
                            difficulty: "Easy",
                            experienceLevel: ["0-2", "3-5"],
                            answer: "Selenium WebDriver is a web automation tool that controls browsers programmatically. It sends HTTP requests to browser drivers (ChromeDriver, GeckoDriver) which translate commands to browser-specific actions. Supports multiple languages and browsers.",
                            companies: ["QA teams", "Automation companies", "E-commerce"],
                            topic: "Selenium Basics",
                            followUp: ["What are the different Selenium components?", "How do you handle different browsers?"]
                        },
                        {
                            id: "selenium-002",
                            question: "Explain different types of waits in Selenium",
                            difficulty: "Medium",
                            experienceLevel: ["0-2", "3-5"],
                            answer: "Implicit Wait: Global timeout for element location. Explicit Wait: Wait for specific conditions using WebDriverWait and ExpectedConditions. Fluent Wait: Configurable polling interval and exceptions to ignore. Avoid Thread.sleep() as it's not dynamic.",
                            companies: ["Automation testing", "Web applications", "E-commerce"],
                            topic: "Selenium Waits",
                            followUp: ["When would you use each type of wait?", "How do you handle dynamic elements?"]
                        },
                        {
                            id: "selenium-003",
                            question: "How do you handle dynamic elements and synchronization issues?",
                            difficulty: "Medium",
                            experienceLevel: ["3-5", "6-8"],
                            answer: "Use explicit waits with expected conditions, implement custom wait conditions, use fluent waits for complex scenarios. Handle AJAX with WebDriverWait. For SPAs, wait for specific elements or JavaScript completion. Implement retry mechanisms and proper exception handling.",
                            companies: ["Modern web applications", "SPA testing", "Complex UI testing"],
                            topic: "Advanced Selenium",
                            followUp: ["How do you test single-page applications?", "What are Page Object Models?"]
                        }
                    ]
                }
            ]
        };

        // Merge TestNG categories with base categories
        baseQuestions.categories = baseQuestions.categories.concat(testngData.categories);
        
        return baseQuestions;
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
                        // Use the category.id if available, otherwise derive from name
                        categoryId: category.id || category.name.toLowerCase().replace(/\s+/g, '-'),
                        categoryName: category.name,
                        category: category.id || category.name.toLowerCase().replace(/\s+/g, '-')
                    });
                });
            }
        });

        return allQuestions;
    }

    // Load paginated questions with filters and search
    async loadQuestionsPage(page = 1, limit = 20, filters = {}) {
        console.log('🔍 DEBUG: DataManager.loadQuestionsPage called with:', { page, limit, filters });
        console.log('🔍 DEBUG: API client status:', {
            hasApiV2Client: !!window.apiV2Client,
            baseUrl: window.apiV2Client?.baseUrl,
            isAvailable: window.apiV2Client ? await window.apiV2Client.isAvailable() : false
        });
        
        try {
            // Try database first using the hybrid method
            if (window.apiV2Client && window.apiV2Client.baseUrl) {
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

                console.log('🔍 DEBUG: Calling getQuestionsHybrid with options:', options);
                const apiResult = await window.apiV2Client.getQuestionsHybrid(options);
                console.log('🔍 DEBUG: getQuestionsHybrid result:', {
                    success: apiResult?.success,
                    source: apiResult?.source,
                    dataLength: apiResult?.data?.length,
                    error: apiResult?.error
                });

                if (apiResult && apiResult.success) {
                    // Convert to legacy format
                    const questions = this.convertDatabaseToLegacyFormat(apiResult.data);

                    console.log(`✅ DataManager: Using ${apiResult.source} data (${apiResult.data.length} questions)`);
                    return {
                        questions: questions,
                        pagination: apiResult.pagination,
                        source: apiResult.source === 'api_v2' ? 'database' : apiResult.source
                    };
                } else {
                    console.error('❌ DataManager: API call failed:', apiResult?.error);
                }
            } else {
                console.error('❌ DataManager: API client not available or no baseUrl');
            }

            // Fallback to local data
            console.log('📁 Using local questions data for pagination');
            console.log('🔍 DEBUG: API failed, falling back to local data. Current state:', {
                hasInterviewQuestions: !!this.interviewQuestions,
                apiClientBaseUrl: window.apiV2Client?.baseUrl,
                filtersApplied: filters
            });
            
            // Load from local if not already loaded
            if (!this.interviewQuestions) {
                console.log('🔍 DEBUG: Loading interview questions from local...');
                await this.loadInterviewQuestions();
            }

            // Get all questions
            const allQuestions = this.getAllQuestions();
            console.log('🔍 DEBUG: All questions retrieved:', {
                count: allQuestions.length,
                sampleQuestion: allQuestions[0] ? {
                    id: allQuestions[0].id,
                    categoryId: allQuestions[0].categoryId,
                    category: allQuestions[0].category,
                    difficulty: allQuestions[0].difficulty
                } : null
            });

            // Apply filters locally
            let filtered = allQuestions;
            console.log('🔍 DEBUG: Starting local filtering with', filtered.length, 'questions');

            if (filters.category && filters.category !== 'all') {
                console.log('🔍 DEBUG: Applying category filter:', filters.category);
                const beforeFilter = filtered.length;
                
                // Check if the selected category exists in our data
                const availableCategories = [...new Set(allQuestions.map(q => q.categoryId || q.category))];
                console.log('🔍 DEBUG: Available categories:', availableCategories);
                
                if (!availableCategories.includes(filters.category)) {
                    console.log('🔍 DEBUG: Selected category not found in data, showing all questions instead');
                    // Don't filter if category doesn't exist - show all questions
                } else {
                    filtered = filtered.filter(q => {
                        const categoryMatch =
                            q.categoryId === filters.category ||
                            q.category === filters.category ||
                            q.categoryName?.toLowerCase().includes(filters.category.toLowerCase()) ||
                            q.categoryId?.toLowerCase().includes(filters.category.toLowerCase());
                        
                        if (!categoryMatch) {
                            console.log('🔍 DEBUG: Question filtered out by category:', {
                                questionId: q.id,
                                questionCategoryId: q.categoryId,
                                questionCategory: q.category,
                                questionCategoryName: q.categoryName,
                                filterCategory: filters.category,
                                match: categoryMatch
                            });
                        }
                        return categoryMatch;
                    });
                }
                
                console.log('🔍 DEBUG: Category filter result:', {
                    before: beforeFilter,
                    after: filtered.length,
                    filterValue: filters.category,
                    categoryExists: availableCategories.includes(filters.category)
                });
            }

            if (filters.difficulty && filters.difficulty !== 'all') {
                console.log('🔍 DEBUG: Applying difficulty filter:', filters.difficulty);
                const beforeFilter = filtered.length;
                filtered = filtered.filter(q => {
                    const match = q.difficulty && q.difficulty.toLowerCase() === filters.difficulty.toLowerCase();
                    if (!match) {
                        console.log('🔍 DEBUG: Question filtered out by difficulty:', {
                            questionId: q.id,
                            questionDifficulty: q.difficulty,
                            filterDifficulty: filters.difficulty,
                            match: match
                        });
                    }
                    return match;
                });
                console.log('🔍 DEBUG: Difficulty filter result:', {
                    before: beforeFilter,
                    after: filtered.length,
                    filterValue: filters.difficulty
                });
            }

            if (filters.experience && filters.experience !== 'all') {
                filtered = filtered.filter(q => {
                    // Check if question has experienceLevel array and includes the selected level
                    if (q.experienceLevel && Array.isArray(q.experienceLevel)) {
                        return q.experienceLevel.includes(filters.experience);
                    }
                    return false;
                });
            }

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter(q =>
                    (q.question && q.question.toLowerCase().includes(searchLower)) ||
                    (q.answer && q.answer.toLowerCase().includes(searchLower)) ||
                    (q.topic && q.topic.toLowerCase().includes(searchLower))
                );
            }

            // Calculate pagination
            const total = filtered.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            const pageQuestions = filtered.slice(start, end);

            console.log('🔍 DEBUG: Final pagination result:', {
                totalFiltered: total,
                totalPages: totalPages,
                currentPage: page,
                pageQuestionsCount: pageQuestions.length,
                start: start,
                end: end
            });

            // Update interviewQuestions with filtered results for rendering
            this.interviewQuestions = {
                categories: [{
                    name: 'Filtered Results',
                    questions: pageQuestions
                }]
            };

            return {
                questions: this.interviewQuestions,
                pagination: {
                    total: total,
                    currentPage: page,
                    totalPages: totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                source: 'local'
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