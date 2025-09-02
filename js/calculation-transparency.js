/**
 * Calculation Transparency Module
 * Provides detailed methodology explanations and show-work functionality
 * for ACCA Manual J load calculations
 * 
 * Issue #10 Fix: Add calculation transparency with methodology explanations
 */

class CalculationTransparency {
    constructor() {
        this.methodologyData = {
            heatingLoad: {
                title: "Heating Load Calculation",
                description: "ACCA Manual J 8th Edition methodology for determining heating requirements",
                factors: [
                    "Building envelope heat loss (walls, windows, doors, roof)",
                    "Infiltration and ventilation heat loss", 
                    "Internal heat gains from occupants and equipment",
                    "Solar heat gains through windows",
                    "Ground coupling effects for floors"
                ],
                formula: "Total Heating Load = Envelope Loss + Infiltration Loss - Internal Gains - Solar Gains"
            },
            coolingLoad: {
                title: "Cooling Load Calculation", 
                description: "Peak cooling load determination using CLTD/CLF method",
                factors: [
                    "Sensible heat gain through building envelope",
                    "Latent heat gain from moisture sources",
                    "Internal sensible and latent gains",
                    "Solar heat gain through fenestration",
                    "Ventilation and infiltration loads"
                ],
                formula: "Total Cooling Load = Sensible Load + Latent Load"
            },
            equipmentSizing: {
                title: "Equipment Sizing",
                description: "Proper HVAC equipment selection based on calculated loads",
                factors: [
                    "Heating capacity must meet or exceed heating load",
                    "Cooling capacity sized for sensible heat ratio",
                    "Efficiency ratings (SEER, HSPF, AFUE)",
                    "Climate zone considerations",
                    "Backup heating requirements"
                ],
                formula: "Equipment Capacity = Max(Heating Load × Safety Factor, Cooling Load × Safety Factor)"
            }
        };
        
        this.calculationSteps = [];
        this.showWorkEnabled = false;
    }

    /**
     * Initialize calculation transparency features
     */
    init() {
        this.createShowWorkToggle();
        this.createMethodologyModal();
        this.attachEventListeners();
    }

    /**
     * Create toggle for showing calculation work
     */
    createShowWorkToggle() {
        const toggleHtml = `
            <div class="calculation-controls">
                <label class="show-work-toggle">
                    <input type="checkbox" id="showWorkToggle" />
                    <span class="toggle-slider"></span>
                    Show Calculation Work
                </label>
                <button type="button" class="methodology-btn" id="methodologyBtn">
                    <i class="fas fa-info-circle"></i>
                    View Methodology
                </button>
            </div>
        `;

        // Add to assessment forms
        const assessmentSections = document.querySelectorAll('.form-section');
        assessmentSections.forEach(section => {
            if (!section.querySelector('.calculation-controls')) {
                section.insertAdjacentHTML('afterbegin', toggleHtml);
            }
        });

        // Add CSS for controls
        this.addCalculationControlsCSS();
    }

    /**
     * Create methodology explanation modal
     */
    createMethodologyModal() {
        const modalHtml = `
            <div id="methodologyModal" class="methodology-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>ACCA Manual J Calculation Methodology</h2>
                        <span class="close-modal" id="closeMethodologyModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="methodology-tabs">
                            <button class="tab-btn active" data-tab="heating">Heating Load</button>
                            <button class="tab-btn" data-tab="cooling">Cooling Load</button>  
                            <button class="tab-btn" data-tab="equipment">Equipment Sizing</button>
                        </div>
                        <div class="methodology-content">
                            ${this.generateMethodologyContent()}
                        </div>
                        <div class="methodology-footer">
                            <p><strong>Standards Compliance:</strong> All calculations follow ACCA Manual J 8th Edition guidelines and local climate data for accurate results.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.addModalCSS();
    }

    /**
     * Generate methodology content for different calculation types
     */
    generateMethodologyContent() {
        let content = '';
        
        Object.keys(this.methodologyData).forEach(key => {
            const method = this.methodologyData[key];
            const isActive = key === 'heatingLoad' ? 'active' : '';
            
            content += `
                <div class="methodology-tab-content ${isActive}" data-tab="${key}">
                    <h3>${method.title}</h3>
                    <p class="methodology-description">${method.description}</p>
                    
                    <div class="calculation-formula">
                        <h4>Key Formula:</h4>
                        <code>${method.formula}</code>
                    </div>
                    
                    <div class="calculation-factors">
                        <h4>Calculation Factors:</h4>
                        <ul>
                            ${method.factors.map(factor => `<li>${factor}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="climate-considerations">
                        <h4>Bay Area Climate Considerations:</h4>
                        <p>Calculations use ASHRAE climate zone 3C data with local weather patterns, 
                        moderate heating loads, and emphasis on cooling efficiency for summer comfort.</p>
                    </div>
                </div>
            `;
        });
        
        return content;
    }

    /**
     * Attach event listeners for transparency features
     */
    attachEventListeners() {
        // Show work toggle
        document.addEventListener('change', (e) => {
            if (e.target.id === 'showWorkToggle') {
                this.showWorkEnabled = e.target.checked;
                this.toggleCalculationWork(this.showWorkEnabled);
            }
        });

        // Methodology button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'methodologyBtn' || e.target.closest('#methodologyBtn')) {
                this.showMethodologyModal();
            }
        });

        // Modal controls
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeMethodologyModal') {
                this.hideMethodologyModal();
            }
            if (e.target.id === 'methodologyModal') {
                this.hideMethodologyModal();
            }
        });

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchMethodologyTab(e.target.dataset.tab);
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideMethodologyModal();
            }
        });
    }

    /**
     * Record calculation step for transparency
     */
    recordCalculationStep(step, value, description, formula = '') {
        this.calculationSteps.push({
            step,
            value,
            description,
            formula,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Show calculation work details
     */
    showCalculationWork(containerId) {
        if (!this.showWorkEnabled || this.calculationSteps.length === 0) {
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        let workHtml = `
            <div class="calculation-work-display">
                <h4><i class="fas fa-calculator"></i> Calculation Steps:</h4>
                <div class="calculation-steps">
        `;

        this.calculationSteps.forEach((step, index) => {
            workHtml += `
                <div class="calculation-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-details">
                        <div class="step-title">${step.step}</div>
                        <div class="step-description">${step.description}</div>
                        ${step.formula ? `<div class="step-formula"><code>${step.formula}</code></div>` : ''}
                        <div class="step-result">Result: <strong>${step.value}</strong></div>
                    </div>
                </div>
            `;
        });

        workHtml += `
                </div>
                <div class="calculation-disclaimer">
                    <p><small><i class="fas fa-info-circle"></i> Calculations follow ACCA Manual J 8th Edition standards. 
                    Results are estimates for planning purposes. Final sizing should be verified by certified HVAC professionals.</small></p>
                </div>
            </div>
        `;

        // Remove existing work display
        const existingWork = container.querySelector('.calculation-work-display');
        if (existingWork) {
            existingWork.remove();
        }

        container.insertAdjacentHTML('beforeend', workHtml);
    }

    /**
     * Toggle calculation work display
     */
    toggleCalculationWork(show) {
        const workDisplays = document.querySelectorAll('.calculation-work-display');
        workDisplays.forEach(display => {
            display.style.display = show ? 'block' : 'none';
        });

        if (show && this.calculationSteps.length > 0) {
            // Refresh work displays
            this.showCalculationWork('step5-results');
        }
    }

    /**
     * Clear recorded calculation steps
     */
    clearCalculationSteps() {
        this.calculationSteps = [];
    }

    /**
     * Show methodology modal
     */
    showMethodologyModal() {
        const modal = document.getElementById('methodologyModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus management for accessibility
            const firstTab = modal.querySelector('.tab-btn');
            if (firstTab) firstTab.focus();
        }
    }

    /**
     * Hide methodology modal
     */
    hideMethodologyModal() {
        const modal = document.getElementById('methodologyModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Switch methodology tab
     */
    switchMethodologyTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.methodology-tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.dataset.tab === tabName) {
                content.classList.add('active');
            }
        });
    }

    /**
     * Add CSS for calculation controls
     */
    addCalculationControlsCSS() {
        const css = `
            <style>
            .calculation-controls {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }

            .show-work-toggle {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                font-weight: 500;
            }

            .toggle-slider {
                position: relative;
                width: 50px;
                height: 24px;
                background: #ddd;
                border-radius: 12px;
                transition: background 0.3s;
            }

            .toggle-slider::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s;
            }

            .show-work-toggle input:checked + .toggle-slider {
                background: #28a745;
            }

            .show-work-toggle input:checked + .toggle-slider::after {
                transform: translateX(26px);
            }

            .show-work-toggle input {
                display: none;
            }

            .methodology-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background 0.3s;
            }

            .methodology-btn:hover {
                background: #0056b3;
            }

            .calculation-work-display {
                margin-top: 1.5rem;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                border: 2px solid #dee2e6;
            }

            .calculation-work-display h4 {
                color: #28a745;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .calculation-step {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                padding: 1rem;
                background: white;
                border-radius: 6px;
                border-left: 3px solid #007bff;
            }

            .step-number {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                background: #007bff;
                color: white;
                border-radius: 50%;
                font-weight: bold;
                flex-shrink: 0;
            }

            .step-details {
                flex: 1;
            }

            .step-title {
                font-weight: 600;
                color: #333;
                margin-bottom: 0.25rem;
            }

            .step-description {
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }

            .step-formula {
                margin: 0.5rem 0;
            }

            .step-formula code {
                background: #e9ecef;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
            }

            .step-result {
                font-size: 0.9rem;
                color: #28a745;
            }

            .calculation-disclaimer {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #dee2e6;
            }

            .calculation-disclaimer p {
                margin: 0;
                color: #6c757d;
            }

            @media (max-width: 768px) {
                .calculation-controls {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 0.75rem;
                }

                .show-work-toggle {
                    justify-content: center;
                }

                .calculation-step {
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .step-number {
                    align-self: flex-start;
                }
            }
            </style>
        `;

        if (!document.querySelector('style[data-calculation-controls]')) {
            document.head.insertAdjacentHTML('beforeend', css);
            document.querySelector('head style:last-child').setAttribute('data-calculation-controls', 'true');
        }
    }

    /**
     * Add CSS for methodology modal
     */
    addModalCSS() {
        const css = `
            <style>
            .methodology-modal {
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

            .methodology-modal .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .methodology-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #dee2e6;
                background: #f8f9fa;
                border-radius: 12px 12px 0 0;
            }

            .methodology-modal .modal-header h2 {
                margin: 0;
                color: #333;
                font-size: 1.5rem;
            }

            .close-modal {
                font-size: 2rem;
                cursor: pointer;
                color: #6c757d;
                line-height: 1;
                transition: color 0.3s;
            }

            .close-modal:hover {
                color: #000;
            }

            .methodology-tabs {
                display: flex;
                border-bottom: 1px solid #dee2e6;
                background: #f8f9fa;
            }

            .tab-btn {
                flex: 1;
                padding: 1rem;
                border: none;
                background: transparent;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s;
                color: #6c757d;
            }

            .tab-btn.active {
                background: white;
                color: #007bff;
                border-bottom: 3px solid #007bff;
            }

            .tab-btn:hover:not(.active) {
                background: #e9ecef;
                color: #495057;
            }

            .methodology-content {
                padding: 1.5rem;
            }

            .methodology-tab-content {
                display: none;
            }

            .methodology-tab-content.active {
                display: block;
            }

            .methodology-tab-content h3 {
                color: #007bff;
                margin-bottom: 1rem;
            }

            .methodology-description {
                color: #666;
                margin-bottom: 1.5rem;
                line-height: 1.6;
            }

            .calculation-formula {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
                border-left: 4px solid #28a745;
            }

            .calculation-formula h4 {
                margin: 0 0 0.5rem 0;
                color: #28a745;
            }

            .calculation-formula code {
                background: #e9ecef;
                padding: 0.5rem;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                display: block;
                font-size: 0.9rem;
            }

            .calculation-factors {
                margin-bottom: 1.5rem;
            }

            .calculation-factors h4 {
                color: #333;
                margin-bottom: 0.75rem;
            }

            .calculation-factors ul {
                margin: 0;
                padding-left: 1.5rem;
            }

            .calculation-factors li {
                margin-bottom: 0.5rem;
                line-height: 1.5;
            }

            .climate-considerations {
                background: #e7f3ff;
                padding: 1rem;
                border-radius: 8px;
                border-left: 4px solid #007bff;
            }

            .climate-considerations h4 {
                color: #007bff;
                margin: 0 0 0.5rem 0;
            }

            .climate-considerations p {
                margin: 0;
                color: #495057;
                line-height: 1.6;
            }

            .methodology-footer {
                padding: 1.5rem;
                border-top: 1px solid #dee2e6;
                background: #f8f9fa;
                border-radius: 0 0 12px 12px;
            }

            .methodology-footer p {
                margin: 0;
                color: #6c757d;
                font-size: 0.9rem;
                line-height: 1.5;
            }

            @media (max-width: 768px) {
                .methodology-modal {
                    padding: 0.5rem;
                }

                .methodology-modal .modal-content {
                    max-height: 95vh;
                }

                .methodology-tabs {
                    flex-direction: column;
                }

                .tab-btn {
                    border-bottom: 1px solid #dee2e6;
                }

                .tab-btn.active {
                    border-bottom: 1px solid #007bff;
                    border-left: 4px solid #007bff;
                }
            }
            </style>
        `;

        if (!document.querySelector('style[data-methodology-modal]')) {
            document.head.insertAdjacentHTML('beforeend', css);
            document.querySelector('head style:last-child').setAttribute('data-methodology-modal', 'true');
        }
    }

    /**
     * Integration with Manual J Calculator
     */
    integrateWithCalculator(calculator) {
        if (!calculator) return;

        // Override calculation methods to record steps
        const originalCalculateHeatingLoad = calculator.calculateHeatingLoad;
        calculator.calculateHeatingLoad = (data) => {
            this.clearCalculationSteps();
            
            const result = originalCalculateHeatingLoad.call(calculator, data);
            
            // Record calculation steps
            this.recordCalculationStep(
                "Building Envelope Analysis",
                `${data.sqft} sq ft @ ${data.insulationLevel} insulation`,
                "Calculate heat loss through walls, windows, and roof based on building envelope characteristics",
                "Q = U × A × ΔT"
            );

            this.recordCalculationStep(
                "Infiltration Load",
                `Air changes: ${data.airChangesPerHour || 0.35}/hr`,
                "Account for heat loss from air leakage and ventilation requirements",
                "Q_inf = 0.018 × ACH × Volume × ΔT"
            );

            this.recordCalculationStep(
                "Internal Heat Gains",
                "Occupants + Equipment + Lighting",
                "Subtract heat generated internally from people, appliances, and lighting",
                "Internal Gains = (Occupants × 230 BTU/hr) + Equipment Loads"
            );

            this.recordCalculationStep(
                "Final Heating Load",
                `${result.heatingLoad} BTU/hr`,
                "Total heating load after applying all factors and safety margins",
                "Total Load = Envelope Loss + Infiltration - Internal Gains"
            );

            return result;
        };

        // Similar override for cooling calculations
        const originalCalculateCoolingLoad = calculator.calculateCoolingLoad;
        calculator.calculateCoolingLoad = (data) => {
            const result = originalCalculateCoolingLoad.call(calculator, data);
            
            this.recordCalculationStep(
                "Sensible Heat Gain",
                `Building envelope + Solar gains`,
                "Calculate heat gain through conduction and solar radiation",
                "Q_sensible = Q_conduction + Q_solar + Q_internal"
            );

            this.recordCalculationStep(
                "Latent Heat Gain", 
                "Moisture loads from occupants and infiltration",
                "Account for humidity and moisture removal requirements",
                "Q_latent = Occupant_latent + Infiltration_latent"
            );

            this.recordCalculationStep(
                "Total Cooling Load",
                `${result.coolingLoad} BTU/hr`,
                "Combined sensible and latent cooling requirements",
                "Total Cooling = Sensible Load + Latent Load"
            );

            return result;
        };
    }
}

// Global instance
window.CalculationTransparency = CalculationTransparency;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.form-section')) {
        const transparency = new CalculationTransparency();
        transparency.init();
        
        // Integrate with calculator if available
        if (window.ManualJCalculator) {
            transparency.integrateWithCalculator(window.manualJCalculator);
        }
        
        window.calculationTransparency = transparency;
    }
});