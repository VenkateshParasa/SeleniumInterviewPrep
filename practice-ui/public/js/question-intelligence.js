// ===================================
// SMART QUESTION INTELLIGENCE SYSTEM
// ===================================
// Provides automatic learning paths and content connections

class QuestionIntelligence {
    constructor() {
        this.conceptDatabase = this.buildConceptDatabase();
        this.difficultyProgression = {
            'Easy': ['Medium'],
            'Medium': ['Hard', 'Easy'], // Can go both ways
            'Hard': ['Medium'] // Review easier concepts
        };

        console.log('🧠 Question Intelligence System initialized');
    }

    // Core concept mapping for all questions
    buildConceptDatabase() {
        return {
            // Java Concepts
            "java-001": {
                mainConcepts: ["string-comparison", "equals-method", "reference-vs-value"],
                relatedConcepts: ["object-methods", "string-behavior", "memory-basics"],
                nextLevelConcepts: ["string-interning", "hashcode-contract", "object-identity"],
                prerequisites: ["java-basics", "object-orientation"],
                difficulty: "Medium",
                learningPath: "java-fundamentals",
                interviewFrequency: 9, // 1-10 scale
                practicalUse: 8
            },

            "java-002": {
                mainConcepts: ["string-mutability", "string-performance", "string-builders"],
                relatedConcepts: ["memory-management", "performance-optimization"],
                nextLevelConcepts: ["string-pooling", "gc-impact", "memory-leaks"],
                prerequisites: ["java-001"],
                difficulty: "Medium",
                learningPath: "java-fundamentals",
                interviewFrequency: 8,
                practicalUse: 9
            },

            "java-003": {
                mainConcepts: ["exception-handling", "checked-exceptions", "unchecked-exceptions"],
                relatedConcepts: ["error-management", "try-catch", "finally-blocks"],
                nextLevelConcepts: ["custom-exceptions", "exception-chaining", "resource-management"],
                prerequisites: ["java-basics"],
                difficulty: "Medium",
                learningPath: "java-fundamentals",
                interviewFrequency: 7,
                practicalUse: 10
            },

            "java-004": {
                mainConcepts: ["collections-framework", "list-interface", "set-interface", "map-interface"],
                relatedConcepts: ["data-structures", "generics", "iteration"],
                nextLevelConcepts: ["collection-performance", "custom-collections", "concurrent-collections"],
                prerequisites: ["java-basics", "generics"],
                difficulty: "Medium",
                learningPath: "java-collections",
                interviewFrequency: 9,
                practicalUse: 10
            },

            "java-005": {
                mainConcepts: ["multithreading", "synchronization", "thread-safety"],
                relatedConcepts: ["concurrency", "parallel-processing", "thread-states"],
                nextLevelConcepts: ["deadlock-prevention", "thread-pools", "concurrent-utilities"],
                prerequisites: ["java-004"],
                difficulty: "Hard",
                learningPath: "java-concurrency",
                interviewFrequency: 8,
                practicalUse: 7
            },

            // Follow-up questions (java-006 to java-015)
            "java-006": {
                mainConcepts: ["string-interning", "string-pool", "memory-optimization"],
                relatedConcepts: ["jvm-internals", "memory-management", "string-behavior"],
                nextLevelConcepts: ["gc-tuning", "memory-profiling", "performance-optimization"],
                prerequisites: ["java-001"],
                difficulty: "Medium",
                learningPath: "java-advanced",
                interviewFrequency: 6,
                practicalUse: 7
            },

            "java-007": {
                mainConcepts: ["equals-contract", "hashcode-contract", "object-comparison"],
                relatedConcepts: ["object-methods", "collections-behavior", "hash-tables"],
                nextLevelConcepts: ["hashmap-internals", "collision-handling", "performance-implications"],
                prerequisites: ["java-001", "java-004"],
                difficulty: "Medium",
                learningPath: "java-advanced",
                interviewFrequency: 7,
                practicalUse: 8
            },

            // Selenium Concepts
            "selenium-001": {
                mainConcepts: ["webdriver-architecture", "browser-automation", "selenium-components"],
                relatedConcepts: ["web-testing", "automation-basics", "browser-drivers"],
                nextLevelConcepts: ["advanced-locators", "page-objects", "test-frameworks"],
                prerequisites: ["web-basics", "testing-concepts"],
                difficulty: "Easy",
                learningPath: "selenium-basics",
                interviewFrequency: 8,
                practicalUse: 9
            },

            "selenium-002": {
                mainConcepts: ["selenium-waits", "synchronization", "timing-issues"],
                relatedConcepts: ["dynamic-content", "ajax-handling", "performance-testing"],
                nextLevelConcepts: ["custom-waits", "fluent-waits", "timeout-strategies"],
                prerequisites: ["selenium-001"],
                difficulty: "Medium",
                learningPath: "selenium-intermediate",
                interviewFrequency: 9,
                practicalUse: 10
            },

            // TestNG Concepts
            "testng-001": {
                mainConcepts: ["testng-framework", "test-annotations", "test-configuration"],
                relatedConcepts: ["junit-comparison", "test-organization", "test-lifecycle"],
                nextLevelConcepts: ["advanced-annotations", "test-dependencies", "parallel-execution"],
                prerequisites: ["java-basics", "testing-concepts"],
                difficulty: "Easy",
                learningPath: "testng-basics",
                interviewFrequency: 7,
                practicalUse: 9
            }
        };
    }

    // ===================================
    // SMART RECOMMENDATION ENGINE
    // ===================================

    // Get intelligent follow-up suggestions
    getSmartFollowUps(questionId, options = {}) {
        const {
            maxSuggestions = 5,
            includeReview = true,
            includeAdvanced = true,
            userLevel = 'intermediate'
        } = options;

        const currentQuestion = this.conceptDatabase[questionId];
        if (!currentQuestion) {
            console.warn(`No intelligence data for question: ${questionId}`);
            return [];
        }

        const suggestions = [];

        // 1. Direct next-level concepts (primary recommendations)
        const nextLevelQuestions = this.findQuestionsByConcepts(
            currentQuestion.nextLevelConcepts,
            { exclude: [questionId] }
        );
        suggestions.push(...nextLevelQuestions.map(q => ({
            ...q,
            reason: 'next-level',
            priority: 10,
            description: 'Natural progression from current topic'
        })));

        // 2. Related concepts in same difficulty (lateral learning)
        const relatedQuestions = this.findQuestionsByConcepts(
            currentQuestion.relatedConcepts,
            {
                exclude: [questionId],
                difficulty: currentQuestion.difficulty
            }
        );
        suggestions.push(...relatedQuestions.map(q => ({
            ...q,
            reason: 'related-concepts',
            priority: 8,
            description: 'Related concepts at same level'
        })));

        // 3. Same learning path progression
        const pathQuestions = this.getNextInLearningPath(questionId);
        suggestions.push(...pathQuestions.map(q => ({
            ...q,
            reason: 'learning-path',
            priority: 9,
            description: 'Next step in structured learning path'
        })));

        // 4. Review prerequisites (if struggling)
        if (includeReview) {
            const reviewQuestions = this.findQuestionsByConcepts(
                currentQuestion.prerequisites,
                { exclude: [questionId] }
            );
            suggestions.push(...reviewQuestions.map(q => ({
                ...q,
                reason: 'review',
                priority: 6,
                description: 'Review fundamental concepts'
            })));
        }

        // 5. High-frequency interview questions
        const practicalQuestions = this.findHighValueQuestions(currentQuestion);
        suggestions.push(...practicalQuestions.map(q => ({
            ...q,
            reason: 'high-value',
            priority: 7,
            description: 'Frequently asked in interviews'
        })));

        // Sort by priority and remove duplicates
        const uniqueSuggestions = this.deduplicateAndRank(suggestions);

        return uniqueSuggestions.slice(0, maxSuggestions);
    }

    // Find questions that teach specific concepts
    findQuestionsByConcepts(concepts, options = {}) {
        const { exclude = [], difficulty = null, maxResults = 3 } = options;
        const matches = [];

        for (const [questionId, data] of Object.entries(this.conceptDatabase)) {
            if (exclude.includes(questionId)) continue;
            if (difficulty && data.difficulty !== difficulty) continue;

            // Check if question teaches any of the target concepts
            const teachesConcepts = concepts.some(concept =>
                data.mainConcepts.includes(concept) ||
                data.relatedConcepts.includes(concept)
            );

            if (teachesConcepts) {
                matches.push({
                    questionId,
                    ...data,
                    conceptMatch: this.calculateConceptOverlap(concepts, data)
                });
            }
        }

        // Sort by concept relevance
        return matches
            .sort((a, b) => b.conceptMatch - a.conceptMatch)
            .slice(0, maxResults);
    }

    // Get next questions in structured learning path
    getNextInLearningPath(questionId) {
        const currentQuestion = this.conceptDatabase[questionId];
        if (!currentQuestion) return [];

        const samePath = Object.entries(this.conceptDatabase)
            .filter(([id, data]) =>
                id !== questionId &&
                data.learningPath === currentQuestion.learningPath
            )
            .sort((a, b) => {
                // Sort by difficulty progression
                const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                return difficultyOrder[a[1].difficulty] - difficultyOrder[b[1].difficulty];
            });

        return samePath.slice(0, 2).map(([questionId, data]) => ({
            questionId,
            ...data
        }));
    }

    // Find high-value questions (frequent + practical)
    findHighValueQuestions(currentQuestion) {
        const highValue = Object.entries(this.conceptDatabase)
            .filter(([id, data]) => {
                const valueScore = data.interviewFrequency + data.practicalUse;
                return valueScore >= 15; // High-value threshold
            })
            .sort((a, b) => {
                const scoreA = a[1].interviewFrequency + a[1].practicalUse;
                const scoreB = b[1].interviewFrequency + b[1].practicalUse;
                return scoreB - scoreA;
            });

        return highValue.slice(0, 2).map(([questionId, data]) => ({
            questionId,
            ...data
        }));
    }

    // ===================================
    // SEMANTIC SEARCH CAPABILITIES
    // ===================================

    // Intelligent search with concept understanding
    semanticSearch(query, options = {}) {
        const {
            maxResults = 10,
            includeRelated = true,
            difficulty = null
        } = options;

        const queryLower = query.toLowerCase();
        const results = [];

        // 1. Direct concept matches
        for (const [questionId, data] of Object.entries(this.conceptDatabase)) {
            if (difficulty && data.difficulty !== difficulty) continue;

            const conceptScore = this.calculateQueryRelevance(queryLower, data);
            if (conceptScore > 0) {
                results.push({
                    questionId,
                    ...data,
                    relevanceScore: conceptScore,
                    matchType: 'concept'
                });
            }
        }

        // 2. Add related questions for top matches
        if (includeRelated && results.length > 0) {
            const topMatch = results.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
            const related = this.getSmartFollowUps(topMatch.questionId, { maxSuggestions: 3 });

            results.push(...related.map(r => ({
                ...r,
                matchType: 'related',
                relevanceScore: r.priority / 10
            })));
        }

        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, maxResults);
    }

    // Calculate how well a query matches question concepts
    calculateQueryRelevance(query, questionData) {
        let score = 0;

        // Check main concepts (highest weight)
        questionData.mainConcepts.forEach(concept => {
            if (query.includes(concept.replace('-', ' '))) {
                score += 10;
            }
        });

        // Check related concepts (medium weight)
        questionData.relatedConcepts.forEach(concept => {
            if (query.includes(concept.replace('-', ' '))) {
                score += 5;
            }
        });

        // Check learning path (low weight)
        if (query.includes(questionData.learningPath.replace('-', ' '))) {
            score += 3;
        }

        return score;
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    calculateConceptOverlap(targetConcepts, questionData) {
        const allQuestionConcepts = [
            ...questionData.mainConcepts,
            ...questionData.relatedConcepts
        ];

        const overlap = targetConcepts.filter(concept =>
            allQuestionConcepts.includes(concept)
        ).length;

        return overlap / targetConcepts.length;
    }

    deduplicateAndRank(suggestions) {
        const seen = new Set();
        const unique = [];

        suggestions
            .sort((a, b) => b.priority - a.priority)
            .forEach(suggestion => {
                if (!seen.has(suggestion.questionId)) {
                    seen.add(suggestion.questionId);
                    unique.push(suggestion);
                }
            });

        return unique;
    }

    // Get learning analytics
    getQuestionAnalytics(questionId) {
        const data = this.conceptDatabase[questionId];
        if (!data) return null;

        return {
            difficulty: data.difficulty,
            interviewImportance: data.interviewFrequency,
            practicalValue: data.practicalUse,
            learningPath: data.learningPath,
            conceptsCount: data.mainConcepts.length,
            prerequisites: data.prerequisites,
            estimatedStudyTime: this.estimateStudyTime(data)
        };
    }

    estimateStudyTime(questionData) {
        const baseTime = {
            'Easy': 15,
            'Medium': 25,
            'Hard': 40
        };

        const conceptComplexity = questionData.mainConcepts.length * 5;
        return baseTime[questionData.difficulty] + conceptComplexity;
    }

    // Export intelligence data for API
    exportIntelligence() {
        return {
            conceptDatabase: this.conceptDatabase,
            totalQuestions: Object.keys(this.conceptDatabase).length,
            learningPaths: [...new Set(Object.values(this.conceptDatabase).map(d => d.learningPath))],
            difficultyDistribution: this.getDifficultyDistribution()
        };
    }

    getDifficultyDistribution() {
        const distribution = { Easy: 0, Medium: 0, Hard: 0 };
        Object.values(this.conceptDatabase).forEach(data => {
            distribution[data.difficulty]++;
        });
        return distribution;
    }
}

// ===================================
// INTEGRATION WITH EXISTING SYSTEM
// ===================================

// Initialize the intelligence system
const questionIntelligence = new QuestionIntelligence();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QuestionIntelligence = QuestionIntelligence;
    window.questionIntelligence = questionIntelligence;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        QuestionIntelligence,
        questionIntelligence
    };
}

console.log('🧠 Smart Question Intelligence System loaded successfully!');