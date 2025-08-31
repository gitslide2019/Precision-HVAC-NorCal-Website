/**
 * UI Fixes and Enhancements
 * Addresses critical issues identified in UX testing
 */

// Initialize UI fixes when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    fixCTAButtons();
    enhanceFormValidation();
    improveMapInteraction();
    addLoadingStates();
    enhanceAccessibility();
});

// Fix #13: Mobile Navigation Menu
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            navMenu.classList.toggle('active');
            
            // Update aria-expanded for accessibility
            const isExpanded = navMenu.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            
            // Update icon
            mobileMenuToggle.textContent = isExpanded ? '✕' : '☰';
        });
        
        // Close menu when clicking on a link
        navMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.textContent = '☰';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.textContent = '☰';
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.textContent = '☰';
            }
        });
    }
}

// Fix #3: CTA Button Behavior
function fixCTAButtons() {
    // Fix header CTA button
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const buttonText = this.textContent.trim();
            
            if (buttonText.includes('Quote') || buttonText.includes('Consultation')) {
                // Scroll to contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    // If no contact section, scroll to bottom of page
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }
            } else if (buttonText.includes('Report')) {
                // Generate report functionality
                if (typeof generateReport === 'function') {
                    generateReport();
                } else {
                    alert('Please complete the assessment to generate a report.');
                }
            }
        });
    });
    
    // Fix hero CTA buttons
    document.querySelectorAll('.cta-primary, .cta-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            
            if (buttonText.includes('Consultation')) {
                e.preventDefault();
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else if (buttonText.includes('Savings')) {
                e.preventDefault();
                const rebatesSection = document.getElementById('rebates');
                if (rebatesSection) {
                    rebatesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Fix #6: Enhanced Form Validation
function enhanceFormValidation() {
    // Add real-time validation with realistic ranges
    const validationRules = {
        'year-built': { min: 1900, max: new Date().getFullYear(), type: 'number' },
        'total-area': { min: 400, max: 8000, type: 'number' },
        'ceiling-height': { min: 7, max: 20, type: 'number' },
        'occupants': { min: 1, max: 15, type: 'number' },
        'heating-temp': { min: 65, max: 78, type: 'number' },
        'cooling-temp': { min: 70, max: 82, type: 'number' },
        'window-area-north': { min: 0, max: 500, type: 'number' },
        'window-area-east': { min: 0, max: 500, type: 'number' },
        'window-area-south': { min: 0, max: 500, type: 'number' },
        'window-area-west': { min: 0, max: 500, type: 'number' },
        'heating-age': { min: 0, max: 50, type: 'number' },
        'cooling-age': { min: 0, max: 50, type: 'number' },
        'wh-age': { min: 0, max: 30, type: 'number' },
        'basement-depth': { min: 0, max: 12, type: 'number' }
    };
    
    Object.keys(validationRules).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            const rules = validationRules[fieldId];
            
            field.addEventListener('input', function() {
                validateFieldWithRules(this, rules);
            });
            
            field.addEventListener('blur', function() {
                validateFieldWithRules(this, rules);
            });
        }
    });
    
    // Validate window area total
    const windowFields = ['window-area-north', 'window-area-east', 'window-area-south', 'window-area-west'];
    windowFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', validateWindowAreas);
        }
    });
}

function validateFieldWithRules(field, rules) {
    const fieldGroup = field.closest('.input-group');
    if (!fieldGroup) return;
    
    // Remove existing validation classes and messages
    fieldGroup.classList.remove('field-valid', 'field-invalid');
    removeValidationMessage(fieldGroup);
    
    const value = parseFloat(field.value);
    let isValid = true;
    let message = '';
    
    if (field.value && rules.type === 'number') {
        if (isNaN(value)) {
            isValid = false;
            message = 'Please enter a valid number.';
        } else if (value < rules.min) {
            isValid = false;
            message = `Value must be at least ${rules.min}.`;
        } else if (value > rules.max) {
            isValid = false;
            message = `Value must be no more than ${rules.max}.`;
        }
    }
    
    // Apply validation state
    if (field.value) {
        fieldGroup.classList.add(isValid ? 'field-valid' : 'field-invalid');
        
        if (!isValid) {
            showValidationMessage(fieldGroup, message, 'error');
        }
    }
    
    return isValid;
}

function validateWindowAreas() {
    const totalAreaField = document.getElementById('total-area');
    const totalArea = parseFloat(totalAreaField?.value) || 0;
    
    if (totalArea === 0) return;
    
    const windowFields = ['window-area-north', 'window-area-east', 'window-area-south', 'window-area-west'];
    let totalWindowArea = 0;
    
    windowFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value) {
            totalWindowArea += parseFloat(field.value) || 0;
        }
    });
    
    // Window area should typically be 10-25% of floor area
    const maxReasonableWindows = totalArea * 0.35; // Allow up to 35% for flexibility
    
    if (totalWindowArea > maxReasonableWindows) {
        windowFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const fieldGroup = field?.closest('.input-group');
            if (fieldGroup && field.value) {
                fieldGroup.classList.add('field-invalid');
                showValidationMessage(fieldGroup, `Total window area (${totalWindowArea.toFixed(0)} sq ft) seems high for a ${totalArea} sq ft home.`, 'warning');
            }
        });
    }
}

function showValidationMessage(fieldGroup, message, type = 'error') {
    removeValidationMessage(fieldGroup);
    
    const messageEl = document.createElement('div');
    messageEl.className = `validation-message validation-${type}`;
    messageEl.textContent = message;
    
    fieldGroup.appendChild(messageEl);
}

function removeValidationMessage(fieldGroup) {
    const existingMessage = fieldGroup.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Fix #4: Improve Map Interaction on Mobile
function improveMapInteraction() {
    if (typeof L !== 'undefined' && window.eligibilityMap) {
        // Add mobile-specific map controls
        if (window.innerWidth <= 768) {
            // Add instruction overlay for mobile
            const mapContainer = document.getElementById('eligibility-map');
            if (mapContainer && !mapContainer.querySelector('.map-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'map-overlay';
                overlay.textContent = 'Use two fingers to zoom';
                mapContainer.parentElement.appendChild(overlay);
                
                // Hide overlay after 3 seconds
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.remove(), 300);
                }, 3000);
            }
        }
    }
}

// Fix #1: Add Loading States
function addLoadingStates() {
    // Add loading state to eligibility checker
    const checkButton = document.getElementById('check-eligibility');
    if (checkButton) {
        checkButton.addEventListener('click', function() {
            addButtonLoading(this);
            
            // Remove loading state after processing (handled by existing code)
            setTimeout(() => {
                removeButtonLoading(this);
            }, 2000);
        });
    }
    
    // Add loading state to calculations
    const calculateButton = document.getElementById('calculate-savings');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            addButtonLoading(this);
            
            setTimeout(() => {
                removeButtonLoading(this);
            }, 1500);
        });
    }
    
    // Add map loading indicator
    const mapContainer = document.getElementById('eligibility-map');
    if (mapContainer) {
        showMapLoading();
        
        // Remove loading when map is ready
        if (window.eligibilityMap) {
            window.eligibilityMap.on('load', hideMapLoading);
        } else {
            // Fallback timeout
            setTimeout(hideMapLoading, 3000);
        }
    }
}

function addButtonLoading(button) {
    if (button.classList.contains('btn-loading')) return;
    
    button.dataset.originalText = button.textContent;
    button.classList.add('btn-loading');
    button.disabled = true;
}

function removeButtonLoading(button) {
    button.classList.remove('btn-loading');
    button.disabled = false;
    
    if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}

function showMapLoading() {
    const mapContainer = document.getElementById('eligibility-map');
    if (mapContainer && !mapContainer.querySelector('.map-loading')) {
        const loading = document.createElement('div');
        loading.className = 'map-loading';
        loading.innerHTML = '<div class="loading-spinner"></div><p>Loading map...</p>';
        mapContainer.parentElement.appendChild(loading);
    }
}

function hideMapLoading() {
    const loading = document.querySelector('.map-loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 300);
    }
}

// Enhance Accessibility
function enhanceAccessibility() {
    // Add skip link
    if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    // Add main content landmark if it doesn't exist
    const mainContent = document.querySelector('main, #main-content');
    if (!mainContent) {
        const hero = document.querySelector('.hero, .eligibility-checker');
        if (hero) {
            hero.id = 'main-content';
            hero.setAttribute('role', 'main');
        }
    }
    
    // Enhance form labels
    document.querySelectorAll('input, select, textarea').forEach(field => {
        if (!field.getAttribute('aria-label') && !field.closest('.input-group')?.querySelector('label')) {
            const placeholder = field.getAttribute('placeholder');
            if (placeholder) {
                field.setAttribute('aria-label', placeholder);
            }
        }
    });
    
    // Add keyboard navigation for custom elements
    document.querySelectorAll('.carousel-btn').forEach(btn => {
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Fix #5: Better Error Messages for Address Validation
function enhanceAddressValidation() {
    const addressInput = document.getElementById('address-search');
    const checkButton = document.getElementById('check-eligibility');
    
    if (addressInput && checkButton) {
        // Add input validation
        addressInput.addEventListener('input', function() {
            const value = this.value.trim();
            const fieldGroup = this.closest('.address-input') || this.parentElement;
            
            // Remove existing validation
            fieldGroup.classList.remove('field-valid', 'field-invalid');
            
            if (value.length > 0) {
                // Basic address format validation
                const hasNumber = /\d/.test(value);
                const hasComma = value.includes(',');
                
                if (value.length < 5) {
                    fieldGroup.classList.add('field-invalid');
                } else if (hasNumber && (hasComma || value.toLowerCase().includes('ca'))) {
                    fieldGroup.classList.add('field-valid');
                }
            }
        });
        
        // Enhanced check eligibility with better error messages
        const originalCheckEligibility = window.checkAddressEligibility;
        if (originalCheckEligibility) {
            window.checkAddressEligibility = function(address) {
                const statusElement = document.getElementById('eligibility-status');
                const rebateInfo = document.getElementById('rebate-info');
                
                if (!address || address.length < 5) {
                    statusElement.innerHTML = `<span style="color: #dc3545; font-weight: bold;">Please enter a complete address</span>`;
                    rebateInfo.innerHTML = `<p style="color: #666; font-size: 14px;">Enter your street address, city, and state (e.g., "123 Main St, Oakland, CA")</p>`;
                    return;
                }
                
                // Call original function with enhanced error handling
                try {
                    originalCheckEligibility(address);
                } catch (error) {
                    statusElement.innerHTML = `<span style="color: #dc3545; font-weight: bold;">Address lookup failed</span>`;
                    rebateInfo.innerHTML = `<p style="color: #666; font-size: 14px;">Please check your address and try again, or <a href="#contact" style="color: #007bff;">contact us directly</a>.</p>`;
                }
            };
        }
    }
}

// Performance optimization: Debounce function for input events
function debounce(func, wait) {
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

// Apply debouncing to input validation
document.addEventListener('DOMContentLoaded', function() {
    const debouncedValidation = debounce(validateWindowAreas, 500);
    
    ['window-area-north', 'window-area-east', 'window-area-south', 'window-area-west'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', debouncedValidation);
        }
    });
});

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.UIFixes = {
        addButtonLoading,
        removeButtonLoading,
        showValidationMessage,
        removeValidationMessage,
        validateFieldWithRules
    };
}