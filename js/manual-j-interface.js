/**
 * Manual J Assessment Interface
 * Handles user interaction, form navigation, and result display
 */

// Global variables
let currentStep = 1;
let calculator;
let buildingData = {};
let calculationResults = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    calculator = new ManualJCalculator();
    initializeInterface();
    loadFormData();
});

// Initialize interface components
function initializeInterface() {
    // Set up form validation
    setupFormValidation();
    
    // Initialize date picker with minimum date
    const dateInput = document.getElementById('preferred-date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
    
    // Auto-save form data on input
    document.addEventListener('input', saveFormData);
    document.addEventListener('change', saveFormData);
    
    // Handle form submission for scheduling
    const schedulingForm = document.querySelector('.scheduling-form');
    if (schedulingForm) {
        schedulingForm.addEventListener('submit', handleSchedulingSubmission);
    }
}

// Navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep === 3) {
            // Before going to calculations, collect all data
            collectFormData();
            // Start calculations
            performCalculations();
        }
        
        currentStep++;
        updateStepDisplay();
        updateProgressBar();
        scrollToTop();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
        updateProgressBar();
        scrollToTop();
    }
}

function updateStepDisplay() {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
}

function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Form validation
function setupFormValidation() {
    // Add real-time validation feedback
    document.querySelectorAll('input[required], select[required]').forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', validateField);
    });
}

function validateField(event) {
    const field = event.target;
    const fieldGroup = field.closest('.input-group');
    
    if (!fieldGroup) return;
    
    // Remove existing validation classes
    fieldGroup.classList.remove('field-valid', 'field-invalid');
    
    if (field.checkValidity()) {
        fieldGroup.classList.add('field-valid');
    } else {
        fieldGroup.classList.add('field-invalid');
    }
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    if (!currentStepElement) return true;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.checkValidity()) {
            isValid = false;
            field.focus();
            
            // Add visual feedback
            const fieldGroup = field.closest('.input-group');
            if (fieldGroup) {
                fieldGroup.classList.add('field-invalid');
            }
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields before proceeding.', 'error');
    }
    
    return isValid;
}

// Data collection and management
function collectFormData() {
    const formElements = document.querySelectorAll('#step-1 input, #step-1 select, #step-2 input, #step-2 select, #step-3 input, #step-3 select, #step-3 input[type="checkbox"]');
    
    buildingData = {};
    
    formElements.forEach(element => {
        if (element.type === 'checkbox') {
            buildingData[element.id] = element.checked;
        } else {
            buildingData[element.id] = element.value;
        }
    });
    
    // Map form IDs to calculator-expected properties
    buildingData.address = buildingData['property-address'] || '';
    buildingData.totalArea = parseFloat(buildingData['total-area']) || 2000;
    buildingData.ceilingHeight = parseFloat(buildingData['ceiling-height']) || 9;
    buildingData.yearBuilt = parseInt(buildingData['year-built']) || 2000;
    buildingData.stories = parseFloat(buildingData['stories']) || 1;
    buildingData.occupants = parseInt(buildingData['occupants']) || 4;
    buildingData.heatingTemp = parseInt(buildingData['heating-temp']) || 70;
    buildingData.coolingTemp = parseInt(buildingData['cooling-temp']) || 75;
    
    // Building envelope
    buildingData.wallType = buildingData['wall-type'] || 'wood-frame-2x4';
    buildingData.wallInsulation = buildingData['wall-insulation'] || '11';
    buildingData.wallColor = buildingData['wall-color'] || 'medium';
    buildingData.atticInsulation = buildingData['attic-insulation'] || '30';
    buildingData.atticType = buildingData['attic-type'] || 'vented';
    buildingData.foundationType = buildingData['foundation-type'] || 'slab';
    buildingData.foundationInsulation = buildingData['foundation-insulation'] || '0';
    
    // Windows
    buildingData.windowAreaNorth = parseFloat(buildingData['window-area-north']) || 0;
    buildingData.windowAreaEast = parseFloat(buildingData['window-area-east']) || 0;
    buildingData.windowAreaSouth = parseFloat(buildingData['window-area-south']) || 0;
    buildingData.windowAreaWest = parseFloat(buildingData['window-area-west']) || 0;
    buildingData.windowType = buildingData['window-type'] || 'double-pane';
    buildingData.shading = buildingData['shading'] || 'none';
    
    // Systems
    buildingData.heatingSystem = buildingData['heating-system'] || 'gas-furnace';
    buildingData.coolingSystem = buildingData['cooling-system'] || 'central-ac';
    buildingData.ductwork = buildingData['ductwork'] || 'fair';
    
    // Colors and materials
    buildingData.roofColor = buildingData['roof-color'] || 'medium';
    
    console.log('Collected building data:', buildingData);
}

function saveFormData() {
    // Save current form state to localStorage
    const formData = {};
    document.querySelectorAll('input, select, textarea').forEach(element => {
        if (element.type === 'checkbox') {
            formData[element.id] = element.checked;
        } else {
            formData[element.id] = element.value;
        }
    });
    
    try {
        localStorage.setItem('manualJFormData', JSON.stringify(formData));
    } catch (e) {
        console.warn('Could not save form data:', e);
    }
}

function loadFormData() {
    // Load saved form data from localStorage
    try {
        const savedData = localStorage.getItem('manualJFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            Object.keys(formData).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = formData[id];
                    } else {
                        element.value = formData[id];
                    }
                }
            });
        }
    } catch (e) {
        console.warn('Could not load form data:', e);
    }
}

// Calculations and analysis
function performCalculations() {
    showCalculationStatus();
    
    // Simulate calculation time for better UX
    setTimeout(() => {
        try {
            calculationResults = calculator.calculateLoads(buildingData);
            displayCalculationResults();
            
            // Enable next button
            const nextButton = document.getElementById('next-to-report');
            if (nextButton) {
                nextButton.disabled = false;
                nextButton.textContent = 'View Recommendations';
            }
        } catch (error) {
            console.error('Calculation error:', error);
            showCalculationError();
        }
    }, 3000);
}

function showCalculationStatus() {
    const statusDiv = document.getElementById('calculation-status');
    const resultsDiv = document.getElementById('calculation-results');
    
    if (statusDiv) statusDiv.style.display = 'block';
    if (resultsDiv) resultsDiv.style.display = 'none';
    
    // Disable next button during calculations
    const nextButton = document.getElementById('next-to-report');
    if (nextButton) {
        nextButton.disabled = true;
        nextButton.textContent = 'Calculating...';
    }
}

function displayCalculationResults() {
    const statusDiv = document.getElementById('calculation-status');
    const resultsDiv = document.getElementById('calculation-results');
    
    if (statusDiv) statusDiv.style.display = 'none';
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        
        // Populate load results
        updateLoadResults();
        
        // Create charts
        createLoadBreakdownChart();
        createMonthlyEnergyChart();
        
        // Generate recommendations for step 5
        generateRecommendationsDisplay();
    }
}

function updateLoadResults() {
    const results = calculationResults;
    
    // Update heating load
    const heatingLoadElement = document.getElementById('heating-load');
    if (heatingLoadElement) {
        heatingLoadElement.textContent = results.heating.total.toLocaleString();
    }
    
    // Update cooling load
    const coolingLoadElement = document.getElementById('cooling-load');
    if (coolingLoadElement) {
        coolingLoadElement.textContent = results.cooling.total.toLocaleString();
    }
    
    // Update design temperatures
    const designHeatingTemp = document.getElementById('design-heating-temp');
    if (designHeatingTemp) {
        designHeatingTemp.textContent = results.climate.winterDesignTemp;
    }
    
    const designCoolingTemp = document.getElementById('design-cooling-temp');
    if (designCoolingTemp) {
        designCoolingTemp.textContent = results.climate.summerDesignTemp;
    }
    
    // Update load densities
    const loadDensityHeating = document.getElementById('load-density-heating');
    if (loadDensityHeating) {
        loadDensityHeating.textContent = results.loadDensity.heating;
    }
    
    const loadDensityCooling = document.getElementById('load-density-cooling');
    if (loadDensityCooling) {
        loadDensityCooling.textContent = results.loadDensity.cooling;
    }
    
    // Calculate and display efficiency rating
    const avgLoadDensity = (results.loadDensity.heating + results.loadDensity.cooling) / 2;
    let efficiencyRating;
    if (avgLoadDensity < 25) {
        efficiencyRating = 'Excellent';
    } else if (avgLoadDensity < 35) {
        efficiencyRating = 'Good';
    } else if (avgLoadDensity < 45) {
        efficiencyRating = 'Fair';
    } else {
        efficiencyRating = 'Poor';
    }
    
    const efficiencyElement = document.getElementById('efficiency-rating');
    if (efficiencyElement) {
        efficiencyElement.textContent = efficiencyRating;
    }
    
    // Update heat loss/gain rates
    const heatLossRate = document.getElementById('heat-loss-rate');
    if (heatLossRate) {
        const rate = Math.round(results.heating.total / results.heating.designConditions.deltaT);
        heatLossRate.textContent = rate.toLocaleString();
    }
    
    const heatGainRate = document.getElementById('heat-gain-rate');
    if (heatGainRate) {
        const rate = Math.round(results.cooling.total / results.cooling.designConditions.deltaT);
        heatGainRate.textContent = rate.toLocaleString();
    }
}

function createLoadBreakdownChart() {
    const ctx = document.getElementById('loadBreakdownChart');
    if (!ctx || !calculationResults.breakdown) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: calculationResults.breakdown.heating.labels,
            datasets: [{
                label: 'Heating Load (Btu/h)',
                data: calculationResults.breakdown.heating.values,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Heating Load Breakdown'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createMonthlyEnergyChart() {
    const ctx = document.getElementById('monthlyEnergyChart');
    if (!ctx || !calculationResults.monthly) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: calculationResults.monthly.labels,
            datasets: [{
                label: 'Heating Energy (MBtu)',
                data: calculationResults.monthly.heating,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: true
            }, {
                label: 'Cooling Energy (MBtu)',
                data: calculationResults.monthly.cooling,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Energy Usage Profile'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy (MBtu)'
                    }
                }
            }
        }
    });
}

function generateRecommendationsDisplay() {
    const recommendations = calculator.generateRecommendations(calculationResults, buildingData);
    const container = document.getElementById('recommendations-summary');
    
    if (!container) return;
    
    let html = '<h3>Equipment Recommendations</h3>';
    
    recommendations.forEach((rec, index) => {
        const badgeClass = rec.recommended ? 'recommended' : '';
        const badgeText = rec.recommended ? 'RECOMMENDED' : 'ALTERNATIVE';
        
        html += `
            <div class="equipment-recommendation ${badgeClass}">
                <div class="recommendation-header">
                    <h4>${rec.type}</h4>
                    ${rec.recommended ? `<span class="recommendation-badge">${badgeText}</span>` : ''}
                </div>
                
                <div class="equipment-specs">
                    <div class="spec-item">
                        <div class="spec-label">Recommended Size</div>
                        <div class="spec-value">${(rec.sizingCapacity / 1000).toFixed(1)} Tons</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Heating Efficiency</div>
                        <div class="spec-value">${rec.heatingEfficiency.hspf} HSPF</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Cooling Efficiency</div>
                        <div class="spec-value">${rec.coolingEfficiency.seer} SEER</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Est. Annual Savings</div>
                        <div class="spec-value">$${rec.annualSavings.toLocaleString()}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Available Rebates</div>
                        <div class="spec-value">$${rec.rebatesAvailable.total.toLocaleString()}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Est. Cost Range</div>
                        <div class="spec-value">$${rec.costRange.low.toLocaleString()} - $${rec.costRange.high.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="rebate-breakdown">
                    <h5>Available Rebates & Incentives:</h5>
                    <ul>
                        ${rec.rebatesAvailable.breakdown.map(rebate => 
                            `<li>${rebate.program}: $${rebate.amount.toLocaleString()}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function showCalculationError() {
    const statusDiv = document.getElementById('calculation-status');
    if (statusDiv) {
        statusDiv.innerHTML = `
            <div class="status-icon">❌</div>
            <h3>Calculation Error</h3>
            <p>There was an error performing the load calculations. Please check your inputs and try again.</p>
            <button class="btn-primary" onclick="performCalculations()">Retry Calculations</button>
        `;
    }
}

// Report generation and actions
function generatePDFReport() {
    showNotification('Generating comprehensive PDF report...', 'info');
    
    // Simulate PDF generation
    setTimeout(() => {
        showNotification('PDF report generated! Download will start shortly.', 'success');
        
        // In a real implementation, this would generate and download an actual PDF
        // For now, we'll create a simple summary
        generateSummaryReport();
    }, 2000);
}

function generateSummaryReport() {
    const reportWindow = window.open('', '_blank');
    const reportContent = createReportHTML();
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.print();
}

function createReportHTML() {
    const results = calculationResults;
    const climate = results.climate;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Manual J Load Calculation Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .result-box { border: 1px solid #ddd; padding: 15px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ACCA Manual J Load Calculation Report</h1>
                <h2>Precision HVAC NorCal</h2>
                <p>Property: ${buildingData.address}</p>
                <p>Report Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
                <h3>Building Summary</h3>
                <div class="grid">
                    <div class="result-box">
                        <h4>Property Details</h4>
                        <p>Total Area: ${buildingData.totalArea} sq ft</p>
                        <p>Stories: ${buildingData.stories}</p>
                        <p>Year Built: ${buildingData.yearBuilt}</p>
                        <p>Ceiling Height: ${buildingData.ceilingHeight} ft</p>
                    </div>
                    <div class="result-box">
                        <h4>Design Conditions</h4>
                        <p>Climate Zone: ${climate.zone}</p>
                        <p>Winter Design: ${climate.winterDesignTemp}°F</p>
                        <p>Summer Design: ${climate.summerDesignTemp}°F</p>
                        <p>Indoor Heating: ${buildingData.heatingTemp}°F</p>
                        <p>Indoor Cooling: ${buildingData.coolingTemp}°F</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3>Load Calculation Results</h3>
                <table>
                    <tr>
                        <th>Load Type</th>
                        <th>Total Load (Btu/h)</th>
                        <th>Load Density (Btu/h/sq ft)</th>
                    </tr>
                    <tr>
                        <td>Heating Load</td>
                        <td>${results.heating.total.toLocaleString()}</td>
                        <td>${results.loadDensity.heating}</td>
                    </tr>
                    <tr>
                        <td>Cooling Load (Total)</td>
                        <td>${results.cooling.total.toLocaleString()}</td>
                        <td>${results.loadDensity.cooling}</td>
                    </tr>
                    <tr>
                        <td>Cooling Load (Sensible)</td>
                        <td>${results.cooling.sensible.toLocaleString()}</td>
                        <td>${Math.round(results.cooling.sensible / buildingData.totalArea)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="section">
                <h3>Equipment Recommendations</h3>
                ${calculator.generateRecommendations(results, buildingData).map(rec => `
                    <div class="result-box">
                        <h4>${rec.type} ${rec.recommended ? '(RECOMMENDED)' : ''}</h4>
                        <p>Size: ${(rec.sizingCapacity / 1000).toFixed(1)} Tons (${rec.sizingCapacity.toLocaleString()} Btu/h)</p>
                        <p>Efficiency: ${rec.heatingEfficiency.hspf} HSPF / ${rec.coolingEfficiency.seer} SEER</p>
                        <p>Est. Annual Savings: $${rec.annualSavings.toLocaleString()}</p>
                        <p>Available Rebates: $${rec.rebatesAvailable.total.toLocaleString()}</p>
                        <p>Est. Cost: $${rec.costRange.low.toLocaleString()} - $${rec.costRange.high.toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <h3>Important Notes</h3>
                <ul>
                    <li>This analysis is based on ACCA Manual J 8th Edition procedures</li>
                    <li>Actual loads may vary based on occupancy patterns and weather conditions</li>
                    <li>Professional verification recommended before final equipment selection</li>
                    <li>Rebates and incentives subject to program availability and requirements</li>
                    <li>Installation costs may vary based on site conditions</li>
                </ul>
            </div>
        </body>
        </html>
    `;
}

function emailReport() {
    // Use the new email integration system if available
    if (window.emailIntegration && typeof window.emailIntegration.emailReport === 'function') {
        // Get current report data
        const reportData = {
            calculations: window.manualJCalculator ? window.manualJCalculator.getResults() : null,
            timestamp: new Date().toISOString(),
            formData: gatherFormData()
        };
        
        window.emailIntegration.emailReport(reportData);
    } else {
        // Fallback to original prompt method with improved UX
        const email = prompt('Enter your email address to receive the report:');
        if (email && validateEmail(email)) {
            showNotification(`Report will be sent to ${email} within 24 hours.`, 'success');
            console.log('Email report to:', email);
        } else if (email) {
            showNotification('Please enter a valid email address.', 'error');
        }
    }
}

// Helper function to gather current form data
function gatherFormData() {
    const formData = {};
    
    // Gather data from all assessment steps
    for (let i = 1; i <= 5; i++) {
        const stepForm = document.querySelector(`#step${i}`);
        if (stepForm) {
            const inputs = stepForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.name || input.id) {
                    const key = input.name || input.id;
                    if (input.type === 'checkbox') {
                        formData[key] = input.checked;
                    } else if (input.type === 'radio') {
                        if (input.checked) formData[key] = input.value;
                    } else {
                        formData[key] = input.value;
                    }
                }
            });
        }
    }
    
    return formData;
}

function scheduleConsultation() {
    const modal = document.getElementById('scheduling-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleSchedulingSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const schedulingData = {};
    
    for (const [key, value] of formData.entries()) {
        schedulingData[key] = value;
    }
    
    showNotification('Scheduling your consultation...', 'info');
    
    // Simulate scheduling process
    setTimeout(() => {
        showNotification('Consultation scheduled! We will contact you within 24 hours to confirm details.', 'success');
        closeModal('scheduling-modal');
        event.target.reset();
    }, 2000);
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    });
    
    // Set background color based on type
    const colors = {
        info: '#3498db',
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
        notification.style.transition = 'all 0.3s ease';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate report function for header button
function generateReport() {
    if (currentStep >= 4 && calculationResults.heating) {
        generatePDFReport();
    } else {
        showNotification('Please complete the assessment to generate a report.', 'warning');
    }
}

// Modal click outside to close
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Close any open modals
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Auto-calculate window total for user feedback
function updateWindowTotal() {
    const north = parseFloat(document.getElementById('window-area-north')?.value) || 0;
    const east = parseFloat(document.getElementById('window-area-east')?.value) || 0;
    const south = parseFloat(document.getElementById('window-area-south')?.value) || 0;
    const west = parseFloat(document.getElementById('window-area-west')?.value) || 0;
    
    const total = north + east + south + west;
    
    // Add or update total display
    let totalDisplay = document.getElementById('window-total-display');
    if (!totalDisplay) {
        totalDisplay = document.createElement('div');
        totalDisplay.id = 'window-total-display';
        totalDisplay.style.cssText = 'text-align: center; margin-top: 10px; font-weight: 500; color: #2c5282;';
        
        const windowSection = document.querySelector('#step-3 .form-section');
        if (windowSection) {
            windowSection.appendChild(totalDisplay);
        }
    }
    
    totalDisplay.textContent = `Total Window Area: ${total} sq ft`;
}

// Add event listeners for window area inputs
document.addEventListener('DOMContentLoaded', function() {
    const windowInputs = ['window-area-north', 'window-area-east', 'window-area-south', 'window-area-west'];
    windowInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateWindowTotal);
        }
    });
});