// Performance Manager
// Handles lazy loading, virtual scrolling, and performance optimization
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class PerformanceManager {
    constructor() {
        this.lazyLoadObserver = null;
        this.virtualScrollers = new Map();
        this.performanceMetrics = {
            pageLoadTime: 0,
            renderTime: 0,
            apiResponseTimes: [],
            memoryUsage: [],
            errorCount: 0,
            userInteractions: []
        };
        this.isPerformanceSupported = 'performance' in window;
        this.isObserverSupported = 'IntersectionObserver' in window;

        this.initializePerformanceTracking();
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    initializePerformanceTracking() {
        if (this.isPerformanceSupported) {
            // Track page load performance
            window.addEventListener('load', () => {
                setTimeout(() => this.measurePageLoad(), 100);
            });

            // Track navigation performance
            window.addEventListener('beforeunload', () => {
                this.savePerformanceMetrics();
            });

            // Track memory usage periodically
            setInterval(() => this.trackMemoryUsage(), 30000); // Every 30 seconds
        }

        // Setup intersection observer for lazy loading
        if (this.isObserverSupported) {
            this.setupLazyLoadObserver();
        }

        console.log('✅ Performance Manager initialized');
    }

    measurePageLoad() {
        if (!this.isPerformanceSupported) return;

        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
            console.log(`⚡ Page load time: ${this.performanceMetrics.pageLoadTime}ms`);
        }

        // Measure render time
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
            this.performanceMetrics.renderTime = fcp.startTime;
            console.log(`🎨 First Contentful Paint: ${this.performanceMetrics.renderTime}ms`);
        }
    }

    // ===================================
    // LAZY LOADING
    // ===================================

    setupLazyLoadObserver() {
        this.lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    this.lazyLoadObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '50px', // Load 50px before element comes into view
            threshold: 0.1
        });

        console.log('👁️ Lazy load observer initialized');
    }

    registerLazyElement(element, loadFunction) {
        if (!this.isObserverSupported) {
            // Fallback: load immediately if no observer support
            loadFunction();
            return;
        }

        element.dataset.lazyLoad = 'true';
        element.dataset.loadFunction = loadFunction.toString();
        this.lazyLoadObserver.observe(element);
    }

    loadLazyElement(element) {
        try {
            const loadFunctionStr = element.dataset.loadFunction;
            if (loadFunctionStr) {
                // Execute the load function
                const loadFunction = new Function('return ' + loadFunctionStr)();
                loadFunction();

                element.dataset.lazyLoad = 'loaded';
                console.log('📦 Lazy loaded element:', element);
            }
        } catch (error) {
            console.error('❌ Failed to lazy load element:', error);
        }
    }

    // ===================================
    // VIRTUAL SCROLLING
    // ===================================

    createVirtualScroller(containerId, items, renderItem, itemHeight = 60) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} not found for virtual scrolling`);
            return null;
        }

        const virtualScroller = new VirtualScroller(container, items, renderItem, itemHeight);
        this.virtualScrollers.set(containerId, virtualScroller);

        console.log(`📜 Virtual scroller created for ${containerId} with ${items.length} items`);
        return virtualScroller;
    }

    updateVirtualScroller(containerId, items) {
        const scroller = this.virtualScrollers.get(containerId);
        if (scroller) {
            scroller.updateItems(items);
            console.log(`📜 Virtual scroller updated for ${containerId}`);
        }
    }

    destroyVirtualScroller(containerId) {
        const scroller = this.virtualScrollers.get(containerId);
        if (scroller) {
            scroller.destroy();
            this.virtualScrollers.delete(containerId);
            console.log(`📜 Virtual scroller destroyed for ${containerId}`);
        }
    }

    // ===================================
    // API PERFORMANCE TRACKING
    // ===================================

    trackAPICall(url, startTime, endTime, success = true) {
        const responseTime = endTime - startTime;

        this.performanceMetrics.apiResponseTimes.push({
            url,
            responseTime,
            timestamp: new Date().toISOString(),
            success
        });

        // Keep only last 100 API calls
        if (this.performanceMetrics.apiResponseTimes.length > 100) {
            this.performanceMetrics.apiResponseTimes =
                this.performanceMetrics.apiResponseTimes.slice(-100);
        }

        // Log slow API calls
        if (responseTime > 2000) {
            console.warn(`🐌 Slow API call: ${url} took ${responseTime}ms`);
        }

        console.log(`🌐 API call: ${url} - ${responseTime}ms`);
    }

    wrapAPIFunction(apiFunction, name) {
        return async (...args) => {
            const startTime = performance.now();
            try {
                const result = await apiFunction.apply(this, args);
                const endTime = performance.now();
                this.trackAPICall(name, startTime, endTime, true);
                return result;
            } catch (error) {
                const endTime = performance.now();
                this.trackAPICall(name, startTime, endTime, false);
                throw error;
            }
        };
    }

    // ===================================
    // MEMORY MONITORING
    // ===================================

    trackMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const memoryData = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                timestamp: new Date().toISOString()
            };

            this.performanceMetrics.memoryUsage.push(memoryData);

            // Keep only last 100 memory samples
            if (this.performanceMetrics.memoryUsage.length > 100) {
                this.performanceMetrics.memoryUsage =
                    this.performanceMetrics.memoryUsage.slice(-100);
            }

            // Warn about high memory usage
            const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            if (usagePercent > 80) {
                console.warn(`🧠 High memory usage: ${usagePercent.toFixed(1)}%`);
                this.suggestMemoryOptimization();
            }
        }
    }

    suggestMemoryOptimization() {
        console.log('💡 Memory optimization suggestions:');
        console.log('   - Clear unused virtual scrollers');
        console.log('   - Reduce cached data size');
        console.log('   - Check for memory leaks in event listeners');

        // Auto-cleanup suggestions
        this.performMemoryCleanup();
    }

    performMemoryCleanup() {
        // Clear old performance metrics
        if (this.performanceMetrics.apiResponseTimes.length > 50) {
            this.performanceMetrics.apiResponseTimes =
                this.performanceMetrics.apiResponseTimes.slice(-50);
        }

        if (this.performanceMetrics.memoryUsage.length > 50) {
            this.performanceMetrics.memoryUsage =
                this.performanceMetrics.memoryUsage.slice(-50);
        }

        // Clear inactive virtual scrollers
        this.virtualScrollers.forEach((scroller, id) => {
            if (!document.getElementById(id)) {
                this.destroyVirtualScroller(id);
            }
        });

        console.log('🧹 Memory cleanup performed');
    }

    // ===================================
    // PERFORMANCE OPTIMIZATION
    // ===================================

    optimizeImages() {
        const images = document.querySelectorAll('img:not([data-optimized])');

        images.forEach(img => {
            // Add loading="lazy" for native lazy loading
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }

            // Add intersection observer for older browsers
            if (this.isObserverSupported && !('loading' in HTMLImageElement.prototype)) {
                this.lazyLoadObserver.observe(img);
            }

            // Mark as optimized
            img.dataset.optimized = 'true';
        });

        console.log(`🖼️ Optimized ${images.length} images for lazy loading`);
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

    // ===================================
    // ERROR TRACKING
    // ===================================

    trackError(error, context = 'unknown') {
        this.performanceMetrics.errorCount++;

        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error('❌ Error tracked:', errorData);

        // Store errors locally for analytics
        const errors = JSON.parse(localStorage.getItem('performance_errors') || '[]');
        errors.push(errorData);

        // Keep only last 50 errors
        if (errors.length > 50) {
            errors.splice(0, errors.length - 50);
        }

        localStorage.setItem('performance_errors', JSON.stringify(errors));
    }

    // ===================================
    // USER INTERACTION TRACKING
    // ===================================

    trackUserInteraction(type, element, data = {}) {
        const interaction = {
            type,
            element: element ? element.tagName + (element.id ? '#' + element.id : '') : 'unknown',
            data,
            timestamp: new Date().toISOString()
        };

        this.performanceMetrics.userInteractions.push(interaction);

        // Keep only last 100 interactions
        if (this.performanceMetrics.userInteractions.length > 100) {
            this.performanceMetrics.userInteractions =
                this.performanceMetrics.userInteractions.slice(-100);
        }
    }

    setupInteractionTracking() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackUserInteraction('click', e.target, {
                x: e.clientX,
                y: e.clientY
            });
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackUserInteraction('submit', e.target);
        });

        // Track input focus
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.trackUserInteraction('focus', e.target);
            }
        }, true);

        console.log('👆 User interaction tracking enabled');
    }

    // ===================================
    // PERFORMANCE METRICS
    // ===================================

    getPerformanceReport() {
        const apiTimes = this.performanceMetrics.apiResponseTimes;
        const avgApiTime = apiTimes.length > 0
            ? apiTimes.reduce((sum, api) => sum + api.responseTime, 0) / apiTimes.length
            : 0;

        const recentMemory = this.performanceMetrics.memoryUsage.slice(-1)[0];

        return {
            pageLoad: {
                loadTime: this.performanceMetrics.pageLoadTime,
                renderTime: this.performanceMetrics.renderTime
            },
            api: {
                averageResponseTime: Math.round(avgApiTime),
                totalCalls: apiTimes.length,
                failureRate: apiTimes.filter(api => !api.success).length / apiTimes.length * 100
            },
            memory: recentMemory ? {
                used: Math.round(recentMemory.used / 1024 / 1024), // MB
                total: Math.round(recentMemory.total / 1024 / 1024), // MB
                usagePercent: Math.round((recentMemory.used / recentMemory.limit) * 100)
            } : null,
            errors: {
                count: this.performanceMetrics.errorCount,
                recent: JSON.parse(localStorage.getItem('performance_errors') || '[]').slice(-5)
            },
            interactions: {
                count: this.performanceMetrics.userInteractions.length,
                recent: this.performanceMetrics.userInteractions.slice(-10)
            }
        };
    }

    savePerformanceMetrics() {
        const report = this.getPerformanceReport();
        localStorage.setItem('performance_report', JSON.stringify(report));
        console.log('💾 Performance metrics saved:', report);
    }

    // ===================================
    // OPTIMIZATION SUGGESTIONS
    // ===================================

    analyzePerformance() {
        const report = this.getPerformanceReport();
        const suggestions = [];

        // Page load analysis
        if (report.pageLoad.loadTime > 3000) {
            suggestions.push({
                type: 'performance',
                priority: 'high',
                message: 'Page load time is slow. Consider code splitting and lazy loading.',
                metric: `${report.pageLoad.loadTime}ms load time`
            });
        }

        // API performance analysis
        if (report.api.averageResponseTime > 1000) {
            suggestions.push({
                type: 'api',
                priority: 'medium',
                message: 'API responses are slow. Consider caching and optimization.',
                metric: `${report.api.averageResponseTime}ms average response`
            });
        }

        // Memory analysis
        if (report.memory && report.memory.usagePercent > 70) {
            suggestions.push({
                type: 'memory',
                priority: 'high',
                message: 'High memory usage detected. Consider cleanup strategies.',
                metric: `${report.memory.usagePercent}% memory usage`
            });
        }

        // Error analysis
        if (report.errors.count > 10) {
            suggestions.push({
                type: 'errors',
                priority: 'high',
                message: 'High error count detected. Review error logs.',
                metric: `${report.errors.count} errors recorded`
            });
        }

        return suggestions;
    }
}

// Virtual Scroller Class
class VirtualScroller {
    constructor(container, items, renderItem, itemHeight = 60) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.itemHeight = itemHeight;
        this.visibleItems = [];
        this.startIndex = 0;
        this.endIndex = 0;

        this.setup();
    }

    setup() {
        // Create scrollable container
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.style.cssText = `
            height: 100%;
            overflow-y: auto;
            position: relative;
        `;

        // Create content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.style.position = 'relative';

        // Create viewport
        this.viewport = document.createElement('div');
        this.viewport.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
        `;

        this.contentContainer.appendChild(this.viewport);
        this.scrollContainer.appendChild(this.contentContainer);
        this.container.appendChild(this.scrollContainer);

        // Set total height
        this.updateTotalHeight();

        // Setup scroll listener
        this.scrollContainer.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Initial render
        this.render();
    }

    updateTotalHeight() {
        this.contentContainer.style.height = `${this.items.length * this.itemHeight}px`;
    }

    calculateVisibleRange() {
        const scrollTop = this.scrollContainer.scrollTop;
        const containerHeight = this.scrollContainer.clientHeight;

        const buffer = 5; // Render extra items for smooth scrolling

        this.startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - buffer);
        this.endIndex = Math.min(
            this.items.length - 1,
            Math.ceil((scrollTop + containerHeight) / this.itemHeight) + buffer
        );
    }

    render() {
        this.calculateVisibleRange();

        // Clear viewport
        this.viewport.innerHTML = '';

        // Render visible items
        for (let i = this.startIndex; i <= this.endIndex; i++) {
            const item = this.items[i];
            if (!item) continue;

            const itemElement = document.createElement('div');
            itemElement.style.cssText = `
                position: absolute;
                top: ${i * this.itemHeight}px;
                left: 0;
                right: 0;
                height: ${this.itemHeight}px;
            `;

            itemElement.innerHTML = this.renderItem(item, i);
            this.viewport.appendChild(itemElement);
        }
    }

    handleScroll() {
        this.render();
    }

    updateItems(newItems) {
        this.items = newItems;
        this.updateTotalHeight();
        this.render();
    }

    destroy() {
        if (this.scrollContainer && this.scrollContainer.parentNode) {
            this.scrollContainer.parentNode.removeChild(this.scrollContainer);
        }
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    if (window.performanceManager) {
        window.performanceManager.trackError(event.error, 'global_error');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    if (window.performanceManager) {
        window.performanceManager.trackError(event.reason, 'unhandled_promise');
    }
});

// Export for use
if (typeof window !== 'undefined') {
    window.PerformanceManager = PerformanceManager;
    window.VirtualScroller = VirtualScroller;
}