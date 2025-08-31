/**
 * Progressive Form Disclosure
 * Shows/hides form fields based on user selections to reduce cognitive load
 */

class ProgressiveForms {
    constructor() {
        this.conditionalFields = new Map();
        this.fieldDependencies = new Map();
        this.init();
    }
    
    init() {
        this.setupConditionalLogic();
        this.bindEvents();
        this.initializeFieldStates();
    }
    
    setupConditionalLogic() {
        // Define field dependencies and conditions
        this.conditionalFields.set('foundation-insulation', {
            dependsOn: 'foundation-type',
            conditions: {
                'slab': { show: false, reason: 'Slab foundations typically don\'t have insulation options' },
                'crawlspace-vented': { show: true },
                'crawlspace-unvented': { show: true },
                'basement-conditioned': { show: true },
                'basement-unconditioned': { show: true }
            }
        });
        
        this.conditionalFields.set('basement-depth', {
            dependsOn: 'foundation-type',
            conditions: {
                'slab': { show: false },
                'crawlspace-vented': { show: false },
                'crawlspace-unvented': { show: false },
                'basement-conditioned': { show: true },
                'basement-unconditioned': { show: true }
            }
        });
        
        this.conditionalFields.set('attic-type', {
            dependsOn: 'roof-type',
            conditions: {
                'flat': { show: false, reason: 'Flat roofs don\'t have attic spaces' },
                'gable': { show: true },
                'hip': { show: true },
                'shed': { show: true },
                'complex': { show: true }
            }
        });
        
        // Window frame conditional on window type
        this.conditionalFields.set('window-frame', {
            dependsOn: 'window-type',
            conditions: {
                '': { show: false },
                'single-pane': { show: true },
                'double-pane': { show: true },
                'double-pane-lowE': { show: true },
                'triple-pane': { show: true },
                'triple-pane-lowE': { show: true }
            }
        });
        
        // HVAC age fields conditional on system types
        this.conditionalFields.set('heating-age', {
            dependsOn: 'heating-system',
            conditions: {
                'none': { show: false, reason: 'No heating system selected' },
                '': { show: false }
            },
            defaultShow: true
        });
        
        this.conditionalFields.set('cooling-age', {
            dependsOn: 'cooling-system',
            conditions: {
                'none': { show: false, reason: 'No cooling system selected' },
                '': { show: false }
            },
            defaultShow: true
        });
        
        // Duct location conditional on ductwork condition
        this.conditionalFields.set('duct-location', {
            dependsOn: 'ductwork',
            conditions: {
                'none': { show: false, reason: 'No ductwork present' },
                '': { show: false },
                'excellent': { show: true },
                'good': { show: true },
                'fair': { show: true },
                'poor': { show: true }
            }
        });
        
        // Water heater age conditional on type
        this.conditionalFields.set('wh-age', {
            dependsOn: 'water-heater',
            conditions: {
                '': { show: false }
            },
            defaultShow: true
        });
        
        // Advanced grouping - show detailed window inputs only if user has windows
        this.setupWindowGrouping();
        this.setupAppllianceGrouping();
    }
    
    setupWindowGrouping() {
        // Group window orientation fields
        const windowOrientationFields = [
            'window-area-north', 'window-area-east', 
            'window-area-south', 'window-area-west'
        ];
        
        // Show detailed window inputs only after window type is selected
        windowOrientationFields.forEach(fieldId => {
            this.conditionalFields.set(fieldId, {
                dependsOn: 'window-type',
                conditions: {
                    '': { show: false, reason: 'Select window type first' }
                },
                defaultShow: true,
                groupLabel: 'Window Area by Orientation'
            });
        });
    }
    
    setupAppllianceGrouping() {
        // Create appliance section that shows after basic info
        const applianceFields = ['pool-pump', 'electric-vehicle', 'hot-tub', 'electric-range', 'electric-dryer'];
        
        applianceFields.forEach(fieldId => {
            this.conditionalFields.set(fieldId, {
                dependsOn: 'total-area',
                conditions: {
                    '': { show: false, reason: 'Enter home size first' }
                },
                defaultShow: true,
                groupLabel: 'Additional Electric Appliances'
            });
        });
    }
    
    bindEvents() {
        // Listen for changes on all form inputs
        document.addEventListener('change', (e) => {
            const fieldId = e.target.id;
            this.updateDependentFields(fieldId, e.target.value);
        });
        
        // Also listen for input events for real-time updates
        document.addEventListener('input', (e) => {
            if (e.target.type === 'number' || e.target.type === 'text') {
                const fieldId = e.target.id;
                this.updateDependentFields(fieldId, e.target.value);
            }
        });
    }
    
    initializeFieldStates() {
        // Set initial states for all conditional fields
        this.conditionalFields.forEach((config, fieldId) => {
            const field = document.getElementById(fieldId);
            const dependentField = document.getElementById(config.dependsOn);
            
            if (field && dependentField) {
                this.updateFieldVisibility(fieldId, dependentField.value, config);
            }
        });
        
        // Create progressive sections
        this.createProgressiveSections();
    }
    
    updateDependentFields(changedFieldId, newValue) {
        // Find all fields that depend on the changed field
        this.conditionalFields.forEach((config, fieldId) => {
            if (config.dependsOn === changedFieldId) {
                this.updateFieldVisibility(fieldId, newValue, config);
            }
        });
        
        // Update progressive sections
        this.updateProgressiveSections();
    }
    
    updateFieldVisibility(fieldId, dependencyValue, config) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const fieldGroup = field.closest('.input-group');
        if (!fieldGroup) return;
        
        let shouldShow = config.defaultShow !== false;
        let reason = '';
        
        // Check conditions
        if (config.conditions) {
            const condition = config.conditions[dependencyValue];
            if (condition !== undefined) {
                shouldShow = condition.show !== false;
                reason = condition.reason || '';
            } else if (config.conditions['']) {
                // Default condition for empty values
                shouldShow = config.conditions[''].show !== false;
                reason = config.conditions[''].reason || '';
            }
        }
        
        // Apply visibility with animation
        if (shouldShow) {
            this.showFieldWithAnimation(fieldGroup, fieldId);
        } else {
            this.hideFieldWithAnimation(fieldGroup, reason);
        }
    }
    
    showFieldWithAnimation(fieldGroup, fieldId) {
        if (fieldGroup.style.display === 'none' || fieldGroup.classList.contains('field-hidden')) {
            fieldGroup.style.display = 'block';
            fieldGroup.classList.remove('field-hidden');
            fieldGroup.classList.add('field-showing');
            
            // Animate in
            fieldGroup.style.opacity = '0';
            fieldGroup.style.transform = 'translateY(-10px)';
            fieldGroup.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                fieldGroup.style.opacity = '1';
                fieldGroup.style.transform = 'translateY(0)';
            }, 10);
            
            // Remove animation classes
            setTimeout(() => {
                fieldGroup.classList.remove('field-showing');
                fieldGroup.style.transition = '';
            }, 300);
            
            // Remove any existing reason messages
            this.removeReasonMessage(fieldGroup);
        }
    }
    
    hideFieldWithAnimation(fieldGroup, reason = '') {
        if (fieldGroup.style.display !== 'none' && !fieldGroup.classList.contains('field-hidden')) {
            fieldGroup.classList.add('field-hiding');
            fieldGroup.style.transition = 'all 0.3s ease';
            fieldGroup.style.opacity = '0';
            fieldGroup.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                fieldGroup.style.display = 'none';
                fieldGroup.classList.remove('field-hiding');
                fieldGroup.classList.add('field-hidden');
                fieldGroup.style.transition = '';
                
                // Show reason if provided
                if (reason) {
                    this.showReasonMessage(fieldGroup, reason);
                }
            }, 300);
        }
    }
    
    showReasonMessage(fieldGroup, reason) {
        this.removeReasonMessage(fieldGroup);
        
        const reasonEl = document.createElement('div');
        reasonEl.className = 'field-hidden-reason';
        reasonEl.style.cssText = `
            padding: 0.75rem;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            color: #6c757d;
            font-size: 0.875rem;
            font-style: italic;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        reasonEl.innerHTML = `<span style="color: #fbbf24;">ℹ️</span> ${reason}`;
        
        fieldGroup.parentNode.insertBefore(reasonEl, fieldGroup);
    }
    
    removeReasonMessage(fieldGroup) {
        const existingReason = fieldGroup.parentNode?.querySelector('.field-hidden-reason');
        if (existingReason) {
            existingReason.remove();
        }
    }
    
    createProgressiveSections() {
        // Group related fields into collapsible sections
        this.createSection('building-basics', [
            'home-type', 'year-built', 'total-area', 'ceiling-height', 'stories', 'orientation'
        ], 'Basic Building Information');
        
        this.createSection('occupancy-preferences', [
            'occupants', 'usage-type', 'heating-temp', 'cooling-temp'
        ], 'Occupancy & Comfort Preferences');
        
        this.createSection('envelope-construction', [
            'wall-type', 'wall-insulation', 'exterior-finish', 'wall-color'
        ], 'Wall Construction Details');
        
        this.createSection('roof-attic-details', [
            'roof-type', 'roof-material', 'roof-color', 'attic-insulation', 'attic-type'
        ], 'Roof & Attic Information');
        
        this.createSection('foundation-details', [
            'foundation-type', 'foundation-insulation', 'basement-depth'
        ], 'Foundation Details');
        
        this.createSection('window-details', [
            'window-type', 'window-frame', 'window-area-north', 'window-area-east', 
            'window-area-south', 'window-area-west', 'shading'
        ], 'Windows & Glazing');
        
        this.createSection('hvac-systems', [
            'heating-system', 'heating-age', 'cooling-system', 'cooling-age', 
            'ductwork', 'duct-location'
        ], 'Existing HVAC Systems');
        
        this.createSection('other-systems', [
            'water-heater', 'wh-age', 'pool-pump', 'electric-vehicle', 
            'hot-tub', 'electric-range', 'electric-dryer'
        ], 'Water Heating & Other Systems');
    }
    
    createSection(sectionId, fieldIds, title) {
        const fields = fieldIds.map(id => document.getElementById(id)).filter(Boolean);
        if (fields.length === 0) return;
        
        const firstField = fields[0];
        const parentSection = firstField.closest('.form-section');
        if (!parentSection) return;
        
        // Create collapsible header if it doesn't exist
        let header = parentSection.querySelector('.section-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'section-header';
            header.innerHTML = `
                <button type="button" class="section-toggle" aria-expanded="true">
                    <span class="section-title">${title}</span>
                    <span class="section-icon">▼</span>
                </button>
                <div class="section-progress">
                    <span class="progress-text">0 of ${fieldIds.length} completed</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            `;
            
            // Style the header
            header.style.cssText = `
                margin-bottom: 1rem;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 1rem;
            `;
            
            const toggle = header.querySelector('.section-toggle');
            toggle.style.cssText = `
                width: 100%;
                background: none;
                border: none;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 1.125rem;
                font-weight: 600;
                color: #2d3748;
                cursor: pointer;
                padding: 0;
            `;
            
            const progressBar = header.querySelector('.progress-bar');
            progressBar.style.cssText = `
                width: 100%;
                height: 4px;
                background: #e2e8f0;
                border-radius: 2px;
                overflow: hidden;
                margin-top: 0.5rem;
            `;
            
            const progressFill = header.querySelector('.progress-fill');
            progressFill.style.cssText = `
                height: 100%;
                background: linear-gradient(90deg, #48bb78, #38a169);
                transition: width 0.3s ease;
            `;
            
            // Add toggle functionality
            toggle.addEventListener('click', () => {
                const content = parentSection.querySelector('.section-content');
                const icon = header.querySelector('.section-icon');
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                
                if (content) {
                    if (isExpanded) {
                        content.style.display = 'none';
                        toggle.setAttribute('aria-expanded', 'false');
                        icon.textContent = '▶';
                    } else {
                        content.style.display = 'block';
                        toggle.setAttribute('aria-expanded', 'true');
                        icon.textContent = '▼';
                    }
                }
            });
            
            parentSection.insertBefore(header, parentSection.firstChild);
        }
        
        // Wrap existing content in section-content
        let content = parentSection.querySelector('.section-content');
        if (!content) {
            content = document.createElement('div');
            content.className = 'section-content';
            
            // Move all existing children to content
            const children = Array.from(parentSection.children).filter(child => 
                !child.classList.contains('section-header')
            );
            children.forEach(child => content.appendChild(child));
            
            parentSection.appendChild(content);
        }
        
        // Update progress tracking
        this.updateSectionProgress(parentSection, fieldIds);
        
        // Listen for field changes to update progress
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    setTimeout(() => this.updateSectionProgress(parentSection, fieldIds), 100);
                });
                field.addEventListener('change', () => {
                    setTimeout(() => this.updateSectionProgress(parentSection, fieldIds), 100);
                });
            }
        });
    }
    
    updateSectionProgress(section, fieldIds) {
        const progressText = section.querySelector('.progress-text');
        const progressFill = section.querySelector('.progress-fill');
        
        if (!progressText || !progressFill) return;
        
        let completedFields = 0;
        let visibleFields = 0;
        
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const fieldGroup = field?.closest('.input-group');
            
            if (field && fieldGroup && fieldGroup.style.display !== 'none' && !fieldGroup.classList.contains('field-hidden')) {
                visibleFields++;
                
                if (field.type === 'checkbox') {
                    // For checkboxes, consider any interaction as completion
                    if (field.checked || field.dataset.interacted) {
                        completedFields++;
                    }
                } else {
                    // For other inputs, check if they have a value
                    if (field.value && field.value.trim() !== '') {
                        completedFields++;
                    }
                }
            }
        });
        
        const percentage = visibleFields > 0 ? (completedFields / visibleFields) * 100 : 0;
        
        progressText.textContent = `${completedFields} of ${visibleFields} completed`;
        progressFill.style.width = `${percentage}%`;
        
        // Add completed class if all fields are done
        if (percentage === 100 && visibleFields > 0) {
            section.classList.add('section-completed');
            progressFill.style.background = '#48bb78';
        } else {
            section.classList.remove('section-completed');
            progressFill.style.background = 'linear-gradient(90deg, #48bb78, #38a169)';
        }
    }
    
    updateProgressiveSections() {
        // Update all section progress
        document.querySelectorAll('.form-section').forEach(section => {
            const header = section.querySelector('.section-header');
            if (header) {
                // Find field IDs in this section
                const fieldIds = Array.from(section.querySelectorAll('input, select'))
                    .map(field => field.id)
                    .filter(Boolean);
                
                if (fieldIds.length > 0) {
                    this.updateSectionProgress(section, fieldIds);
                }
            }
        });
    }
    
    // Public method to get completion status
    getOverallProgress() {
        let totalFields = 0;
        let completedFields = 0;
        
        document.querySelectorAll('input[required], select[required]').forEach(field => {
            const fieldGroup = field.closest('.input-group');
            if (fieldGroup && fieldGroup.style.display !== 'none' && !fieldGroup.classList.contains('field-hidden')) {
                totalFields++;
                if (field.value && field.value.trim() !== '') {
                    completedFields++;
                }
            }
        });
        
        return {
            completed: completedFields,
            total: totalFields,
            percentage: totalFields > 0 ? (completedFields / totalFields) * 100 : 0
        };
    }
}

// Initialize progressive forms
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.assessment-form')) {
        window.progressiveForms = new ProgressiveForms();
        
        // Add completion indicator to progress bar
        const progressSection = document.querySelector('.progress-section');
        if (progressSection) {
            const completionIndicator = document.createElement('div');
            completionIndicator.className = 'completion-indicator';
            completionIndicator.style.cssText = `
                text-align: center;
                margin-top: 0.5rem;
                font-size: 0.875rem;
                color: #666;
            `;
            progressSection.appendChild(completionIndicator);
            
            // Update completion indicator
            const updateCompletion = () => {
                const progress = window.progressiveForms.getOverallProgress();
                completionIndicator.textContent = `${progress.completed}/${progress.total} fields completed (${Math.round(progress.percentage)}%)`;
            };
            
            // Initial update
            setTimeout(updateCompletion, 500);
            
            // Update on form changes
            document.addEventListener('input', updateCompletion);
            document.addEventListener('change', updateCompletion);
        }
    }
});

// Mark checkboxes as interacted when clicked
document.addEventListener('click', function(e) {
    if (e.target.type === 'checkbox') {
        e.target.dataset.interacted = 'true';
    }
});

// Export for external use
if (typeof window !== 'undefined') {
    window.ProgressiveForms = ProgressiveForms;
}