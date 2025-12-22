// Adaptive Learning Engine
// Personalized study recommendations and learning algorithms
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class AdaptiveLearningEngine {
    constructor(progressTracker) {
        this.progressTracker = progressTracker;
        this.userProfile = null;
        this.learningModel = null;
        this.recommendations = [];
        this.difficultyAdjustments = new Map();

        // Learning algorithm configurations
        this.algorithms = {
            spaced_repetition: new SpacedRepetitionAlgorithm(),
            difficulty_adaptation: new DifficultyAdaptationAlgorithm(),
            collaborative_filtering: new CollaborativeFilteringAlgorithm(),
            content_based: new ContentBasedAlgorithm()
        };

        // User learning patterns
        this.learningPatterns = {
            retention_rates: new Map(),
            difficulty_progression: [],
            time_patterns: [],
            category_preferences: new Map(),
            mistake_patterns: new Map()
        };

        this.initialize();
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    async initialize() {
        await this.buildUserProfile();
        await this.trainLearningModel();
        this.startAdaptiveLearning();

        console.log('🧠 Adaptive Learning Engine initialized');
    }

    async buildUserProfile() {
        try {
            const progressData = await this.progressTracker.getCurrentProgress();

            this.userProfile = {
                userId: progressData?.userId || 'anonymous',
                experienceLevel: this.detectExperienceLevel(progressData),
                learningStyle: this.detectLearningStyle(progressData),
                strengths: this.analyzeStrengths(progressData),
                weaknesses: this.analyzeWeaknesses(progressData),
                studyPatterns: this.analyzeStudyPatterns(progressData),
                goals: this.extractGoals(progressData),
                preferences: this.analyzePreferences(progressData)
            };

            console.log('👤 User profile built:', this.userProfile);

        } catch (error) {
            console.error('❌ Failed to build user profile:', error);
            this.userProfile = this.getDefaultProfile();
        }
    }

    async trainLearningModel() {
        // Initialize learning model with user data
        this.learningModel = {
            retention_curve: this.calculateRetentionCurve(),
            difficulty_curve: this.calculateDifficultyCurve(),
            time_effectiveness: this.calculateTimeEffectiveness(),
            category_affinity: this.calculateCategoryAffinity(),
            learning_velocity: this.calculateLearningVelocity()
        };

        console.log('📊 Learning model trained:', this.learningModel);
    }

    startAdaptiveLearning() {
        // Generate initial recommendations
        this.generateRecommendations();

        // Setup periodic model updates
        setInterval(() => {
            this.updateLearningModel();
            this.generateRecommendations();
        }, 5 * 60 * 1000); // Every 5 minutes

        // Setup real-time adaptation
        this.setupRealTimeAdaptation();
    }

    // ===================================
    // PERSONALIZED RECOMMENDATIONS
    // ===================================

    async generateRecommendations() {
        try {
            const recommendations = [];

            // Generate different types of recommendations
            recommendations.push(...await this.generateContentRecommendations());
            recommendations.push(...await this.generateScheduleRecommendations());
            recommendations.push(...await this.generateDifficultyRecommendations());
            recommendations.push(...await this.generateRevisionRecommendations());

            // Rank recommendations by relevance
            this.recommendations = this.rankRecommendations(recommendations);

            console.log(`💡 Generated ${this.recommendations.length} personalized recommendations`);

            // Notify UI about new recommendations
            this.broadcastRecommendations();

        } catch (error) {
            console.error('❌ Failed to generate recommendations:', error);
        }
    }

    async generateContentRecommendations() {
        const recommendations = [];
        const profile = this.userProfile;

        // Recommend based on weaknesses
        for (const [category, score] of profile.weaknesses) {
            if (score > 0.3) { // Significant weakness
                recommendations.push({
                    type: 'content',
                    subtype: 'weakness_focus',
                    category,
                    priority: 'high',
                    confidence: score,
                    title: `Focus on ${category} questions`,
                    description: `You've struggled with ${category} topics. Practice more questions in this area.`,
                    action: {
                        type: 'study_category',
                        params: { category, difficulty: 'basic' }
                    },
                    estimatedTime: this.estimateStudyTime(category, 'basic'),
                    expectedImprovement: this.estimateImprovement(category)
                });
            }
        }

        // Recommend based on learning style
        if (profile.learningStyle === 'visual') {
            recommendations.push({
                type: 'content',
                subtype: 'learning_style',
                priority: 'medium',
                confidence: 0.8,
                title: 'Visual learning materials',
                description: 'Questions with diagrams and code examples work best for you.',
                action: {
                    type: 'filter_visual_content',
                    params: { includeCode: true, includeDiagrams: true }
                }
            });
        }

        // Recommend next logical progression
        const nextCategory = this.calculateNextLogicalCategory();
        if (nextCategory) {
            recommendations.push({
                type: 'content',
                subtype: 'progression',
                category: nextCategory.name,
                priority: 'medium',
                confidence: nextCategory.confidence,
                title: `Ready for ${nextCategory.name}`,
                description: `Based on your progress, you're ready to advance to ${nextCategory.name}.`,
                action: {
                    type: 'study_category',
                    params: { category: nextCategory.name, difficulty: nextCategory.difficulty }
                },
                estimatedTime: this.estimateStudyTime(nextCategory.name, nextCategory.difficulty)
            });
        }

        return recommendations;
    }

    async generateScheduleRecommendations() {
        const recommendations = [];
        const profile = this.userProfile;

        // Optimal study time recommendations
        const optimalTimes = this.calculateOptimalStudyTimes();
        if (optimalTimes.length > 0) {
            recommendations.push({
                type: 'schedule',
                subtype: 'optimal_timing',
                priority: 'medium',
                confidence: 0.9,
                title: 'Optimal study times',
                description: `You learn best at ${optimalTimes.join(', ')}. Schedule your study sessions accordingly.`,
                action: {
                    type: 'schedule_study',
                    params: { preferredTimes: optimalTimes }
                }
            });
        }

        // Session length recommendations
        const optimalDuration = this.calculateOptimalSessionDuration();
        recommendations.push({
            type: 'schedule',
            subtype: 'session_length',
            priority: 'low',
            confidence: 0.7,
            title: `${optimalDuration}-minute study sessions`,
            description: `Based on your attention patterns, ${optimalDuration}-minute sessions work best for you.`,
            action: {
                type: 'adjust_session_length',
                params: { duration: optimalDuration }
            }
        });

        // Break recommendations
        if (this.detectStudyFatigue()) {
            recommendations.push({
                type: 'schedule',
                subtype: 'break_needed',
                priority: 'high',
                confidence: 0.95,
                title: 'Take a break',
                description: 'Your performance is declining. Take a 15-minute break to maintain effectiveness.',
                action: {
                    type: 'suggest_break',
                    params: { duration: 15, activity: 'stretching' }
                }
            });
        }

        return recommendations;
    }

    async generateDifficultyRecommendations() {
        const recommendations = [];
        const profile = this.userProfile;

        // Difficulty progression recommendations
        for (const [category, progress] of profile.strengths) {
            if (progress > 0.8) { // Strong in this category
                const nextDifficulty = this.calculateNextDifficulty(category);
                if (nextDifficulty) {
                    recommendations.push({
                        type: 'difficulty',
                        subtype: 'progression',
                        category,
                        priority: 'medium',
                        confidence: 0.85,
                        title: `Ready for ${nextDifficulty} ${category}`,
                        description: `You've mastered the basics. Time to tackle ${nextDifficulty} level questions.`,
                        action: {
                            type: 'increase_difficulty',
                            params: { category, difficulty: nextDifficulty }
                        }
                    });
                }
            }
        }

        // Adaptive difficulty recommendations
        const currentSession = this.getCurrentSessionPerformance();
        if (currentSession.accuracy > 0.9) {
            recommendations.push({
                type: 'difficulty',
                subtype: 'real_time_increase',
                priority: 'high',
                confidence: 0.9,
                title: 'Increase difficulty',
                description: 'You\'re doing great! Let\'s make it more challenging.',
                action: {
                    type: 'increase_session_difficulty',
                    params: { increment: 1 }
                }
            });
        } else if (currentSession.accuracy < 0.5) {
            recommendations.push({
                type: 'difficulty',
                subtype: 'real_time_decrease',
                priority: 'high',
                confidence: 0.95,
                title: 'Simplify content',
                description: 'Let\'s focus on fundamentals to build your confidence.',
                action: {
                    type: 'decrease_session_difficulty',
                    params: { decrement: 1 }
                }
            });
        }

        return recommendations;
    }

    async generateRevisionRecommendations() {
        const recommendations = [];

        // Spaced repetition recommendations
        const itemsForReview = this.algorithms.spaced_repetition.getItemsDueForReview();
        if (itemsForReview.length > 0) {
            recommendations.push({
                type: 'revision',
                subtype: 'spaced_repetition',
                priority: 'high',
                confidence: 0.95,
                title: `Review ${itemsForReview.length} questions`,
                description: 'These questions are due for review based on spaced repetition.',
                action: {
                    type: 'review_questions',
                    params: { questionIds: itemsForReview.map(item => item.id) }
                },
                estimatedTime: itemsForReview.length * 2 // 2 minutes per question
            });
        }

        // Weak area revision
        const weakAreas = this.identifyWeakAreas();
        for (const area of weakAreas) {
            recommendations.push({
                type: 'revision',
                subtype: 'weak_area',
                category: area.category,
                priority: 'medium',
                confidence: area.confidence,
                title: `Revise ${area.category} concepts`,
                description: `Your accuracy in ${area.category} has declined. A quick revision will help.`,
                action: {
                    type: 'revise_category',
                    params: { category: area.category, focusOnMistakes: true }
                }
            });
        }

        return recommendations;
    }

    // ===================================
    // ADAPTIVE ALGORITHMS
    // ===================================

    rankRecommendations(recommendations) {
        // Score recommendations based on multiple factors
        return recommendations
            .map(rec => ({
                ...rec,
                score: this.calculateRecommendationScore(rec)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Keep top 10 recommendations
    }

    calculateRecommendationScore(recommendation) {
        let score = 0;

        // Priority weight
        const priorityWeights = { high: 3, medium: 2, low: 1 };
        score += priorityWeights[recommendation.priority] || 1;

        // Confidence weight
        score += recommendation.confidence * 2;

        // Recency weight (favor recent performance data)
        if (recommendation.type === 'difficulty' && recommendation.subtype.includes('real_time')) {
            score += 2;
        }

        // Impact weight (estimated improvement)
        if (recommendation.expectedImprovement) {
            score += recommendation.expectedImprovement;
        }

        // Time efficiency weight
        if (recommendation.estimatedTime && recommendation.estimatedTime < 30) {
            score += 1; // Favor quick wins
        }

        return score;
    }

    // ===================================
    // REAL-TIME ADAPTATION
    // ===================================

    setupRealTimeAdaptation() {
        // Monitor user interactions for real-time adaptation
        document.addEventListener('questionAnswered', (event) => {
            this.handleQuestionResponse(event.detail);
        });

        document.addEventListener('studySessionStarted', (event) => {
            this.handleSessionStart(event.detail);
        });

        document.addEventListener('studySessionEnded', (event) => {
            this.handleSessionEnd(event.detail);
        });
    }

    handleQuestionResponse(responseData) {
        const { questionId, category, difficulty, correct, timeSpent, attempts } = responseData;

        // Update learning patterns
        this.updateRetentionRate(questionId, correct);
        this.updateDifficultyPerformance(category, difficulty, correct);
        this.updateTimeEfficiency(category, timeSpent, correct);

        // Real-time difficulty adjustment
        if (this.shouldAdjustDifficulty(responseData)) {
            this.adjustDifficultyInRealTime(category, correct);
        }

        // Update spaced repetition schedule
        this.algorithms.spaced_repetition.updateItem(questionId, correct, timeSpent);

        // Generate immediate recommendations if needed
        if (this.needsImmediateRecommendation(responseData)) {
            this.generateImmediateRecommendation(responseData);
        }
    }

    shouldAdjustDifficulty(responseData) {
        const recentPerformance = this.getRecentPerformance(responseData.category, 5);

        if (recentPerformance.length >= 3) {
            const accuracy = recentPerformance.filter(p => p.correct).length / recentPerformance.length;
            return accuracy > 0.9 || accuracy < 0.4;
        }

        return false;
    }

    adjustDifficultyInRealTime(category, correct) {
        const currentAdjustment = this.difficultyAdjustments.get(category) || 0;

        if (correct) {
            // Increase difficulty slightly
            this.difficultyAdjustments.set(category, Math.min(currentAdjustment + 0.1, 1.0));
        } else {
            // Decrease difficulty slightly
            this.difficultyAdjustments.set(category, Math.max(currentAdjustment - 0.2, -1.0));
        }

        // Broadcast difficulty change
        this.broadcastDifficultyAdjustment(category, this.difficultyAdjustments.get(category));
    }

    // ===================================
    // LEARNING ANALYTICS
    // ===================================

    detectExperienceLevel(progressData) {
        if (!progressData) return 'beginner';

        const questionsStudied = progressData.statistics?.questionsStudied?.length || 0;
        const categoryCount = Object.keys(progressData.statistics?.categoriesExplored || {}).length;

        if (questionsStudied < 20 || categoryCount < 2) return 'beginner';
        if (questionsStudied < 100 || categoryCount < 4) return 'intermediate';
        return 'advanced';
    }

    detectLearningStyle(progressData) {
        if (!progressData) return 'mixed';

        // Simplified learning style detection based on progress patterns
        return 'mixed';
    }

    analyzeStrengths(progressData) {
        const strengths = new Map();

        if (progressData?.statistics?.categoriesExplored) {
            for (const [category, count] of Object.entries(progressData.statistics.categoriesExplored)) {
                // Calculate strength based on questions studied and accuracy
                const strength = Math.min(count / 20, 1.0); // Normalize to 0-1
                strengths.set(category, strength);
            }
        }

        return strengths;
    }

    analyzeWeaknesses(progressData) {
        const weaknesses = new Map();
        const strengths = this.analyzeStrengths(progressData);

        // Invert strengths to find weaknesses
        for (const [category, strength] of strengths) {
            if (strength < 0.6) {
                weaknesses.set(category, 1.0 - strength);
            }
        }

        return weaknesses;
    }

    calculateRetentionCurve() {
        // Implement Ebbinghaus forgetting curve calculation
        return {
            initialRetention: 0.8,
            decayRate: 0.2,
            reviewBoost: 0.3
        };
    }

    calculateOptimalStudyTimes() {
        // Analyze when user performs best
        const performanceByHour = new Map();

        // This would analyze historical performance data
        // For now, return common optimal times
        return ['09:00', '14:00', '19:00'];
    }

    calculateOptimalSessionDuration() {
        // Analyze user attention patterns
        // Return optimal duration in minutes
        return 25; // Pomodoro technique default
    }

    // ===================================
    // RECOMMENDATION ENGINE
    // ===================================

    getRecommendations(count = 5) {
        return this.recommendations.slice(0, count);
    }

    getRecommendationsByType(type) {
        return this.recommendations.filter(rec => rec.type === type);
    }

    executeRecommendation(recommendationId) {
        const recommendation = this.recommendations.find(rec => rec.id === recommendationId);
        if (!recommendation) return;


        // Execute the recommendation action
        this.executeRecommendationAction(recommendation.action);
    }

    executeRecommendationAction(action) {
        switch (action.type) {
            case 'study_category':
                this.triggerCategoryStudy(action.params);
                break;
            case 'increase_difficulty':
                this.triggerDifficultyIncrease(action.params);
                break;
            case 'review_questions':
                this.triggerQuestionReview(action.params);
                break;
            case 'suggest_break':
                this.triggerBreakSuggestion(action.params);
                break;
        }
    }

    triggerCategoryStudy(params) {
        document.dispatchEvent(new CustomEvent('adaptiveLearning.studyCategory', {
            detail: params
        }));
    }

    triggerDifficultyIncrease(params) {
        document.dispatchEvent(new CustomEvent('adaptiveLearning.adjustDifficulty', {
            detail: params
        }));
    }

    triggerQuestionReview(params) {
        document.dispatchEvent(new CustomEvent('adaptiveLearning.reviewQuestions', {
            detail: params
        }));
    }

    triggerBreakSuggestion(params) {
        document.dispatchEvent(new CustomEvent('adaptiveLearning.suggestBreak', {
            detail: params
        }));
    }

    // ===================================
    // BROADCASTING & EVENTS
    // ===================================

    broadcastRecommendations() {
        document.dispatchEvent(new CustomEvent('adaptiveLearning.recommendationsUpdated', {
            detail: {
                recommendations: this.recommendations,
                profile: this.userProfile
            }
        }));
    }

    broadcastDifficultyAdjustment(category, adjustment) {
        document.dispatchEvent(new CustomEvent('adaptiveLearning.difficultyAdjusted', {
            detail: {
                category,
                adjustment,
                timestamp: new Date().toISOString()
            }
        }));
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    getDefaultProfile() {
        return {
            userId: 'anonymous',
            experienceLevel: 'beginner',
            learningStyle: 'mixed',
            strengths: new Map(),
            weaknesses: new Map(),
            studyPatterns: {},
            goals: [],
            preferences: {}
        };
    }

    getCurrentSessionPerformance() {
        // This would analyze current session data
        return {
            accuracy: 0.75,
            timeEfficiency: 0.8,
            questionsAnswered: 5
        };
    }

    getRecentPerformance(category, count) {
        // This would return recent performance data
        return [];
    }

    updateLearningModel() {
        // Periodically retrain the learning model
        this.trainLearningModel();
    }
}

// ===================================
// SPECIALIZED ALGORITHMS
// ===================================

class SpacedRepetitionAlgorithm {
    constructor() {
        this.items = new Map();
        this.intervals = [1, 3, 7, 14, 30, 90]; // Days
    }

    updateItem(itemId, correct, timeSpent) {
        const item = this.items.get(itemId) || {
            id: itemId,
            interval: 1,
            nextReview: new Date(),
            correctCount: 0,
            totalAttempts: 0
        };

        item.totalAttempts++;
        if (correct) {
            item.correctCount++;
            item.interval = Math.min(item.interval * 2, 90);
        } else {
            item.interval = Math.max(item.interval * 0.5, 1);
        }

        item.nextReview = new Date(Date.now() + item.interval * 24 * 60 * 60 * 1000);
        this.items.set(itemId, item);
    }

    getItemsDueForReview() {
        const now = new Date();
        return Array.from(this.items.values())
            .filter(item => item.nextReview <= now);
    }
}

class DifficultyAdaptationAlgorithm {
    calculateTargetDifficulty(userPerformance) {
        // Aim for 70-80% success rate
        const targetAccuracy = 0.75;
        const currentAccuracy = userPerformance.accuracy;

        if (currentAccuracy > 0.85) return 'increase';
        if (currentAccuracy < 0.65) return 'decrease';
        return 'maintain';
    }
}

class CollaborativeFilteringAlgorithm {
    findSimilarUsers(userProfile) {
        // Find users with similar learning patterns
        // This would use cosine similarity or other metrics
        return [];
    }
}

class ContentBasedAlgorithm {
    recommendSimilarContent(studiedItems) {
        // Recommend content similar to what user has studied
        return [];
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.AdaptiveLearningEngine = AdaptiveLearningEngine;
}