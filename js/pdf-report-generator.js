/**
 * Professional PDF Report Generator
 * Uses jsPDF to create comprehensive Manual J assessment reports
 */

class PDFReportGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = this.margin;
        this.colors = {
            primary: [44, 82, 130], // #2c5282
            secondary: [72, 187, 120], // #48bb78
            text: [45, 55, 72], // #2d3748
            light: [160, 174, 192], // #a0aec0
            success: [72, 187, 120], // #48bb78
            warning: [251, 191, 36], // #fbbf24
            danger: [229, 62, 62] // #e53e3e
        };
        
        this.loadJsPDF();
    }
    
    async loadJsPDF() {
        if (typeof window.jsPDF === 'undefined') {
            // Load jsPDF from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            document.head.appendChild(script);
            
            return new Promise((resolve) => {
                script.onload = () => {
                    this.jsPDF = window.jspdf.jsPDF;
                    resolve();
                };
            });
        } else {
            this.jsPDF = window.jspdf.jsPDF;
        }
    }
    
    async generateReport(calculationResults, buildingData) {
        await this.loadJsPDF();
        
        this.doc = new this.jsPDF('portrait', 'mm', 'a4');
        this.currentY = this.margin;
        
        // Generate report sections
        this.addHeader();
        this.addExecutiveSummary(calculationResults, buildingData);
        this.addBuildingSummary(buildingData);
        this.addLoadCalculationResults(calculationResults);
        this.addEquipmentRecommendations(calculationResults, buildingData);
        this.addRebatesAndIncentives(calculationResults, buildingData);
        this.addMethodologyNotes();
        this.addFooter();
        
        // Return the PDF
        return this.doc;
    }
    
    addHeader() {
        const logoWidth = 40;
        const logoHeight = 15;
        
        // Add company logo area (placeholder)
        this.doc.setFillColor(...this.colors.primary);
        this.doc.rect(this.margin, this.currentY, logoWidth, logoHeight, 'F');
        
        // Company name
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Precision HVAC', this.margin + 2, this.currentY + 6);
        this.doc.text('NorCal', this.margin + 2, this.currentY + 11);
        
        // Report title
        this.doc.setTextColor(...this.colors.text);
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('ACCA Manual J Load Calculation Report', this.margin + logoWidth + 10, this.currentY + 8);
        
        // Report subtitle
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.light);
        this.doc.text('Professional HVAC Load Analysis & Equipment Sizing', this.margin + logoWidth + 10, this.currentY + 14);
        
        // Report date and info
        const reportDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        this.doc.setFontSize(10);
        this.doc.text(`Report Date: ${reportDate}`, this.pageWidth - this.margin - 60, this.currentY + 6);
        this.doc.text('Report ID: #MJ-' + Date.now().toString().slice(-6), this.pageWidth - this.margin - 60, this.currentY + 11);
        
        this.currentY += logoHeight + 15;
        this.addHorizontalLine();
    }
    
    addExecutiveSummary(results, building) {
        this.addSectionHeader('Executive Summary');
        
        const propertyAddress = building['property-address'] || building.address || 'Property Address Not Provided';
        
        // Property info box
        this.addInfoBox('Property Information', [
            `Address: ${propertyAddress}`,
            `Total Area: ${building.totalArea || building['total-area'] || 'N/A'} sq ft`,
            `Year Built: ${building.yearBuilt || building['year-built'] || 'N/A'}`,
            `Stories: ${building.stories || 'N/A'}`,
            `Climate Zone: ${results.climate?.zone || '3C (Bay Area)'}`
        ]);
        
        this.currentY += 5;
        
        // Load summary box
        this.addInfoBox('Load Calculation Summary', [
            `Heating Load: ${results.heating.total.toLocaleString()} Btu/h`,
            `Cooling Load: ${results.cooling.total.toLocaleString()} Btu/h`,
            `Load Density (Heating): ${results.loadDensity.heating} Btu/h/sq ft`,
            `Load Density (Cooling): ${results.loadDensity.cooling} Btu/h/sq ft`,
            `Design Conditions: ${results.climate.winterDesignTemp}°F / ${results.climate.summerDesignTemp}°F`
        ]);
        
        this.currentY += 10;
        
        // Key findings
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.text);
        this.doc.text('Key Findings:', this.margin, this.currentY);
        this.currentY += 7;
        
        const findings = this.generateKeyFindings(results, building);
        findings.forEach(finding => {
            this.addBulletPoint(finding);
        });
        
        this.currentY += 5;
    }
    
    generateKeyFindings(results, building) {
        const findings = [];
        
        // Load density analysis
        const avgLoadDensity = (results.loadDensity.heating + results.loadDensity.cooling) / 2;
        if (avgLoadDensity < 25) {
            findings.push('Excellent building envelope performance with low load density');
        } else if (avgLoadDensity < 35) {
            findings.push('Good building envelope performance with moderate load density');
        } else {
            findings.push('Building envelope improvements recommended to reduce load density');
        }
        
        // Equipment recommendations
        findings.push(`Recommended system capacity: ${Math.ceil(Math.max(results.heating.total, results.cooling.total) / 6000) * 0.5} tons`);
        
        // Energy efficiency opportunity
        findings.push('Heat pump technology recommended for maximum efficiency and electrification benefits');
        
        // Rebate opportunity
        findings.push(`Estimated available rebates and incentives: $8,000 - $12,000`);
        
        return findings;
    }
    
    addBuildingSummary(building) {
        this.checkPageBreak(80);
        this.addSectionHeader('Building Characteristics');
        
        // Building envelope table
        const envelopeData = [
            ['Component', 'Description', 'R-Value/U-Value'],
            ['Walls', building['wall-type'] || 'Not specified', `R-${building['wall-insulation'] || 'N/A'}`],
            ['Roof/Attic', building['attic-type'] || 'Not specified', `R-${building['attic-insulation'] || 'N/A'}`],
            ['Foundation', building['foundation-type'] || 'Not specified', `R-${building['foundation-insulation'] || '0'}`],
            ['Windows', building['window-type'] || 'Not specified', this.getWindowUValue(building['window-type'])],
        ];
        
        this.addTable(envelopeData, [50, 80, 40]);
        
        this.currentY += 10;
        
        // Window areas (if specified)
        const windowAreas = [
            parseFloat(building['window-area-north']) || 0,
            parseFloat(building['window-area-east']) || 0,
            parseFloat(building['window-area-south']) || 0,
            parseFloat(building['window-area-west']) || 0
        ];
        
        const totalWindowArea = windowAreas.reduce((sum, area) => sum + area, 0);
        
        if (totalWindowArea > 0) {
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Window Areas by Orientation:', this.margin, this.currentY);
            this.currentY += 6;
            
            const windowData = [
                ['Orientation', 'Area (sq ft)', 'Percentage'],
                ['North', windowAreas[0].toString(), `${((windowAreas[0] / totalWindowArea) * 100).toFixed(1)}%`],
                ['East', windowAreas[1].toString(), `${((windowAreas[1] / totalWindowArea) * 100).toFixed(1)}%`],
                ['South', windowAreas[2].toString(), `${((windowAreas[2] / totalWindowArea) * 100).toFixed(1)}%`],
                ['West', windowAreas[3].toString(), `${((windowAreas[3] / totalWindowArea) * 100).toFixed(1)}%`],
                ['Total', totalWindowArea.toString(), '100%']
            ];
            
            this.addTable(windowData, [40, 30, 30]);
            this.currentY += 5;
        }
    }
    
    addLoadCalculationResults(results) {
        this.checkPageBreak(100);
        this.addSectionHeader('Load Calculation Results');
        
        // Heating load breakdown
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Heating Load Analysis', this.margin, this.currentY);
        this.currentY += 7;
        
        const heatingData = [
            ['Component', 'Load (Btu/h)', 'Percentage'],
            ['Walls', results.heating.components.walls.toLocaleString(), `${((results.heating.components.walls / results.heating.total) * 100).toFixed(1)}%`],
            ['Windows', results.heating.components.windows.toLocaleString(), `${((results.heating.components.windows / results.heating.total) * 100).toFixed(1)}%`],
            ['Roof/Ceiling', results.heating.components.roof.toLocaleString(), `${((results.heating.components.roof / results.heating.total) * 100).toFixed(1)}%`],
            ['Foundation', results.heating.components.foundation.toLocaleString(), `${((results.heating.components.foundation / results.heating.total) * 100).toFixed(1)}%`],
            ['Air Infiltration', results.heating.components.infiltration.toLocaleString(), `${((results.heating.components.infiltration / results.heating.total) * 100).toFixed(1)}%`],
            ['Total', results.heating.total.toLocaleString(), '100%']
        ];
        
        this.addTable(heatingData, [60, 40, 30]);
        
        this.currentY += 10;
        
        // Cooling load breakdown
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Cooling Load Analysis', this.margin, this.currentY);
        this.currentY += 7;
        
        const coolingData = [
            ['Component', 'Load (Btu/h)', 'Percentage'],
            ['Walls', results.cooling.components.walls.toLocaleString(), `${((results.cooling.components.walls / results.cooling.total) * 100).toFixed(1)}%`],
            ['Windows', results.cooling.components.windows.toLocaleString(), `${((results.cooling.components.windows / results.cooling.total) * 100).toFixed(1)}%`],
            ['Roof/Ceiling', results.cooling.components.roof.toLocaleString(), `${((results.cooling.components.roof / results.cooling.total) * 100).toFixed(1)}%`],
            ['Air Infiltration', results.cooling.components.infiltration.toLocaleString(), `${((results.cooling.components.infiltration / results.cooling.total) * 100).toFixed(1)}%`],
            ['Internal Gains', results.cooling.components.internal.toLocaleString(), `${((results.cooling.components.internal / results.cooling.total) * 100).toFixed(1)}%`],
            ['Total Sensible', results.cooling.sensible.toLocaleString(), `${((results.cooling.sensible / results.cooling.total) * 100).toFixed(1)}%`],
            ['Total Latent', results.cooling.latent.toLocaleString(), `${((results.cooling.latent / results.cooling.total) * 100).toFixed(1)}%`],
            ['Total', results.cooling.total.toLocaleString(), '100%']
        ];
        
        this.addTable(coolingData, [60, 40, 30]);
        this.currentY += 5;
    }
    
    addEquipmentRecommendations(results, building) {
        this.checkPageBreak(80);
        this.addSectionHeader('Equipment Recommendations');
        
        // Generate recommendations using the calculator
        const recommendations = window.calculator ? 
            window.calculator.generateRecommendations(results, building) : 
            this.getDefaultRecommendations(results);
        
        recommendations.forEach((rec, index) => {
            this.checkPageBreak(60);
            
            // Recommendation header
            this.doc.setFillColor(rec.recommended ? ...this.colors.success : ...this.colors.light);
            this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F');
            
            this.doc.setTextColor(255, 255, 255);
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(
                `${rec.recommended ? '⭐ RECOMMENDED: ' : 'Alternative: '}${rec.type}`,
                this.margin + 2,
                this.currentY + 5
            );
            
            this.currentY += 12;
            
            // Recommendation details
            this.doc.setTextColor(...this.colors.text);
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            
            const details = [
                `Recommended Size: ${(rec.sizingCapacity / 1000).toFixed(1)} tons (${rec.sizingCapacity.toLocaleString()} Btu/h)`,
                `Heating Efficiency: ${rec.heatingEfficiency.hspf} HSPF`,
                `Cooling Efficiency: ${rec.coolingEfficiency.seer} SEER`,
                `Estimated Annual Savings: $${rec.annualSavings.toLocaleString()}`,
                `Available Rebates: $${rec.rebatesAvailable.total.toLocaleString()}`,
                `Estimated Cost Range: $${rec.costRange.low.toLocaleString()} - $${rec.costRange.high.toLocaleString()}`
            ];
            
            details.forEach(detail => {
                this.doc.text('• ' + detail, this.margin + 5, this.currentY);
                this.currentY += 5;
            });
            
            this.currentY += 5;
        });
    }
    
    addRebatesAndIncentives(results, building) {
        this.checkPageBreak(60);
        this.addSectionHeader('Available Rebates & Incentives');
        
        // Create a comprehensive rebate table
        const rebateData = [
            ['Program', 'Eligibility', 'Amount', 'Notes'],
            ['PG&E Heat Pump Rebate', 'HSPF ≥ 8.5', 'Up to $3,000', 'Ducted systems'],
            ['TECH Clean California', 'HSPF ≥ 9.0', 'Up to $3,000', 'Income qualified'],
            ['Federal Tax Credit', 'All heat pumps', '30% of cost', 'Max varies by system'],
            ['BAAQMD Incentive', 'Bay Area residents', 'Up to $1,500', 'Air quality program'],
            ['Local Utility Programs', 'Varies by utility', '$500 - $2,000', 'Check with provider']
        ];
        
        this.addTable(rebateData, [45, 35, 25, 55]);
        
        this.currentY += 10;
        
        // Rebate application notes
        this.addInfoBox('Important Rebate Information', [
            'Rebate programs subject to funding availability and change without notice',
            'Some programs require pre-approval before installation',
            'Income requirements may apply to certain programs',
            'Professional installation typically required for rebate eligibility',
            'Precision HVAC NorCal can assist with rebate applications and processing'
        ]);
        
        this.currentY += 5;
    }
    
    addMethodologyNotes() {
        this.checkPageBreak(60);
        this.addSectionHeader('Calculation Methodology');
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        
        const methodology = [
            'This load calculation follows ACCA Manual J 8th Edition procedures for residential applications.',
            'Design conditions based on ASHRAE climatic data for the Bay Area (Climate Zone 3C).',
            'Building envelope heat transfer calculated using thermal resistance (R-value) and conductance (U-value) methods.',
            'Solar heat gains calculated based on window orientation, glazing properties, and shading conditions.',
            'Air infiltration estimated based on building age, construction type, and envelope tightness.',
            'Internal heat gains include occupants, lighting, and equipment based on standard assumptions.',
            'Safety factors applied per ACCA guidelines: 15% for heating loads, 10% for cooling loads.',
            'Equipment recommendations based on calculated loads with consideration for local climate conditions.'
        ];
        
        methodology.forEach((note, index) => {
            this.checkPageBreak(8);
            this.doc.text(`${index + 1}. ${note}`, this.margin, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin });
            this.currentY += 6;
        });
        
        this.currentY += 10;
        
        // Disclaimer
        this.addInfoBox('Important Disclaimers', [
            'This analysis is based on standard calculation methods and typical operating assumptions.',
            'Actual energy usage may vary based on occupant behavior, weather conditions, and equipment performance.',
            'Professional verification and site inspection recommended before final equipment selection.',
            'All rebate amounts and equipment costs are estimates subject to change.',
            'Installation costs may vary based on site-specific conditions and local code requirements.'
        ], this.colors.warning);
    }
    
    addFooter() {
        const footerY = this.pageHeight - 20;
        
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.light);
        
        // Company contact info
        this.doc.text('Precision HVAC NorCal | (510) 555-0123 | info@precisionhvacnorcal.com', this.margin, footerY);
        this.doc.text('Licensed, Bonded & Insured | CSLB #123456', this.margin, footerY + 4);
        
        // Page number
        this.doc.text(`Page ${this.doc.internal.getNumberOfPages()}`, this.pageWidth - this.margin - 20, footerY);
    }
    
    // Helper methods
    addSectionHeader(title) {
        this.checkPageBreak(20);
        this.doc.setFillColor(...this.colors.primary);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin + 3, this.currentY + 7);
        
        this.currentY += 15;
    }
    
    addInfoBox(title, items, color = this.colors.secondary) {
        const boxHeight = 8 + items.length * 5;
        this.checkPageBreak(boxHeight);
        
        // Box background
        this.doc.setFillColor(...color);
        this.doc.setGState(this.doc.GState({ opacity: 0.1 }));
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 'F');
        this.doc.setGState(this.doc.GState({ opacity: 1 }));
        
        // Box border
        this.doc.setDrawColor(...color);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight);
        
        // Title
        this.doc.setTextColor(...color);
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin + 3, this.currentY + 6);
        
        // Items
        this.doc.setTextColor(...this.colors.text);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        
        items.forEach((item, index) => {
            this.doc.text('• ' + item, this.margin + 5, this.currentY + 12 + index * 5);
        });
        
        this.currentY += boxHeight + 5;
    }
    
    addBulletPoint(text) {
        this.checkPageBreak(8);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        this.doc.text('• ' + text, this.margin + 5, this.currentY, { maxWidth: this.pageWidth - 2 * this.margin - 10 });
        this.currentY += 6;
    }
    
    addTable(data, columnWidths) {
        const startY = this.currentY;
        const rowHeight = 7;
        
        this.checkPageBreak(data.length * rowHeight + 10);
        
        data.forEach((row, rowIndex) => {
            let x = this.margin;
            
            row.forEach((cell, colIndex) => {
                const width = columnWidths[colIndex];
                
                // Header styling
                if (rowIndex === 0) {
                    this.doc.setFillColor(...this.colors.primary);
                    this.doc.rect(x, this.currentY, width, rowHeight, 'F');
                    this.doc.setTextColor(255, 255, 255);
                    this.doc.setFont('helvetica', 'bold');
                } else {
                    // Alternate row coloring
                    if (rowIndex % 2 === 0) {
                        this.doc.setFillColor(248, 249, 250);
                        this.doc.rect(x, this.currentY, width, rowHeight, 'F');
                    }
                    this.doc.setTextColor(...this.colors.text);
                    this.doc.setFont('helvetica', 'normal');
                }
                
                // Cell border
                this.doc.setDrawColor(200, 200, 200);
                this.doc.rect(x, this.currentY, width, rowHeight);
                
                // Cell text
                this.doc.setFontSize(9);
                this.doc.text(cell, x + 2, this.currentY + 4.5, { maxWidth: width - 4 });
                
                x += width;
            });
            
            this.currentY += rowHeight;
        });
        
        this.currentY += 5;
    }
    
    addHorizontalLine() {
        this.doc.setDrawColor(...this.colors.light);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 3;
    }
    
    checkPageBreak(requiredSpace) {
        if (this.currentY + requiredSpace > this.pageHeight - 40) {
            this.doc.addPage();
            this.currentY = this.margin;
        }
    }
    
    getWindowUValue(windowType) {
        const uValues = {
            'single-pane': 'U-1.1',
            'double-pane': 'U-0.5',
            'double-pane-lowE': 'U-0.35',
            'triple-pane': 'U-0.25',
            'triple-pane-lowE': 'U-0.2'
        };
        return uValues[windowType] || 'N/A';
    }
    
    getDefaultRecommendations(results) {
        const maxLoad = Math.max(results.heating.total, results.cooling.total);
        
        return [{
            type: 'Heat Pump System',
            recommended: true,
            sizingCapacity: Math.ceil(maxLoad / 6000) * 6000,
            heatingEfficiency: { hspf: 9.0 },
            coolingEfficiency: { seer: 16 },
            annualSavings: 1500,
            rebatesAvailable: { total: 8000 },
            costRange: { low: 12000, high: 18000 }
        }];
    }
}

// Enhanced PDF generation function for the interface
async function generatePDFReport() {
    if (!window.calculationResults || !window.buildingData) {
        alert('Please complete the assessment before generating a report.');
        return;
    }
    
    const generator = new PDFReportGenerator();
    
    try {
        // Show loading state
        const button = document.querySelector('[onclick="generatePDFReport()"]');
        const originalText = button?.textContent;
        if (button) {
            button.textContent = 'Generating PDF...';
            button.disabled = true;
        }
        
        // Generate the PDF
        const doc = await generator.generateReport(window.calculationResults, window.buildingData);
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const address = window.buildingData['property-address'] || 'Property';
        const cleanAddress = address.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const filename = `Manual_J_Report_${cleanAddress}_${timestamp}.pdf`;
        
        // Save the PDF
        doc.save(filename);
        
        // Show success message
        setTimeout(() => {
            alert('PDF report generated successfully! The file has been downloaded.');
        }, 500);
        
        // Restore button
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
        
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF report. Please try again.');
        
        // Restore button
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
    }
}

// Override the existing PDF generation function
document.addEventListener('DOMContentLoaded', function() {
    // Replace the existing generatePDFReport function
    if (typeof window.generatePDFReport !== 'undefined') {
        window.originalGeneratePDFReport = window.generatePDFReport;
    }
    window.generatePDFReport = generatePDFReport;
    
    // Also replace the function in manual-j-interface.js if it exists
    setTimeout(() => {
        if (typeof window.generateSummaryReport !== 'undefined') {
            window.originalGenerateSummaryReport = window.generateSummaryReport;
            window.generateSummaryReport = generatePDFReport;
        }
    }, 1000);
});

// Export for external use
if (typeof window !== 'undefined') {
    window.PDFReportGenerator = PDFReportGenerator;
}