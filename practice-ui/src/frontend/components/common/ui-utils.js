// UI Utils Module
// Loading states, error handling, and UI helpers
// Interview Prep Platform - Frontend Integration
// Created: December 15, 2025

class UIUtils {
    constructor() {
        this.loadingStates = new Map();
        this.notifications = [];
    }

    // Enhanced loading state management
    showLoading(element, message = 'Loading...') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (!element) return;

        const loadingId = Math.random().toString(36).substr(2, 9);
        this.loadingStates.set(element, loadingId);

        const originalContent = element.innerHTML;
        element.setAttribute('data-original-content', originalContent);

        element.innerHTML = `
            <div class="loading-state" data-loading-id="${loadingId}">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;

        element.classList.add('loading');
    }

    hideLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (!element) return;

        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.innerHTML = originalContent;
            element.removeAttribute('data-original-content');
        }

        element.classList.remove('loading');
        this.loadingStates.delete(element);
    }

    // Enhanced notification system
    showNotification(message, type = 'info', duration = 5000, actions = []) {
        const notification = this.createNotificationElement(message, type, actions);
        document.body.appendChild(notification);

        // Add to tracking array
        this.notifications.push(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        return notification;
    }

    createNotificationElement(message, type, actions) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = this.getNotificationIcon(type);

        let actionsHTML = '';
        if (actions.length > 0) {
            actionsHTML = `
                <div class="notification-actions">
                    ${actions.map(action => `
                        <button class="notification-action" onclick="${action.callback}">${action.label}</button>
                    `).join('')}
                </div>
            `;
        }

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <div class="notification-body">
                    <span class="notification-message">${message}</span>
                    ${actionsHTML}
                </div>
                <button class="notification-close" onclick="window.uiUtils.removeNotification(this.closest('.notification'))">×</button>
            </div>
        `;

        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '🔄'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        if (!notification || !notification.parentElement) return;

        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    // Enhanced error handling with retry capability
    handleError(error, context = '', options = {}) {
        console.error(`❌ Error in ${context}:`, error);

        const {
            showNotification = true,
            allowRetry = false,
            retryCallback = null,
            customMessage = null
        } = options;

        if (showNotification) {
            const message = customMessage || this.getErrorMessage(error, context);

            const actions = [];
            if (allowRetry && retryCallback) {
                actions.push({
                    label: 'Retry',
                    callback: `(${retryCallback.toString()})()`
                });
            }

            this.showNotification(message, 'error', 8000, actions);
        }

        return error;
    }

    getErrorMessage(error, context) {
        if (error.message?.includes('fetch')) {
            return 'Network error. Please check your internet connection and try again.';
        }
        if (error.message?.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        if (error.message?.includes('not available')) {
            return 'Service temporarily unavailable. Please try again later.';
        }
        if (context.includes('database')) {
            return 'Database connection error. Please refresh the page.';
        }

        return `An error occurred${context ? ` in ${context}` : ''}. Please try again.`;
    }

    // Progress indicators
    showProgress(element, progress, total, message = '') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (!element) return;

        const percentage = total > 0 ? (progress / total * 100) : 0;

        element.innerHTML = `
            <div class="progress-indicator">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-text">
                    ${message} (${progress}/${total} - ${Math.round(percentage)}%)
                </div>
            </div>
        `;
    }

    // Skeleton loading for lists
    showSkeleton(element, count = 3, type = 'default') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (!element) return;

        const skeletons = [];
        for (let i = 0; i < count; i++) {
            skeletons.push(this.createSkeleton(type));
        }

        element.innerHTML = skeletons.join('');
    }

    createSkeleton(type) {
        switch (type) {
            case 'question':
                return `
                    <div class="skeleton-item question-skeleton">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-line skeleton-text"></div>
                        <div class="skeleton-line skeleton-text short"></div>
                    </div>
                `;
            case 'day':
                return `
                    <div class="skeleton-item day-skeleton">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-line skeleton-text"></div>
                    </div>
                `;
            default:
                return `
                    <div class="skeleton-item">
                        <div class="skeleton-line"></div>
                    </div>
                `;
        }
    }

    // Form validation helpers
    validateForm(formElement, rules = {}) {
        if (typeof formElement === 'string') {
            formElement = document.getElementById(formElement);
        }
        if (!formElement) return { valid: false, errors: [] };

        const errors = [];
        const formData = new FormData(formElement);

        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field);
            const fieldElement = formElement.querySelector(`[name="${field}"]`);

            if (rule.required && (!value || value.trim() === '')) {
                errors.push({ field, message: rule.message || `${field} is required` });
                this.markFieldError(fieldElement);
            } else {
                this.clearFieldError(fieldElement);
            }

            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors.push({ field, message: rule.patternMessage || `${field} format is invalid` });
                this.markFieldError(fieldElement);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    markFieldError(fieldElement) {
        if (fieldElement) {
            fieldElement.classList.add('error');
            fieldElement.setAttribute('aria-invalid', 'true');
        }
    }

    clearFieldError(fieldElement) {
        if (fieldElement) {
            fieldElement.classList.remove('error');
            fieldElement.removeAttribute('aria-invalid');
        }
    }

    // Accessibility helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Focus management
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });

        // Focus first element
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
}

// Auto-initialize and expose globally
if (typeof window !== 'undefined') {
    window.UIUtils = UIUtils;
    window.uiUtils = new UIUtils();
}