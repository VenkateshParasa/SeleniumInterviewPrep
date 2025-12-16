// Module Bundler and Code Splitting
// Dynamic module loading and performance optimization
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class ModuleBundler {
    constructor() {
        this.loadedModules = new Set();
        this.moduleCache = new Map();
        this.loadingPromises = new Map();
        this.dependencyGraph = new Map();
        this.criticalModules = new Set(['ui-utils', 'api-client', 'performance-manager']);
        this.lazyModules = new Set(['conflict-resolver', 'offline-progress-tracker']);

        this.preloadQueue = [];
        this.loadMetrics = {
            totalModules: 0,
            loadedModules: 0,
            loadTimes: {},
            errors: []
        };

        this.setupModuleLoader();
    }

    // ===================================
    // MODULE LOADING
    // ===================================

    setupModuleLoader() {
        // Preload critical modules
        this.preloadCriticalModules();

        // Setup intersection observer for lazy module loading
        if ('IntersectionObserver' in window) {
            this.setupLazyModuleLoader();
        }

        console.log('📦 Module bundler initialized');
    }

    async preloadCriticalModules() {
        console.log('⚡ Preloading critical modules...');

        const preloadPromises = Array.from(this.criticalModules).map(moduleName => {
            return this.preloadModule(moduleName);
        });

        try {
            await Promise.allSettled(preloadPromises);
            console.log('✅ Critical modules preloaded');
        } catch (error) {
            console.error('❌ Failed to preload critical modules:', error);
        }
    }

    async preloadModule(moduleName) {
        const moduleUrl = this.getModuleUrl(moduleName);

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = moduleUrl;

            link.onload = () => {
                console.log(`📦 Preloaded module: ${moduleName}`);
                resolve();
            };

            link.onerror = () => {
                console.warn(`⚠️ Failed to preload module: ${moduleName}`);
                reject(new Error(`Failed to preload ${moduleName}`));
            };

            document.head.appendChild(link);
        });
    }

    async loadModule(moduleName, options = {}) {
        const {
            priority = 'normal',
            timeout = 10000,
            fallback = null,
            dependencies = []
        } = options;

        // Check if module is already loading
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Check if module is already loaded
        if (this.loadedModules.has(moduleName)) {
            return this.moduleCache.get(moduleName);
        }

        // Create loading promise
        const loadingPromise = this.performModuleLoad(moduleName, {
            priority,
            timeout,
            fallback,
            dependencies
        });

        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const module = await loadingPromise;
            this.loadedModules.add(moduleName);
            this.moduleCache.set(moduleName, module);
            this.loadingPromises.delete(moduleName);

            console.log(`✅ Module loaded: ${moduleName}`);
            return module;

        } catch (error) {
            this.loadingPromises.delete(moduleName);
            this.recordLoadError(moduleName, error);

            // Try fallback if available
            if (fallback) {
                console.warn(`⚠️ Using fallback for ${moduleName}`);
                return fallback;
            }

            throw error;
        }
    }

    async performModuleLoad(moduleName, options) {
        const startTime = performance.now();

        try {
            // Load dependencies first
            if (options.dependencies.length > 0) {
                await this.loadDependencies(options.dependencies);
            }

            // Load the actual module
            const moduleUrl = this.getModuleUrl(moduleName);
            const module = await this.importModule(moduleUrl, options.timeout);

            const loadTime = performance.now() - startTime;
            this.recordLoadTime(moduleName, loadTime);

            return module;

        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    async loadDependencies(dependencies) {
        const dependencyPromises = dependencies.map(dep => this.loadModule(dep));
        await Promise.all(dependencyPromises);
    }

    async importModule(url, timeout) {
        return Promise.race([
            import(url),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Module load timeout')), timeout)
            )
        ]);
    }

    getModuleUrl(moduleName) {
        const baseUrl = window.location.origin;
        const moduleMap = {
            'ui-utils': '/js/ui-utils.js',
            'api-client': '/js/api-client.js',
            'api-v2-client': '/js/api-v2-client.js',
            'offline-storage': '/js/offline-storage.js',
            'conflict-resolver': '/js/conflict-resolver.js',
            'offline-progress-tracker': '/js/offline-progress-tracker.js',
            'data-manager': '/js/data-manager.js',
            'question-manager': '/js/question-manager.js',
            'progress-manager': '/js/progress-manager.js',
            'performance-manager': '/js/performance-manager.js'
        };

        return `${baseUrl}${moduleMap[moduleName] || `/js/${moduleName}.js`}`;
    }

    // ===================================
    // LAZY MODULE LOADING
    // ===================================

    setupLazyModuleLoader() {
        this.lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const moduleName = entry.target.dataset.lazyModule;
                    if (moduleName && !this.loadedModules.has(moduleName)) {
                        this.loadModule(moduleName, { priority: 'low' });
                    }
                }
            });
        }, {
            rootMargin: '100px' // Load 100px before element comes into view
        });

        console.log('👁️ Lazy module loader initialized');
    }

    registerLazyModule(element, moduleName) {
        if (this.lazyLoadObserver) {
            element.dataset.lazyModule = moduleName;
            this.lazyLoadObserver.observe(element);
        }
    }

    // ===================================
    // CODE SPLITTING
    // ===================================

    async loadFeature(featureName) {
        const featureModules = this.getFeatureModules(featureName);

        console.log(`🎯 Loading feature: ${featureName}`);

        const loadPromises = featureModules.map(moduleName =>
            this.loadModule(moduleName, { priority: 'high' })
        );

        try {
            const modules = await Promise.all(loadPromises);
            console.log(`✅ Feature loaded: ${featureName}`);
            return modules;
        } catch (error) {
            console.error(`❌ Failed to load feature ${featureName}:`, error);
            throw error;
        }
    }

    getFeatureModules(featureName) {
        const featureMap = {
            'questions': ['question-manager', 'data-manager'],
            'progress': ['progress-manager', 'offline-progress-tracker'],
            'offline': ['offline-storage', 'conflict-resolver'],
            'performance': ['performance-manager'],
            'authentication': ['api-client', 'api-v2-client']
        };

        return featureMap[featureName] || [featureName];
    }

    // ===================================
    // RESOURCE HINTS
    // ===================================

    addResourceHints() {
        // DNS prefetch for external resources
        const dnsPrefetches = [
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ];

        dnsPrefetches.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });

        // Preconnect to important origins
        const preconnects = [
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ];

        preconnects.forEach(origin => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = `https://${origin}`;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });

        console.log('🔗 Resource hints added');
    }

    // ===================================
    // BUNDLE OPTIMIZATION
    // ===================================

    optimizeBundle() {
        // Remove unused modules
        this.cleanupUnusedModules();

        // Optimize module loading order
        this.optimizeLoadingOrder();

        // Setup module recycling
        this.setupModuleRecycling();
    }

    cleanupUnusedModules() {
        const unusedModules = [];

        this.moduleCache.forEach((module, name) => {
            if (this.isModuleUnused(name)) {
                unusedModules.push(name);
            }
        });

        unusedModules.forEach(moduleName => {
            this.moduleCache.delete(moduleName);
            this.loadedModules.delete(moduleName);
            console.log(`🧹 Cleaned up unused module: ${moduleName}`);
        });

        if (unusedModules.length > 0) {
            console.log(`🧹 Cleaned up ${unusedModules.length} unused modules`);
        }
    }

    isModuleUnused(moduleName) {
        // Simple heuristic: module not accessed in last 5 minutes
        const lastAccess = this.getModuleLastAccess(moduleName);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        return lastAccess && lastAccess < fiveMinutesAgo;
    }

    getModuleLastAccess(moduleName) {
        // This would be implemented with actual usage tracking
        return this.moduleCache.get(moduleName)?._lastAccess || Date.now();
    }

    optimizeLoadingOrder() {
        // Reorder preload queue based on usage patterns
        this.preloadQueue.sort((a, b) => {
            const priorityA = this.getModulePriority(a);
            const priorityB = this.getModulePriority(b);
            return priorityB - priorityA;
        });
    }

    getModulePriority(moduleName) {
        if (this.criticalModules.has(moduleName)) return 10;
        if (this.lazyModules.has(moduleName)) return 1;
        return 5; // Default priority
    }

    setupModuleRecycling() {
        // Setup periodic cleanup
        setInterval(() => {
            this.cleanupUnusedModules();
        }, 5 * 60 * 1000); // Every 5 minutes

        console.log('♻️ Module recycling enabled');
    }

    // ===================================
    // PERFORMANCE METRICS
    // ===================================

    recordLoadTime(moduleName, loadTime) {
        this.loadMetrics.loadTimes[moduleName] = loadTime;
        this.loadMetrics.loadedModules++;

        if (loadTime > 1000) {
            console.warn(`🐌 Slow module load: ${moduleName} took ${loadTime}ms`);
        }
    }

    recordLoadError(moduleName, error) {
        this.loadMetrics.errors.push({
            module: moduleName,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }

    getLoadMetrics() {
        const avgLoadTime = Object.values(this.loadMetrics.loadTimes).length > 0
            ? Object.values(this.loadMetrics.loadTimes).reduce((a, b) => a + b, 0) / Object.values(this.loadMetrics.loadTimes).length
            : 0;

        return {
            totalModules: this.loadMetrics.totalModules,
            loadedModules: this.loadMetrics.loadedModules,
            averageLoadTime: Math.round(avgLoadTime),
            loadTimes: { ...this.loadMetrics.loadTimes },
            errors: [...this.loadMetrics.errors],
            cacheHitRate: this.calculateCacheHitRate()
        };
    }

    calculateCacheHitRate() {
        const totalRequests = this.loadedModules.size + this.loadMetrics.errors.length;
        return totalRequests > 0 ? (this.loadedModules.size / totalRequests) * 100 : 0;
    }

    // ===================================
    // DEVELOPMENT HELPERS
    // ===================================

    debugModules() {
        console.group('📦 Module Debug Info');
        console.log('Loaded modules:', Array.from(this.loadedModules));
        console.log('Loading promises:', Array.from(this.loadingPromises.keys()));
        console.log('Module cache size:', this.moduleCache.size);
        console.log('Load metrics:', this.getLoadMetrics());
        console.groupEnd();
    }

    async preloadAllModules() {
        const allModules = [
            'ui-utils', 'api-client', 'api-v2-client', 'offline-storage',
            'conflict-resolver', 'offline-progress-tracker', 'data-manager',
            'question-manager', 'progress-manager', 'performance-manager'
        ];

        console.log('📦 Preloading all modules for development...');

        const promises = allModules.map(module => this.loadModule(module));
        await Promise.allSettled(promises);

        console.log('✅ All modules preloaded');
    }

    // ===================================
    // STATIC METHODS
    // ===================================

    static async createOptimizedLoader() {
        const bundler = new ModuleBundler();

        // Add resource hints
        bundler.addResourceHints();

        // Start optimization
        bundler.optimizeBundle();

        return bundler;
    }

    static async loadCriticalPath() {
        const bundler = await ModuleBundler.createOptimizedLoader();

        // Load critical modules immediately
        await bundler.preloadCriticalModules();

        return bundler;
    }
}

// Auto-initialize module bundler
if (typeof window !== 'undefined') {
    window.moduleBundler = null;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            window.moduleBundler = await ModuleBundler.createOptimizedLoader();
        });
    } else {
        ModuleBundler.createOptimizedLoader().then(bundler => {
            window.moduleBundler = bundler;
        });
    }

    // Export classes
    window.ModuleBundler = ModuleBundler;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleBundler;
}