/**
 * Error Handling and Retry System
 * Provides user-friendly error handling with retry functionality for calculations
 * 
 * Issue #18 Fix: Add retry functionality for calculation errors with user-friendly error handling
 */

class ErrorHandling {
    constructor() {
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // Start with 1 second
        this.errorQueue = [];
        this.isOnline = navigator.onLine;
        
        this.errorTypes = {
            CALCULATION_ERROR: 'calculation',
            NETWORK_ERROR: 'network',
            VALIDATION_ERROR: 'validation',
            API_ERROR: 'api',
            UNKNOWN_ERROR: 'unknown'
        };

        this.errorMessages = {
            [this.errorTypes.CALCULATION_ERROR]: {
                title: 'Calculation Error',
                message: 'Unable to complete the calculation. This might be due to invalid input values.',
                actions: ['retry', 'contact']
            },
            [this.errorTypes.NETWORK_ERROR]: {
                title: 'Connection Issue',
                message: 'Check your internet connection and try again.',
                actions: ['retry', 'offline']
            },
            [this.errorTypes.VALIDATION_ERROR]: {
                title: 'Input Validation Error',
                message: 'Please check your input values and ensure they are within valid ranges.',
                actions: ['fix', 'help']
            },
            [this.errorTypes.API_ERROR]: {
                title: 'Service Temporarily Unavailable',
                message: 'Our calculation service is temporarily unavailable. Please try again in a moment.',
                actions: ['retry', 'contact']
            },
            [this.errorTypes.UNKNOWN_ERROR]: {
                title: 'Unexpected Error',
                message: 'Something went wrong. Please try again or contact support if the issue persists.',
                actions: ['retry', 'contact']
            }
        };
    }

    /**
     * Initialize error handling system
     */
    init() {
        this.setupGlobalErrorHandling();
        this.setupNetworkMonitoring();
        this.createErrorContainer();
        this.attachRetryHandlers();
        this.setupKeyboardAccessibility();
        console.log('Error handling system initialized');
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Catch unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: this.errorTypes.UNKNOWN_ERROR,
                message: event.message,
                source: event.filename,
                line: event.lineno,
                error: event.error
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: this.errorTypes.UNKNOWN_ERROR,
                message: event.reason?.message || 'Promise rejection',
                error: event.reason
            });
        });
    }

    /**
     * Setup network connection monitoring
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('Connected', 'success');
            this.retryQueuedErrors();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('Offline - Limited functionality', 'warning');
        });
    }

    /**
     * Handle different types of errors
     */
    handleError(errorInfo, context = {}) {
        const errorId = this.generateErrorId();
        const errorType = this.classifyError(errorInfo);
        
        const errorData = {
            id: errorId,
            type: errorType,
            message: errorInfo.message,
            context: context,
            timestamp: new Date().toISOString(),
            attempts: 0
        };

        console.error('Error handled:', errorData);
        
        this.showErrorDialog(errorData);
        this.logError(errorData);
        
        return errorId;
    }

    /**
     * Classify error type
     */
    classifyError(errorInfo) {
        const message = errorInfo.message?.toLowerCase() || '';
        
        if (message.includes('calculation') || message.includes('invalid') || 
            message.includes('nan') || message.includes('undefined')) {
            return this.errorTypes.CALCULATION_ERROR;
        }
        
        if (message.includes('network') || message.includes('fetch') || 
            message.includes('connection') || !this.isOnline) {
            return this.errorTypes.NETWORK_ERROR;
        }
        
        if (message.includes('validation') || message.includes('range') || 
            message.includes('format')) {
            return this.errorTypes.VALIDATION_ERROR;
        }
        
        if (message.includes('api') || message.includes('server') || 
            message.includes('service')) {
            return this.errorTypes.API_ERROR;
        }
        
        return this.errorTypes.UNKNOWN_ERROR;
    }

    /**
     * Show error dialog with retry options
     */
    showErrorDialog(errorData) {
        const errorConfig = this.errorMessages[errorData.type];
        const attempts = this.retryAttempts.get(errorData.context.operation) || 0;
        
        const dialogHtml = `
            <div class="error-dialog" id="errorDialog-${errorData.id}" data-error-id="${errorData.id}">
                <div class="error-dialog-content">
                    <div class="error-header">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="error-title">
                            <h3>${errorConfig.title}</h3>
                            <span class="error-id">Error ID: ${errorData.id}</span>
                        </div>
                        <button class="error-close" data-action="close" data-error-id="${errorData.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="error-body">
                        <p class="error-message">${errorConfig.message}</p>
                        
                        ${errorData.context.details ? `
                            <details class="error-details">
                                <summary>Technical Details</summary>
                                <pre>${JSON.stringify(errorData.context.details, null, 2)}</pre>
                            </details>
                        ` : ''}
                        
                        ${attempts > 0 ? `
                            <div class="retry-info">
                                <i class="fas fa-redo"></i>
                                Attempt ${attempts + 1} of ${this.maxRetries}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="error-actions">
                        ${this.generateErrorActions(errorConfig.actions, errorData)}
                    </div>
                </div>
            </div>
        `;

        // Add to error container
        const container = this.getErrorContainer();
        container.insertAdjacentHTML('beforeend', dialogHtml);

        // Auto-focus first action button for accessibility
        setTimeout(() => {
            const dialog = document.getElementById(`errorDialog-${errorData.id}`);
            const firstButton = dialog?.querySelector('.error-action-btn');
            if (firstButton) firstButton.focus();
        }, 100);

        // Auto-remove after timeout (except for validation errors)
        if (errorData.type !== this.errorTypes.VALIDATION_ERROR) {
            setTimeout(() => {
                this.removeErrorDialog(errorData.id);
            }, 10000);
        }
    }

    /**
     * Generate action buttons for error dialog
     */
    generateErrorActions(actions, errorData) {
        const actionButtons = [];
        
        actions.forEach(action => {
            switch (action) {
                case 'retry':
                    const attempts = this.retryAttempts.get(errorData.context.operation) || 0;
                    const canRetry = attempts < this.maxRetries;
                    
                    actionButtons.push(`
                        <button class="error-action-btn retry-btn" 
                                data-action="retry" 
                                data-error-id="${errorData.id}"
                                ${!canRetry ? 'disabled' : ''}>
                            <i class="fas fa-redo"></i>
                            ${canRetry ? 'Try Again' : 'Max Retries Reached'}
                        </button>
                    `);
                    break;
                    
                case 'contact':
                    actionButtons.push(`
                        <button class="error-action-btn contact-btn" 
                                data-action="contact" 
                                data-error-id="${errorData.id}">
                            <i class="fas fa-phone"></i>
                            Contact Support
                        </button>
                    `);
                    break;
                    
                case 'fix':
                    actionButtons.push(`
                        <button class="error-action-btn fix-btn" 
                                data-action="fix" 
                                data-error-id="${errorData.id}">
                            <i class="fas fa-edit"></i>
                            Fix Input Values
                        </button>
                    `);
                    break;
                    
                case 'help':
                    actionButtons.push(`
                        <button class="error-action-btn help-btn" 
                                data-action="help" 
                                data-error-id="${errorData.id}">
                            <i class="fas fa-question-circle"></i>
                            Get Help
                        </button>
                    `);
                    break;
                    
                case 'offline':
                    actionButtons.push(`
                        <button class="error-action-btn offline-btn" 
                                data-action="offline" 
                                data-error-id="${errorData.id}">
                            <i class="fas fa-download"></i>
                            Continue Offline
                        </button>
                    `);
                    break;
            }
        });

        return actionButtons.join('');
    }

    /**
     * Attach retry handlers to error actions
     */
    attachRetryHandlers() {
        document.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action') || 
                          e.target.closest('[data-action]')?.getAttribute('data-action');
            const errorId = e.target.getAttribute('data-error-id') || 
                           e.target.closest('[data-error-id]')?.getAttribute('data-error-id');
            
            if (action && errorId) {
                this.handleErrorAction(action, errorId);
            }
        });
    }

    /**
     * Handle error action clicks
     */
    async handleErrorAction(action, errorId) {
        const errorData = this.findErrorById(errorId);
        if (!errorData) return;

        switch (action) {
            case 'retry':
                await this.retryOperation(errorData);
                break;
                
            case 'contact':
                this.openContactSupport(errorData);
                break;
                
            case 'fix':
                this.highlightInputErrors(errorData);
                this.removeErrorDialog(errorId);
                break;
                
            case 'help':
                this.showHelp(errorData);
                break;
                
            case 'offline':
                this.enableOfflineMode(errorData);
                break;
                
            case 'close':
                this.removeErrorDialog(errorId);
                break;
        }
    }

    /**
     * Retry failed operation
     */
    async retryOperation(errorData) {
        const operation = errorData.context.operation;
        const attempts = this.retryAttempts.get(operation) || 0;
        
        if (attempts >= this.maxRetries) {
            this.showMaxRetriesReached(errorData);
            return;
        }

        // Increment retry counter
        this.retryAttempts.set(operation, attempts + 1);
        
        // Show retry progress
        this.showRetryProgress(errorData.id);
        
        // Calculate exponential backoff delay
        const delay = this.retryDelay * Math.pow(2, attempts);
        
        try {
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Execute the retry function if provided
            if (errorData.context.retryFunction) {
                const result = await errorData.context.retryFunction();
                
                if (result.success) {
                    this.showRetrySuccess(errorData);
                    this.removeErrorDialog(errorData.id);
                    this.retryAttempts.delete(operation);
                } else {
                    throw new Error(result.error || 'Retry failed');
                }
            } else {
                // Generic retry - just remove the error
                this.removeErrorDialog(errorData.id);
                this.retryAttempts.delete(operation);
            }
            
        } catch (error) {
            // Retry failed, update error dialog
            this.updateErrorForRetry(errorData, error);
        }
    }

    /**
     * Show retry progress indication
     */
    showRetryProgress(errorId) {
        const dialog = document.getElementById(`errorDialog-${errorId}`);
        if (!dialog) return;

        const retryBtn = dialog.querySelector('.retry-btn');
        if (retryBtn) {
            const originalContent = retryBtn.innerHTML;
            retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying...';
            retryBtn.disabled = true;
            
            // Store original content for restoration if needed
            retryBtn.setAttribute('data-original-content', originalContent);
        }
    }

    /**
     * Show retry success message
     */
    showRetrySuccess(errorData) {
        this.showToast('Operation completed successfully!', 'success');
    }

    /**
     * Update error dialog after failed retry
     */
    updateErrorForRetry(errorData, newError) {
        const dialog = document.getElementById(`errorDialog-${errorData.id}`);
        if (!dialog) return;

        const attempts = this.retryAttempts.get(errorData.context.operation) || 0;
        
        // Update retry button
        const retryBtn = dialog.querySelector('.retry-btn');
        if (retryBtn) {
            if (attempts >= this.maxRetries) {
                retryBtn.innerHTML = '<i class="fas fa-times"></i> Max Retries Reached';
                retryBtn.disabled = true;
                retryBtn.classList.add('disabled');
            } else {
                const originalContent = retryBtn.getAttribute('data-original-content');
                retryBtn.innerHTML = originalContent || '<i class="fas fa-redo"></i> Try Again';
                retryBtn.disabled = false;
            }
        }

        // Update retry info
        const retryInfo = dialog.querySelector('.retry-info');
        if (retryInfo) {
            retryInfo.innerHTML = `
                <i class="fas fa-redo"></i>
                Attempt ${attempts + 1} of ${this.maxRetries}
            `;
        }
    }

    /**
     * Open contact support dialog
     */
    openContactSupport(errorData) {
        const supportInfo = {
            email: 'support@precisionhvacnorcal.com',
            phone: '(555) 123-4567',
            errorId: errorData.id,
            timestamp: errorData.timestamp
        };

        const supportHtml = `
            <div class="support-dialog" id="supportDialog">
                <div class="support-content">
                    <h3><i class="fas fa-headset"></i> Contact Support</h3>
                    <p>Need help? Here's how to reach us:</p>
                    
                    <div class="support-options">
                        <div class="support-option">
                            <i class="fas fa-phone"></i>
                            <div>
                                <strong>Call Us</strong>
                                <p><a href="tel:${supportInfo.phone}">${supportInfo.phone}</a></p>
                            </div>
                        </div>
                        
                        <div class="support-option">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <strong>Email Us</strong>
                                <p><a href="mailto:${supportInfo.email}?subject=Error%20Report%20${supportInfo.errorId}&body=Error%20ID:%20${supportInfo.errorId}%0ATimestamp:%20${supportInfo.timestamp}%0A%0APlease%20describe%20what%20you%20were%20doing%20when%20this%20error%20occurred:">${supportInfo.email}</a></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="support-info">
                        <p><strong>Error Reference:</strong> ${supportInfo.errorId}</p>
                        <p><small>Please include this error ID when contacting support</small></p>
                    </div>
                    
                    <button class="support-close-btn" onclick="document.getElementById('supportDialog').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', supportHtml);
    }

    /**
     * Highlight input fields with validation errors
     */
    highlightInputErrors(errorData) {
        if (errorData.context.invalidFields) {
            errorData.context.invalidFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.classList.add('error-highlight');
                    field.focus();
                    
                    // Remove highlight after interaction
                    field.addEventListener('input', () => {
                        field.classList.remove('error-highlight');
                    }, { once: true });
                }
            });
        }
    }

    /**
     * Show contextual help
     */
    showHelp(errorData) {
        let helpContent = '';
        
        switch (errorData.type) {
            case this.errorTypes.VALIDATION_ERROR:
                helpContent = this.getValidationHelp();
                break;
            case this.errorTypes.CALCULATION_ERROR:
                helpContent = this.getCalculationHelp();
                break;
            default:
                helpContent = this.getGeneralHelp();
        }

        this.showToast(helpContent, 'info', 8000);
    }

    /**
     * Get validation help content
     */
    getValidationHelp() {
        return `
            <strong>Input Validation Tips:</strong><br>
            • Square footage: 500-10,000 sq ft<br>
            • Ceiling height: 8-20 feet<br>
            • Number of occupants: 1-20 people<br>
            • Check that all required fields are filled
        `;
    }

    /**
     * Get calculation help content
     */
    getCalculationHelp() {
        return `
            <strong>Calculation Help:</strong><br>
            • Ensure all building measurements are accurate<br>
            • Check insulation and window selections<br>
            • Verify HVAC system information is complete<br>
            • Try refreshing the page and re-entering data
        `;
    }

    /**
     * Get general help content
     */
    getGeneralHelp() {
        return `
            <strong>Troubleshooting:</strong><br>
            • Check your internet connection<br>
            • Try refreshing the page<br>
            • Disable browser extensions temporarily<br>
            • Contact support if issues persist
        `;
    }

    /**
     * Enable offline mode functionality
     */
    enableOfflineMode(errorData) {
        this.showToast('Offline mode enabled. Some features may be limited.', 'info');
        
        // Store data locally for offline access
        if (errorData.context.formData) {
            localStorage.setItem('offline_form_data', JSON.stringify(errorData.context.formData));
        }
        
        this.removeErrorDialog(errorData.id);
    }

    /**
     * Show network status
     */
    showNetworkStatus(message, type) {
        this.showToast(message, type, 3000);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = this.getToastContainer();
        container.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    /**
     * Get appropriate icon for toast type
     */
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Setup keyboard accessibility
     */
    setupKeyboardAccessibility() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes error dialogs
            if (e.key === 'Escape') {
                const openDialogs = document.querySelectorAll('.error-dialog');
                openDialogs.forEach(dialog => {
                    const errorId = dialog.getAttribute('data-error-id');
                    this.removeErrorDialog(errorId);
                });
            }
            
            // Enter key activates focused error action
            if (e.key === 'Enter') {
                const focusedButton = document.activeElement;
                if (focusedButton && focusedButton.classList.contains('error-action-btn')) {
                    focusedButton.click();
                }
            }
        });
    }

    /**
     * Create error container
     */
    createErrorContainer() {
        if (!document.getElementById('errorContainer')) {
            const container = document.createElement('div');
            container.id = 'errorContainer';
            container.className = 'error-container';
            document.body.appendChild(container);
        }

        if (!document.getElementById('toastContainer')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        this.addErrorCSS();
    }

    /**
     * Get error container element
     */
    getErrorContainer() {
        return document.getElementById('errorContainer');
    }

    /**
     * Get toast container element
     */
    getToastContainer() {
        return document.getElementById('toastContainer');
    }

    /**
     * Remove error dialog
     */
    removeErrorDialog(errorId) {
        const dialog = document.getElementById(`errorDialog-${errorId}`);
        if (dialog) {
            dialog.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => dialog.remove(), 300);
        }
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Find error by ID (for demo purposes, in real app would be stored)
     */
    findErrorById(errorId) {
        return this.errorQueue.find(error => error.id === errorId);
    }

    /**
     * Log error for analytics
     */
    logError(errorData) {
        console.error('Error logged:', errorData);
        
        // In a real application, you would send this to an analytics service
        // this.sendErrorToAnalytics(errorData);
    }

    /**
     * Retry queued errors when connection is restored
     */
    retryQueuedErrors() {
        this.errorQueue.forEach(errorData => {
            if (errorData.type === this.errorTypes.NETWORK_ERROR) {
                this.retryOperation(errorData);
            }
        });
    }

    /**
     * Add CSS for error handling components
     */
    addErrorCSS() {
        const css = `
            <style>
            .error-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                width: 100%;
            }

            .error-dialog {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                margin-bottom: 1rem;
                border-left: 5px solid #dc3545;
                animation: slideIn 0.3s ease-out;
                overflow: hidden;
            }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            .error-dialog-content {
                padding: 0;
            }

            .error-header {
                display: flex;
                align-items: flex-start;
                padding: 1rem;
                background: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
            }

            .error-icon {
                color: #dc3545;
                font-size: 1.5rem;
                margin-right: 0.75rem;
                flex-shrink: 0;
            }

            .error-title {
                flex: 1;
            }

            .error-title h3 {
                margin: 0 0 0.25rem 0;
                font-size: 1.1rem;
                color: #333;
            }

            .error-id {
                font-size: 0.8rem;
                color: #6c757d;
            }

            .error-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                color: #6c757d;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .error-close:hover {
                background: #e9ecef;
                color: #495057;
            }

            .error-body {
                padding: 1rem;
            }

            .error-message {
                margin: 0 0 1rem 0;
                color: #495057;
                line-height: 1.5;
            }

            .error-details {
                margin: 1rem 0;
                border: 1px solid #dee2e6;
                border-radius: 6px;
            }

            .error-details summary {
                padding: 0.5rem;
                cursor: pointer;
                background: #f8f9fa;
                border-radius: 6px 6px 0 0;
                font-weight: 500;
            }

            .error-details pre {
                padding: 1rem;
                margin: 0;
                background: #f8f9fa;
                font-size: 0.8rem;
                overflow-x: auto;
            }

            .retry-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem;
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                margin-top: 1rem;
                font-size: 0.9rem;
                color: #856404;
            }

            .error-actions {
                display: flex;
                gap: 0.5rem;
                padding: 1rem;
                background: #f8f9fa;
                border-top: 1px solid #dee2e6;
                flex-wrap: wrap;
            }

            .error-action-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
                transition: all 0.2s;
                text-decoration: none;
            }

            .retry-btn {
                background: #007bff;
                color: white;
            }

            .retry-btn:hover:not(:disabled) {
                background: #0056b3;
            }

            .retry-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }

            .contact-btn {
                background: #28a745;
                color: white;
            }

            .contact-btn:hover {
                background: #1e7e34;
            }

            .fix-btn {
                background: #ffc107;
                color: #212529;
            }

            .fix-btn:hover {
                background: #e0a800;
            }

            .help-btn {
                background: #17a2b8;
                color: white;
            }

            .help-btn:hover {
                background: #117a8b;
            }

            .offline-btn {
                background: #6c757d;
                color: white;
            }

            .offline-btn:hover {
                background: #545b62;
            }

            .toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10001;
                max-width: 350px;
            }

            .toast {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem;
                margin-bottom: 0.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease-out;
            }

            .toast-success {
                background: #d4edda;
                border-left: 4px solid #28a745;
                color: #155724;
            }

            .toast-error {
                background: #f8d7da;
                border-left: 4px solid #dc3545;
                color: #721c24;
            }

            .toast-warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                color: #856404;
            }

            .toast-info {
                background: #d1ecf1;
                border-left: 4px solid #17a2b8;
                color: #0c5460;
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }

            .toast-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .toast-close:hover {
                opacity: 1;
            }

            .support-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10002;
            }

            .support-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }

            .support-content h3 {
                margin: 0 0 1rem 0;
                color: #333;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .support-options {
                margin: 1.5rem 0;
            }

            .support-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .support-option i {
                font-size: 1.5rem;
                color: #007bff;
            }

            .support-option a {
                color: #007bff;
                text-decoration: none;
            }

            .support-option a:hover {
                text-decoration: underline;
            }

            .support-info {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 6px;
                margin: 1rem 0;
            }

            .support-close-btn {
                width: 100%;
                padding: 0.75rem;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: background 0.2s;
            }

            .support-close-btn:hover {
                background: #545b62;
            }

            .error-highlight {
                border: 2px solid #dc3545 !important;
                background: #f8d7da !important;
                animation: shake 0.5s ease-in-out;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            @media (max-width: 768px) {
                .error-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .toast-container {
                    bottom: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .error-actions {
                    flex-direction: column;
                }

                .error-action-btn {
                    justify-content: center;
                }

                .support-content {
                    margin: 1rem;
                    width: calc(100% - 2rem);
                }
            }
            </style>
        `;

        if (!document.querySelector('style[data-error-handling]')) {
            document.head.insertAdjacentHTML('beforeend', css);
            document.querySelector('head style:last-child').setAttribute('data-error-handling', 'true');
        }
    }

    /**
     * Wrap calculation functions with error handling
     */
    wrapCalculationFunction(fn, operationName) {
        return async (...args) => {
            try {
                const result = await fn.apply(this, args);
                
                // Reset retry counter on success
                this.retryAttempts.delete(operationName);
                
                return result;
            } catch (error) {
                const errorId = this.handleError(error, {
                    operation: operationName,
                    args: args,
                    retryFunction: async () => {
                        try {
                            const result = await fn.apply(this, args);
                            return { success: true, result };
                        } catch (retryError) {
                            return { success: false, error: retryError.message };
                        }
                    }
                });
                
                // Return a default/fallback result or re-throw
                throw error;
            }
        };
    }
}

// Global instance and helper functions
window.ErrorHandling = ErrorHandling;

// Global error handling helper
window.handleCalculationError = (error, operation, retryFn) => {
    if (window.errorHandling) {
        return window.errorHandling.handleError(error, {
            operation: operation,
            retryFunction: retryFn
        });
    }
    console.error('Error handling not initialized:', error);
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const errorHandling = new ErrorHandling();
    errorHandling.init();
    window.errorHandling = errorHandling;
    
    console.log('Error handling system ready');
});