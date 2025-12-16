// Analytics and Monitoring System
// User behavior tracking and performance monitoring
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class AnalyticsManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.events = [];
        this.pageViews = [];
        this.performanceMetrics = [];
        this.userBehavior = {
            interactions: [],
            navigation: [],
            timeOnPage: {},
            scrollDepth: {},
            errors: []
        };

        this.config = {
            maxEvents: 1000,
            batchSize: 20,
            flushInterval: 30000, // 30 seconds
            enabledEvents: {
                pageViews: true,
                clicks: true,
                formSubmissions: true,
                errors: true,
                performance: true,
                customEvents: true
            }
        };

        this.isOnline = navigator.onLine;
        this.pendingBatches = [];

        this.initialize();
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    initialize() {
        this.setupEventListeners();
        this.startPerformanceMonitoring();
        this.setupFlushTimer();
        this.trackPageView();

        // Load stored events
        this.loadStoredEvents();

        console.log('📊 Analytics Manager initialized');
    }

    setupEventListeners() {
        // Page visibility tracking
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Click tracking
        if (this.config.enabledEvents.clicks) {
            document.addEventListener('click', (e) => {
                this.trackClick(e);
            });
        }

        // Form submission tracking
        if (this.config.enabledEvents.formSubmissions) {
            document.addEventListener('submit', (e) => {
                this.trackFormSubmission(e);
            });
        }

        // Error tracking
        if (this.config.enabledEvents.errors) {
            window.addEventListener('error', (e) => {
                this.trackError(e);
            });

            window.addEventListener('unhandledrejection', (e) => {
                this.trackUnhandledRejection(e);
            });
        }

        // Navigation tracking
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });

        // Online/offline tracking
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushPendingBatches();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Scroll depth tracking
        this.setupScrollTracking();
    }

    setupScrollTracking() {
        let maxScroll = 0;
        const trackScroll = this.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.userBehavior.scrollDepth[window.location.pathname] = maxScroll;

                // Track milestone scrolls
                const milestones = [25, 50, 75, 90];
                milestones.forEach(milestone => {
                    if (maxScroll >= milestone && !this.scrollMilestones?.[milestone]) {
                        if (!this.scrollMilestones) this.scrollMilestones = {};
                        this.scrollMilestones[milestone] = true;
                        this.trackEvent('scroll_milestone', {
                            milestone,
                            page: window.location.pathname
                        });
                    }
                });
            }
        }, 1000);

        window.addEventListener('scroll', trackScroll);
    }

    // ===================================
    // EVENT TRACKING
    // ===================================

    trackEvent(eventName, properties = {}, options = {}) {
        if (!this.config.enabledEvents.customEvents) return;

        const event = {
            id: this.generateEventId(),
            sessionId: this.sessionId,
            userId: this.userId,
            eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                pathname: window.location.pathname,
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                ...options.additionalProperties
            },
            metadata: {
                source: 'analytics_manager',
                version: '1.0.0',
                platform: this.detectPlatform()
            }
        };

        this.events.push(event);
        this.trimEvents();

        console.log(`📊 Event tracked: ${eventName}`, event);

        // Auto-flush if batch is full
        if (this.events.length >= this.config.batchSize) {
            this.flush();
        }
    }

    trackPageView() {
        if (!this.config.enabledEvents.pageViews) return;

        const pageView = {
            id: this.generateEventId(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            pathname: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            loadTime: this.getPageLoadTime()
        };

        this.pageViews.push(pageView);
        this.trackEvent('page_view', pageView);

        // Start time tracking for this page
        this.pageStartTime = performance.now();
    }

    trackClick(event) {
        const element = event.target;
        const clickData = {
            elementType: element.tagName.toLowerCase(),
            elementId: element.id || null,
            elementClass: element.className || null,
            elementText: element.textContent?.substring(0, 100) || null,
            x: event.clientX,
            y: event.clientY,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey
        };

        this.trackEvent('click', clickData);

        // Track button interactions separately
        if (element.tagName.toLowerCase() === 'button' || element.type === 'button') {
            this.trackEvent('button_click', {
                buttonText: element.textContent,
                buttonId: element.id,
                ...clickData
            });
        }
    }

    trackFormSubmission(event) {
        const form = event.target;
        const formData = new FormData(form);
        const fields = {};

        // Collect non-sensitive form data
        for (let [key, value] of formData.entries()) {
            // Skip sensitive fields
            if (!this.isSensitiveField(key)) {
                fields[key] = typeof value === 'string' ? value.substring(0, 100) : '[file]';
            }
        }

        this.trackEvent('form_submission', {
            formId: form.id || null,
            formAction: form.action || null,
            formMethod: form.method || 'get',
            fieldCount: Object.keys(fields).length,
            fields: fields
        });
    }

    trackError(errorEvent) {
        const errorData = {
            message: errorEvent.message,
            filename: errorEvent.filename,
            lineno: errorEvent.lineno,
            colno: errorEvent.colno,
            stack: errorEvent.error?.stack,
            userAgent: navigator.userAgent
        };

        this.userBehavior.errors.push(errorData);
        this.trackEvent('javascript_error', errorData);
    }

    trackUnhandledRejection(event) {
        const rejectionData = {
            reason: event.reason?.toString() || 'Unknown rejection',
            stack: event.reason?.stack || null
        };

        this.trackEvent('unhandled_rejection', rejectionData);
    }

    // ===================================
    // USER BEHAVIOR ANALYSIS
    // ===================================

    trackUserJourney(step, metadata = {}) {
        const journeyEvent = {
            step,
            timestamp: new Date().toISOString(),
            sessionDuration: this.getSessionDuration(),
            metadata
        };

        this.userBehavior.navigation.push(journeyEvent);
        this.trackEvent('user_journey_step', journeyEvent);
    }

    trackEngagement(type, data = {}) {
        const engagementData = {
            type,
            timeOnPage: this.getTimeOnCurrentPage(),
            scrollDepth: this.userBehavior.scrollDepth[window.location.pathname] || 0,
            interactionCount: this.getUserInteractionCount(),
            ...data
        };

        this.trackEvent('user_engagement', engagementData);
    }

    trackConversion(goal, value = null, metadata = {}) {
        const conversionData = {
            goal,
            value,
            sessionDuration: this.getSessionDuration(),
            pageViews: this.pageViews.length,
            previousPage: this.getPreviousPage(),
            ...metadata
        };

        this.trackEvent('conversion', conversionData);
        console.log(`🎯 Conversion tracked: ${goal}`, conversionData);
    }

    // ===================================
    // PERFORMANCE MONITORING
    // ===================================

    startPerformanceMonitoring() {
        if (!this.config.enabledEvents.performance) return;

        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();

        // Monitor resource loading
        this.monitorResourcePerformance();

        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.trackMemoryUsage();
            }, 60000); // Every minute
        }
    }

    monitorCoreWebVitals() {
        // First Contentful Paint (FCP)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.trackEvent('core_web_vital', {
                        metric: 'FCP',
                        value: entry.startTime,
                        rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs_improvement' : 'poor'
                    });
                }
            }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            this.trackEvent('core_web_vital', {
                metric: 'LCP',
                value: lastEntry.startTime,
                rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor'
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }

            this.trackEvent('core_web_vital', {
                metric: 'CLS',
                value: clsValue,
                rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor'
            });
        }).observe({ entryTypes: ['layout-shift'] });
    }

    monitorResourcePerformance() {
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 1000) { // Resources taking longer than 1s
                    this.trackEvent('slow_resource', {
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize || 0,
                        type: this.getResourceType(entry.name)
                    });
                }
            }
        }).observe({ entryTypes: ['resource'] });
    }

    trackMemoryUsage() {
        const memory = performance.memory;
        const memoryData = {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };

        this.performanceMetrics.push({
            timestamp: new Date().toISOString(),
            type: 'memory',
            data: memoryData
        });

        // Alert on high memory usage
        if (memoryData.usagePercent > 80) {
            this.trackEvent('high_memory_usage', memoryData);
        }
    }

    // ===================================
    // A/B TESTING FRAMEWORK
    // ===================================

    initializeABTest(testName, variants, options = {}) {
        const {
            trafficAllocation = 1.0,
            stickySession = true,
            targetAudience = null
        } = options;

        // Check if user is eligible for test
        if (!this.isEligibleForTest(testName, targetAudience, trafficAllocation)) {
            return null;
        }

        // Get or assign variant
        const variant = this.getABTestVariant(testName, variants, stickySession);

        // Track test participation
        this.trackEvent('ab_test_participation', {
            testName,
            variant,
            variants: variants.length,
            trafficAllocation
        });

        console.log(`🧪 A/B Test initialized: ${testName} - Variant: ${variant}`);
        return variant;
    }

    getABTestVariant(testName, variants, stickySession) {
        const storageKey = `ab_test_${testName}`;

        // Check for existing assignment if sticky
        if (stickySession) {
            const existing = localStorage.getItem(storageKey);
            if (existing && variants.includes(existing)) {
                return existing;
            }
        }

        // Assign new variant based on user ID or session ID
        const seed = this.userId || this.sessionId;
        const hash = this.simpleHash(seed + testName);
        const variantIndex = hash % variants.length;
        const variant = variants[variantIndex];

        // Store assignment if sticky
        if (stickySession) {
            localStorage.setItem(storageKey, variant);
        }

        return variant;
    }

    trackABTestConversion(testName, variant, conversionType = 'default') {
        this.trackEvent('ab_test_conversion', {
            testName,
            variant,
            conversionType,
            sessionDuration: this.getSessionDuration()
        });
    }

    isEligibleForTest(testName, targetAudience, trafficAllocation) {
        // Check traffic allocation
        const seed = this.sessionId + testName;
        const hash = this.simpleHash(seed);
        if ((hash % 100) / 100 > trafficAllocation) {
            return false;
        }

        // Check target audience (if specified)
        if (targetAudience && !this.matchesAudience(targetAudience)) {
            return false;
        }

        return true;
    }

    matchesAudience(targetAudience) {
        // Implement audience matching logic
        // This could check user properties, behavior, etc.
        return true; // Simplified for demo
    }

    // ===================================
    // DATA MANAGEMENT
    // ===================================

    flush() {
        if (this.events.length === 0) return;

        const batch = {
            id: this.generateBatchId(),
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            events: [...this.events],
            pageViews: [...this.pageViews],
            performanceMetrics: [...this.performanceMetrics]
        };

        // Clear current data
        this.events = [];
        this.pageViews = [];
        this.performanceMetrics = [];

        if (this.isOnline) {
            this.sendBatch(batch);
        } else {
            this.storeBatch(batch);
        }
    }

    async sendBatch(batch) {
        try {
            // In a real implementation, this would send to your analytics endpoint
            console.log('📤 Sending analytics batch:', batch);

            // Simulate API call
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(batch)
            });

            if (response.ok) {
                console.log('✅ Analytics batch sent successfully');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Failed to send analytics batch:', error);
            this.storeBatch(batch);
        }
    }

    storeBatch(batch) {
        this.pendingBatches.push(batch);

        // Store in localStorage as backup
        try {
            const stored = JSON.parse(localStorage.getItem('analytics_pending') || '[]');
            stored.push(batch);

            // Keep only last 10 batches to avoid storage overflow
            if (stored.length > 10) {
                stored.splice(0, stored.length - 10);
            }

            localStorage.setItem('analytics_pending', JSON.stringify(stored));
        } catch (error) {
            console.error('❌ Failed to store analytics batch:', error);
        }
    }

    async flushPendingBatches() {
        if (this.pendingBatches.length === 0) return;

        console.log(`📤 Flushing ${this.pendingBatches.length} pending analytics batches`);

        const batches = [...this.pendingBatches];
        this.pendingBatches = [];

        for (const batch of batches) {
            try {
                await this.sendBatch(batch);
            } catch (error) {
                console.error('❌ Failed to flush batch:', error);
                this.storeBatch(batch);
            }
        }

        // Clear stored batches on successful flush
        localStorage.removeItem('analytics_pending');
    }

    loadStoredEvents() {
        try {
            const stored = JSON.parse(localStorage.getItem('analytics_pending') || '[]');
            this.pendingBatches = stored;

            if (stored.length > 0) {
                console.log(`📦 Loaded ${stored.length} pending analytics batches`);
            }
        } catch (error) {
            console.error('❌ Failed to load stored analytics events:', error);
        }
    }

    // ===================================
    // UTILITY METHODS
    // ===================================

    setupFlushTimer() {
        setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    trimEvents() {
        if (this.events.length > this.config.maxEvents) {
            this.events = this.events.slice(-this.config.maxEvents);
        }
    }

    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this.trackTimeOnPage();
            this.flush(); // Flush before page might be closed
        }
    }

    handleBeforeUnload() {
        this.trackTimeOnPage();
        this.flush();
    }

    trackTimeOnPage() {
        if (this.pageStartTime) {
            const timeOnPage = performance.now() - this.pageStartTime;
            this.userBehavior.timeOnPage[window.location.pathname] = timeOnPage;

            this.trackEvent('time_on_page', {
                pathname: window.location.pathname,
                duration: timeOnPage
            });
        }
    }

    getSessionDuration() {
        return Date.now() - this.sessionStartTime;
    }

    getTimeOnCurrentPage() {
        return this.pageStartTime ? performance.now() - this.pageStartTime : 0;
    }

    getUserInteractionCount() {
        return this.userBehavior.interactions.length;
    }

    getPreviousPage() {
        return this.pageViews.length > 1 ? this.pageViews[this.pageViews.length - 2].pathname : null;
    }

    getPageLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        return navigation ? navigation.loadEventEnd - navigation.fetchStart : null;
    }

    detectPlatform() {
        const ua = navigator.userAgent;
        if (ua.includes('Mobile')) return 'mobile';
        if (ua.includes('Tablet')) return 'tablet';
        return 'desktop';
    }

    getResourceType(url) {
        const extension = url.split('.').pop()?.toLowerCase();
        const typeMap = {
            'js': 'script',
            'css': 'stylesheet',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font'
        };
        return typeMap[extension] || 'other';
    }

    isSensitiveField(fieldName) {
        const sensitiveFields = ['password', 'ssn', 'credit', 'cvv', 'social'];
        return sensitiveFields.some(field => fieldName.toLowerCase().includes(field));
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    generateSessionId() {
        this.sessionStartTime = Date.now();
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateBatchId() {
        return 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setUserId(userId) {
        this.userId = userId;
        this.trackEvent('user_identified', { userId });
    }

    // ===================================
    // PUBLIC API
    // ===================================

    getAnalyticsReport() {
        return {
            session: {
                id: this.sessionId,
                duration: this.getSessionDuration(),
                pageViews: this.pageViews.length
            },
            events: {
                total: this.events.length,
                pending: this.pendingBatches.length
            },
            performance: {
                metrics: this.performanceMetrics.length,
                errors: this.userBehavior.errors.length
            },
            behavior: {
                interactions: this.userBehavior.interactions.length,
                navigation: this.userBehavior.navigation.length,
                scrollDepth: this.userBehavior.scrollDepth
            }
        };
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.AnalyticsManager = AnalyticsManager;
}