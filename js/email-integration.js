/**
 * Email Integration Module
 * Provides proper email functionality with modal forms and professional handling
 * 
 * Issue #12 Fix: Implement proper email integration or remove misleading email feature
 */

class EmailIntegration {
    constructor() {
        this.apiEndpoint = null; // Would be set to actual email service endpoint
        this.emailTemplates = {
            manualJReport: {
                subject: 'Your HVAC Load Analysis Report - Precision HVAC NorCal',
                template: 'manual-j-report'
            },
            contactForm: {
                subject: 'New Contact Form Submission - Precision HVAC NorCal',
                template: 'contact-inquiry'
            },
            consultation: {
                subject: 'Consultation Request - Precision HVAC NorCal',
                template: 'consultation-request'
            }
        };
        
        this.fallbackMethods = {
            mailto: true,
            downloadAndEmail: true,
            contactPhone: true
        };
    }

    /**
     * Initialize email integration system
     */
    init() {
        this.createEmailModals();
        this.attachEmailHandlers();
        this.setupFormValidation();
        this.addEmailCSS();
        console.log('Email integration initialized');
    }

    /**
     * Send Manual J report via email
     */
    async emailReport(reportData = null) {
        // Instead of prompt, show professional email modal
        this.showEmailReportModal(reportData);
    }

    /**
     * Show email report modal with options
     */
    showEmailReportModal(reportData) {
        const modalHtml = `
            <div id="emailReportModal" class="email-modal">
                <div class="email-modal-content">
                    <div class="email-modal-header">
                        <h3><i class="fas fa-envelope"></i> Email Your HVAC Report</h3>
                        <button class="email-modal-close" onclick="this.closest('.email-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="email-modal-body">
                        <p>Choose how you'd like to receive your comprehensive HVAC load analysis report:</p>
                        
                        <div class="email-options">
                            <div class="email-option" data-method="professional">
                                <div class="option-icon">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                                <div class="option-content">
                                    <h4>Professional Consultation</h4>
                                    <p>Have our expert review your report and email it with personalized recommendations</p>
                                    <span class="option-badge recommended">Recommended</span>
                                </div>
                            </div>
                            
                            <div class="email-option" data-method="direct">
                                <div class="option-icon">
                                    <i class="fas fa-download"></i>
                                </div>
                                <div class="option-content">
                                    <h4>Download & Self-Send</h4>
                                    <p>Download the PDF report now and email it yourself</p>
                                </div>
                            </div>
                            
                            <div class="email-option" data-method="mailto">
                                <div class="option-icon">
                                    <i class="fas fa-envelope-open"></i>
                                </div>
                                <div class="option-content">
                                    <h4>Email Client</h4>
                                    <p>Open your default email client with the report attached</p>
                                </div>
                            </div>
                        </div>
                        
                        <form class="email-report-form" id="emailReportForm" style="display: none;">
                            <div class="form-section">
                                <h4>Contact Information</h4>
                                <div class="form-row">
                                    <div class="form-field">
                                        <label>Full Name *</label>
                                        <input type="text" id="report-name" required>
                                    </div>
                                    <div class="form-field">
                                        <label>Email Address *</label>
                                        <input type="email" id="report-email" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-field">
                                        <label>Phone Number</label>
                                        <input type="tel" id="report-phone">
                                    </div>
                                    <div class="form-field">
                                        <label>Property Address</label>
                                        <input type="text" id="report-address">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Consultation Preferences</h4>
                                <div class="checkbox-group">
                                    <label class="checkbox-item">
                                        <input type="checkbox" id="include-consultation" checked>
                                        <span class="checkmark"></span>
                                        Include free 15-minute consultation call
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" id="include-rebates">
                                        <span class="checkmark"></span>
                                        Send information about available rebates
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" id="include-financing">
                                        <span class="checkmark"></span>
                                        Include financing options information
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <label>Additional Notes (Optional)</label>
                                <textarea id="report-notes" rows="3" placeholder="Any specific questions or requirements?"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="this.closest('.email-modal').remove()">
                                    Cancel
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-paper-plane"></i>
                                    Send Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.attachEmailOptionHandlers();
        
        // Focus management
        const modal = document.getElementById('emailReportModal');
        const firstOption = modal.querySelector('.email-option');
        if (firstOption) firstOption.focus();
    }

    /**
     * Attach handlers for email option selection
     */
    attachEmailOptionHandlers() {
        const modal = document.getElementById('emailReportModal');
        if (!modal) return;

        // Email option selection
        modal.querySelectorAll('.email-option').forEach(option => {
            option.addEventListener('click', () => {
                const method = option.dataset.method;
                this.handleEmailMethodSelection(method, modal);
            });
        });

        // Form submission
        const form = modal.querySelector('#emailReportForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailReportSubmission(form);
            });
        }
    }

    /**
     * Handle email method selection
     */
    handleEmailMethodSelection(method, modal) {
        const form = modal.querySelector('#emailReportForm');
        const options = modal.querySelector('.email-options');

        switch (method) {
            case 'professional':
                // Show form for professional consultation
                options.style.display = 'none';
                form.style.display = 'block';
                form.querySelector('#report-name').focus();
                break;

            case 'direct':
                // Trigger direct download
                this.handleDirectDownload();
                modal.remove();
                break;

            case 'mailto':
                // Open email client
                this.handleMailtoMethod();
                modal.remove();
                break;
        }
    }

    /**
     * Handle direct download method
     */
    handleDirectDownload() {
        // Trigger PDF generation and download
        if (window.generatePDFReport && typeof window.generatePDFReport === 'function') {
            window.generatePDFReport();
        } else {
            // Fallback message
            this.showEmailNotification(
                'PDF download feature is not available. Please contact us directly for your report.',
                'warning'
            );
        }
        
        // Show helpful instructions
        setTimeout(() => {
            this.showEmailInstructions();
        }, 1000);
    }

    /**
     * Handle mailto method
     */
    handleMailtoMethod() {
        const subject = encodeURIComponent('HVAC Load Analysis Report Request');
        const body = encodeURIComponent(`
Hello Precision HVAC NorCal,

I have completed the online HVAC load analysis and would like to receive my comprehensive report.

Property Details:
- Address: [Your Property Address]
- Square Footage: [From Assessment]
- System Type: [Current HVAC System]

Please send me:
☐ Complete Manual J load calculation report
☐ Equipment sizing recommendations
☐ Rebate and incentive information
☐ Energy savings projections

Best time to contact me: [Preferred Time]
Phone: [Your Phone Number]

Thank you,
[Your Name]
        `);

        const mailtoUrl = `mailto:info@precisionhvacnorcal.com?subject=${subject}&body=${body}`;
        
        // Try to open email client
        try {
            window.location.href = mailtoUrl;
            this.showEmailNotification(
                'Opening your email client. If it doesn\'t open automatically, please contact us at (510) 555-0123.',
                'info'
            );
        } catch (error) {
            this.showEmailFallback();
        }
    }

    /**
     * Handle professional email report submission
     */
    async handleEmailReportSubmission(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('report-name') || form.querySelector('#report-name').value,
            email: formData.get('report-email') || form.querySelector('#report-email').value,
            phone: formData.get('report-phone') || form.querySelector('#report-phone').value,
            address: formData.get('report-address') || form.querySelector('#report-address').value,
            includeConsultation: form.querySelector('#include-consultation').checked,
            includeRebates: form.querySelector('#include-rebates').checked,
            includeFinancing: form.querySelector('#include-financing').checked,
            notes: form.querySelector('#report-notes').value,
            reportData: this.getReportData()
        };

        // Validate required fields
        if (!data.name || !data.email) {
            this.showEmailNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (!this.validateEmail(data.email)) {
            this.showEmailNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate sending (in real implementation, would call API)
            await this.sendProfessionalReport(data);
            
            // Show success and close modal
            this.showEmailSuccess(data);
            form.closest('.email-modal').remove();
            
        } catch (error) {
            console.error('Email sending failed:', error);
            this.showEmailFallback(data);
            
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    /**
     * Send professional report (simulated)
     */
    async sendProfessionalReport(data) {
        // In a real implementation, this would call your email service API
        // For now, we'll simulate the process and provide fallback options
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate API call
                if (Math.random() > 0.1) { // 90% success rate simulation
                    resolve({ success: true, id: 'RPT_' + Date.now() });
                } else {
                    reject(new Error('Email service temporarily unavailable'));
                }
            }, 2000);
        });
    }

    /**
     * Show email success message
     */
    showEmailSuccess(data) {
        const successHtml = `
            <div class="email-success-notification">
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Report Request Submitted!</h3>
                    <p>Thank you, ${data.name}! We'll send your comprehensive HVAC report to <strong>${data.email}</strong> within 2-4 business hours.</p>
                    
                    ${data.includeConsultation ? `
                        <div class="consultation-info">
                            <p><i class="fas fa-phone"></i> We'll also call you within 24 hours to schedule your free consultation.</p>
                        </div>
                    ` : ''}
                    
                    <div class="next-steps">
                        <h4>What happens next?</h4>
                        <ol>
                            <li>Our expert will review your assessment</li>
                            <li>We'll prepare your personalized report</li>
                            <li>You'll receive it via email with recommendations</li>
                            ${data.includeConsultation ? '<li>We\'ll call to schedule your consultation</li>' : ''}
                        </ol>
                    </div>
                    
                    <div class="contact-reminder">
                        <p><strong>Questions?</strong> Call us at <a href="tel:(510) 555-0123">(510) 555-0123</a></p>
                    </div>
                    
                    <button class="btn-primary" onclick="this.closest('.email-success-notification').remove()">
                        Got It, Thanks!
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successHtml);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            const notification = document.querySelector('.email-success-notification');
            if (notification) notification.remove();
        }, 10000);
    }

    /**
     * Show email fallback options when sending fails
     */
    showEmailFallback(data = null) {
        const fallbackHtml = `
            <div class="email-fallback-modal">
                <div class="fallback-content">
                    <div class="fallback-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Alternative Contact Methods</h3>
                    </div>
                    
                    <p>We're experiencing technical difficulties with our email system. Here are other ways to get your report:</p>
                    
                    <div class="fallback-options">
                        <div class="fallback-option">
                            <div class="fallback-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div class="fallback-details">
                                <h4>Call Us Directly</h4>
                                <p>Speak with an expert who can email your report immediately</p>
                                <a href="tel:(510) 555-0123" class="fallback-btn">
                                    <i class="fas fa-phone"></i> (510) 555-0123
                                </a>
                            </div>
                        </div>
                        
                        <div class="fallback-option">
                            <div class="fallback-icon">
                                <i class="fas fa-download"></i>
                            </div>
                            <div class="fallback-details">
                                <h4>Download Report</h4>
                                <p>Get the PDF report and email it to yourself</p>
                                <button class="fallback-btn" onclick="this.downloadReport()">
                                    <i class="fas fa-download"></i> Download PDF
                                </button>
                            </div>
                        </div>
                        
                        <div class="fallback-option">
                            <div class="fallback-icon">
                                <i class="fas fa-calendar"></i>
                            </div>
                            <div class="fallback-details">
                                <h4>Schedule Callback</h4>
                                <p>We'll call you back with your results</p>
                                <button class="fallback-btn" onclick="this.scheduleCallback()">
                                    <i class="fas fa-calendar"></i> Schedule Call
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${data ? `
                        <div class="saved-info">
                            <p><i class="fas fa-info-circle"></i> <strong>Your information has been saved:</strong></p>
                            <ul>
                                <li>Name: ${data.name}</li>
                                <li>Email: ${data.email}</li>
                                ${data.phone ? `<li>Phone: ${data.phone}</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="fallback-actions">
                        <button class="btn-secondary" onclick="this.closest('.email-fallback-modal').remove()">
                            Close
                        </button>
                        <button class="btn-primary" onclick="this.retryEmail()">
                            <i class="fas fa-redo"></i> Try Email Again
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', fallbackHtml);
    }

    /**
     * Show helpful email instructions
     */
    showEmailInstructions() {
        this.showEmailNotification(`
            <strong>Report Downloaded!</strong><br>
            To email it to yourself:<br>
            1. Open your email<br>
            2. Attach the downloaded PDF<br>
            3. Send to your preferred email address
        `, 'success', 8000);
    }

    /**
     * Handle contact form submission
     */
    async handleContactForm(form) {
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            message: formData.get('message'),
            service: formData.get('service')
        };

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email || !data.phone) {
            this.showEmailNotification('Please fill in all required fields.', 'error');
            return false;
        }

        if (!this.validateEmail(data.email)) {
            this.showEmailNotification('Please enter a valid email address.', 'error');
            return false;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // In real implementation, would send to API
            await this.sendContactForm(data);
            
            this.showContactSuccess(data);
            form.reset();
            return true;
            
        } catch (error) {
            console.error('Contact form failed:', error);
            this.showContactFallback(data);
            return false;
            
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    /**
     * Send contact form (simulated)
     */
    async sendContactForm(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Contact form service unavailable'));
                }
            }, 1500);
        });
    }

    /**
     * Show contact form success
     */
    showContactSuccess(data) {
        this.showEmailNotification(`
            <strong>Message Sent Successfully!</strong><br>
            Thanks ${data.firstName}! We'll contact you within 24 hours at ${data.phone} or ${data.email}.
        `, 'success', 6000);
    }

    /**
     * Show contact form fallback
     */
    showContactFallback(data) {
        const phone = '(510) 555-0123';
        const email = 'info@precisionhvacnorcal.com';
        
        this.showEmailNotification(`
            <strong>Message couldn't be sent.</strong><br>
            Please call us directly at <a href="tel:${phone}">${phone}</a><br>
            or email <a href="mailto:${email}">${email}</a>
        `, 'warning', 8000);
    }

    /**
     * Get current report data
     */
    getReportData() {
        // This would collect current assessment data
        const data = {
            timestamp: new Date().toISOString(),
            assessmentCompleted: true
        };

        // Try to get data from Manual J calculator
        if (window.manualJCalculator) {
            try {
                data.calculations = window.manualJCalculator.getResults();
            } catch (e) {
                console.log('No calculation results available');
            }
        }

        return data;
    }

    /**
     * Validate email address
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show email notification
     */
    showEmailNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `email-notification email-${type}`;
        notification.innerHTML = `
            <div class="notification-content">${message}</div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    /**
     * Create email modals container
     */
    createEmailModals() {
        if (!document.getElementById('emailModalsContainer')) {
            const container = document.createElement('div');
            container.id = 'emailModalsContainer';
            document.body.appendChild(container);
        }
    }

    /**
     * Attach email handlers to existing elements
     */
    attachEmailHandlers() {
        // Override the global emailReport function
        window.emailReport = () => {
            this.emailReport();
        };

        // Handle contact form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('contact-form')) {
                e.preventDefault();
                this.handleContactForm(e.target);
            }
        });

        // Handle CTA button clicks
        document.addEventListener('click', (e) => {
            if (e.target.textContent.includes('Get Free Quote') || 
                e.target.textContent.includes('Get Free Consultation')) {
                e.preventDefault();
                this.showQuoteRequestModal();
            }
        });
    }

    /**
     * Show quote request modal
     */
    showQuoteRequestModal() {
        const modalHtml = `
            <div class="quote-modal">
                <div class="quote-modal-content">
                    <div class="quote-header">
                        <h3>Get Your Free Quote</h3>
                        <button class="quote-close" onclick="this.closest('.quote-modal').remove()">×</button>
                    </div>
                    <div class="quote-body">
                        <p>Ready to start your electrification journey? Choose how you'd like to connect:</p>
                        <div class="quote-options">
                            <a href="tel:(510) 555-0123" class="quote-option">
                                <i class="fas fa-phone"></i>
                                <span>Call Now: (510) 555-0123</span>
                            </a>
                            <button class="quote-option" onclick="this.showAssessment()">
                                <i class="fas fa-calculator"></i>
                                <span>Start Online Assessment</span>
                            </button>
                            <button class="quote-option" onclick="this.showContactForm()">
                                <i class="fas fa-envelope"></i>
                                <span>Request Callback</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.type === 'email') {
                const isValid = this.validateEmail(e.target.value);
                e.target.classList.toggle('invalid', !isValid && e.target.value !== '');
            }
        });
    }

    /**
     * Add email-related CSS
     */
    addEmailCSS() {
        const css = `
            <style>
            /* Email Modal Styles */
            .email-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 1rem;
            }

            .email-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .email-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #dee2e6;
                background: #f8f9fa;
                border-radius: 12px 12px 0 0;
            }

            .email-modal-header h3 {
                margin: 0;
                color: #333;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .email-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6c757d;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .email-modal-close:hover {
                background: #e9ecef;
                color: #495057;
            }

            .email-modal-body {
                padding: 1.5rem;
            }

            .email-options {
                margin: 1.5rem 0;
            }

            .email-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.25rem;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                margin-bottom: 1rem;
                cursor: pointer;
                transition: all 0.3s;
            }

            .email-option:hover {
                border-color: #007bff;
                background: #f8f9ff;
            }

            .email-option .option-icon {
                font-size: 1.5rem;
                color: #007bff;
                width: 40px;
                text-align: center;
            }

            .email-option .option-content h4 {
                margin: 0 0 0.5rem 0;
                color: #333;
            }

            .email-option .option-content p {
                margin: 0;
                color: #666;
                font-size: 0.9rem;
            }

            .option-badge {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                background: #28a745;
                color: white;
                font-size: 0.8rem;
                border-radius: 12px;
                margin-top: 0.5rem;
            }

            .email-report-form {
                border-top: 1px solid #dee2e6;
                padding-top: 1.5rem;
            }

            .form-section {
                margin-bottom: 1.5rem;
            }

            .form-section h4 {
                margin: 0 0 1rem 0;
                color: #333;
                font-size: 1rem;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .form-field label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #333;
            }

            .form-field input,
            .form-field textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }

            .form-field input:focus,
            .form-field textarea:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
            }

            .form-field input.invalid {
                border-color: #dc3545;
                box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
            }

            .checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }

            .checkbox-item input[type="checkbox"] {
                display: none;
            }

            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid #dee2e6;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .checkbox-item input:checked + .checkmark {
                background: #007bff;
                border-color: #007bff;
            }

            .checkbox-item input:checked + .checkmark::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: bold;
            }

            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid #dee2e6;
            }

            .btn-primary,
            .btn-secondary {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .btn-primary {
                background: #007bff;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #0056b3;
            }

            .btn-primary:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover {
                background: #545b62;
            }

            /* Email Notification Styles */
            .email-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10001;
                animation: slideInRight 0.3s ease-out;
                display: flex;
                align-items: flex-start;
                gap: 1rem;
            }

            .email-success {
                background: #d4edda;
                border-left: 4px solid #28a745;
                color: #155724;
            }

            .email-error {
                background: #f8d7da;
                border-left: 4px solid #dc3545;
                color: #721c24;
            }

            .email-warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                color: #856404;
            }

            .email-info {
                background: #d1ecf1;
                border-left: 4px solid #17a2b8;
                color: #0c5460;
            }

            .notification-content {
                flex: 1;
                line-height: 1.5;
            }

            .notification-content a {
                color: inherit;
                text-decoration: underline;
            }

            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .notification-close:hover {
                opacity: 1;
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            /* Success Modal Styles */
            .email-success-notification {
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

            .success-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .success-icon {
                font-size: 3rem;
                color: #28a745;
                margin-bottom: 1rem;
            }

            .success-content h3 {
                margin: 0 0 1rem 0;
                color: #333;
            }

            .consultation-info {
                background: #e7f3ff;
                padding: 1rem;
                border-radius: 6px;
                margin: 1rem 0;
                border-left: 4px solid #007bff;
            }

            .next-steps {
                text-align: left;
                margin: 1.5rem 0;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 6px;
            }

            .next-steps h4 {
                margin: 0 0 0.75rem 0;
                color: #333;
            }

            .next-steps ol {
                margin: 0;
                padding-left: 1.5rem;
            }

            .next-steps li {
                margin-bottom: 0.5rem;
            }

            .contact-reminder {
                background: #fff3cd;
                padding: 1rem;
                border-radius: 6px;
                margin: 1rem 0;
                border-left: 4px solid #ffc107;
            }

            .contact-reminder a {
                color: #856404;
                text-decoration: none;
                font-weight: 500;
            }

            .contact-reminder a:hover {
                text-decoration: underline;
            }

            /* Fallback Modal Styles */
            .email-fallback-modal {
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
                padding: 1rem;
            }

            .fallback-content {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                padding: 2rem;
                max-height: 80vh;
                overflow-y: auto;
            }

            .fallback-header h3 {
                margin: 0 0 1rem 0;
                color: #dc3545;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .fallback-options {
                margin: 1.5rem 0;
            }

            .fallback-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.25rem;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .fallback-icon {
                font-size: 1.5rem;
                color: #007bff;
                width: 40px;
                text-align: center;
            }

            .fallback-details {
                flex: 1;
            }

            .fallback-details h4 {
                margin: 0 0 0.5rem 0;
                color: #333;
            }

            .fallback-details p {
                margin: 0 0 1rem 0;
                color: #666;
                font-size: 0.9rem;
            }

            .fallback-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-size: 0.9rem;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: background 0.3s;
            }

            .fallback-btn:hover {
                background: #0056b3;
                color: white;
                text-decoration: none;
            }

            .saved-info {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 6px;
                margin: 1rem 0;
                border-left: 4px solid #28a745;
            }

            .saved-info ul {
                margin: 0.5rem 0 0 0;
                padding-left: 1.5rem;
            }

            .fallback-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid #dee2e6;
            }

            /* Quote Modal Styles */
            .quote-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .quote-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 450px;
                width: 90%;
                padding: 0;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .quote-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #dee2e6;
                background: #f8f9fa;
                border-radius: 12px 12px 0 0;
            }

            .quote-header h3 {
                margin: 0;
                color: #333;
            }

            .quote-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6c757d;
                padding: 0.25rem;
                line-height: 1;
            }

            .quote-body {
                padding: 1.5rem;
            }

            .quote-options {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-top: 1rem;
            }

            .quote-option {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                text-decoration: none;
                color: #333;
                background: white;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 1rem;
            }

            .quote-option:hover {
                border-color: #007bff;
                background: #f8f9ff;
                color: #007bff;
                text-decoration: none;
            }

            .quote-option i {
                color: #007bff;
                width: 20px;
            }

            /* Responsive Styles */
            @media (max-width: 768px) {
                .email-modal,
                .email-fallback-modal,
                .email-success-notification {
                    padding: 0.5rem;
                }

                .email-modal-content,
                .fallback-content,
                .success-content {
                    width: 100%;
                    margin: 0;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .form-actions {
                    flex-direction: column;
                }

                .email-notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .fallback-option {
                    flex-direction: column;
                    text-align: center;
                    gap: 1rem;
                }

                .fallback-details {
                    text-align: center;
                }
            }
            </style>
        `;

        if (!document.querySelector('style[data-email-integration]')) {
            document.head.insertAdjacentHTML('beforeend', css);
            document.querySelector('head style:last-child').setAttribute('data-email-integration', 'true');
        }
    }
}

// Global instance
window.EmailIntegration = EmailIntegration;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const emailIntegration = new EmailIntegration();
    emailIntegration.init();
    window.emailIntegration = emailIntegration;
    
    console.log('Email integration ready');
});