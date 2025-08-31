/**
 * Responsive Charts Enhancement
 * Improves Chart.js responsiveness and mobile experience
 */

class ResponsiveCharts {
    constructor() {
        this.charts = new Map();
        this.resizeObserver = null;
        this.init();
    }
    
    init() {
        // Set global Chart.js defaults for better responsiveness
        if (typeof Chart !== 'undefined') {
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
            Chart.defaults.interaction = {
                intersect: false,
                mode: 'index'
            };
            
            // Mobile-optimized defaults
            if (window.innerWidth <= 768) {
                Chart.defaults.plugins.legend.display = true;
                Chart.defaults.plugins.legend.position = 'bottom';
                Chart.defaults.plugins.legend.labels.usePointStyle = true;
                Chart.defaults.plugins.legend.labels.boxWidth = 12;
                Chart.defaults.plugins.tooltip.enabled = true;
                Chart.defaults.plugins.tooltip.touchNearestPosition = true;
            }
        }
        
        this.setupResizeObserver();
        this.overrideChartCreation();
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    const canvas = entry.target;
                    const chartId = canvas.id;
                    if (this.charts.has(chartId)) {
                        this.resizeChart(chartId);
                    }
                });
            });
        }
    }
    
    overrideChartCreation() {
        // Store original Chart constructor
        if (typeof Chart !== 'undefined' && !window.originalChart) {
            window.originalChart = Chart;
            
            // Override Chart constructor to register charts with our manager
            window.Chart = function(ctx, config) {
                const chart = new window.originalChart(ctx, config);
                
                // Register with our responsive manager
                if (window.responsiveCharts && ctx && ctx.id) {
                    window.responsiveCharts.registerChart(ctx.id, chart, config);
                }
                
                return chart;
            };
            
            // Copy static properties
            Object.setPrototypeOf(window.Chart, window.originalChart);
            Object.assign(window.Chart, window.originalChart);
        }
    }
    
    registerChart(canvasId, chart, config) {
        this.charts.set(canvasId, { chart, config, lastResize: Date.now() });
        
        const canvas = document.getElementById(canvasId);
        if (canvas && this.resizeObserver) {
            this.resizeObserver.observe(canvas);
        }
        
        // Apply responsive configuration
        this.makeChartResponsive(canvasId, chart, config);
    }
    
    makeChartResponsive(canvasId, chart, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const container = canvas.parentElement;
        
        // Set container styles for proper responsiveness
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.minHeight = '300px';
        
        // Mobile-specific adjustments
        if (window.innerWidth <= 768) {
            this.applyMobileOptimizations(chart, config);
            container.style.minHeight = '250px';
        }
        
        // Tablet adjustments
        if (window.innerWidth <= 1024 && window.innerWidth > 768) {
            container.style.minHeight = '350px';
        }
        
        // Set canvas styles
        canvas.style.width = '100% !important';
        canvas.style.height = 'auto !important';
        canvas.style.maxWidth = '100%';
        
        // Force initial resize
        setTimeout(() => this.resizeChart(canvasId), 100);
    }
    
    applyMobileOptimizations(chart, config) {
        if (!chart.options) return;
        
        // Adjust font sizes for mobile
        if (chart.options.plugins) {
            if (chart.options.plugins.legend) {
                chart.options.plugins.legend.labels = {
                    ...chart.options.plugins.legend.labels,
                    font: { size: 12 },
                    padding: 10,
                    usePointStyle: true,
                    boxWidth: 12
                };
            }
            
            if (chart.options.plugins.tooltip) {
                chart.options.plugins.tooltip.titleFont = { size: 13 };
                chart.options.plugins.tooltip.bodyFont = { size: 12 };
                chart.options.plugins.tooltip.cornerRadius = 4;
                chart.options.plugins.tooltip.padding = 8;
            }
        }
        
        // Adjust scales for mobile
        if (chart.options.scales) {
            Object.keys(chart.options.scales).forEach(scaleKey => {
                const scale = chart.options.scales[scaleKey];
                if (scale.ticks) {
                    scale.ticks.font = { size: 11 };
                    scale.ticks.maxTicksLimit = 6; // Reduce ticks on mobile
                }
                if (scale.title) {
                    scale.title.font = { size: 12 };
                }
            });
        }
        
        // Reduce animation duration for better mobile performance
        if (chart.options.animation) {
            chart.options.animation.duration = 200;
        } else {
            chart.options.animation = { duration: 200 };
        }
        
        chart.update('none'); // Update without animation
    }
    
    resizeChart(canvasId) {
        const chartData = this.charts.get(canvasId);
        if (!chartData) return;
        
        const { chart } = chartData;
        const now = Date.now();
        
        // Throttle resize operations
        if (now - chartData.lastResize < 100) return;
        chartData.lastResize = now;
        
        const canvas = document.getElementById(canvasId);
        const container = canvas?.parentElement;
        
        if (!canvas || !container) return;
        
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Set appropriate dimensions
        const aspectRatio = this.getOptimalAspectRatio(chart.config.type);
        const optimalHeight = Math.max(containerWidth / aspectRatio, 250);
        
        // Update container height if needed
        if (containerHeight < optimalHeight) {
            container.style.height = `${optimalHeight}px`;
        }
        
        // Trigger chart resize
        chart.resize();
        
        // Re-apply mobile optimizations if on mobile
        if (window.innerWidth <= 768) {
            this.applyMobileOptimizations(chart, chart.config);
        }
    }
    
    getOptimalAspectRatio(chartType) {
        const aspectRatios = {
            'line': window.innerWidth <= 768 ? 1.5 : 2.5,
            'bar': window.innerWidth <= 768 ? 1.2 : 2.0,
            'doughnut': 1.0,
            'pie': 1.0,
            'polarArea': 1.0,
            'radar': 1.0
        };
        
        return aspectRatios[chartType] || 2.0;
    }
    
    handleOrientationChange() {
        // Delay to allow orientation change to complete
        setTimeout(() => {
            this.charts.forEach((chartData, canvasId) => {
                this.resizeChart(canvasId);
            });
        }, 300);
    }
    
    destroyChart(canvasId) {
        const chartData = this.charts.get(canvasId);
        if (chartData) {
            chartData.chart.destroy();
            this.charts.delete(canvasId);
            
            const canvas = document.getElementById(canvasId);
            if (canvas && this.resizeObserver) {
                this.resizeObserver.unobserve(canvas);
            }
        }
    }
    
    updateAllCharts() {
        this.charts.forEach((chartData, canvasId) => {
            this.resizeChart(canvasId);
        });
    }
    
    // Enhanced chart creation helpers
    static createResponsiveLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: window.innerWidth <= 768 ? 'bottom' : 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ddd',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: window.innerWidth <= 768 ? 6 : 12
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4,
                    borderWidth: window.innerWidth <= 768 ? 2 : 3
                },
                point: {
                    radius: window.innerWidth <= 768 ? 3 : 4,
                    hoverRadius: window.innerWidth <= 768 ? 5 : 6
                }
            }
        };
        
        const mergedOptions = this.deepMerge(defaultOptions, options);
        
        return new Chart(canvas, {
            type: 'line',
            data: data,
            options: mergedOptions
        });
    }
    
    static createResponsiveDoughnutChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: window.innerWidth <= 768 ? 'bottom' : 'right',
                    labels: {
                        padding: window.innerWidth <= 768 ? 10 : 20,
                        usePointStyle: true,
                        font: {
                            size: window.innerWidth <= 768 ? 12 : 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toLocaleString()} Btu/h (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };
        
        const mergedOptions = this.deepMerge(defaultOptions, options);
        
        return new Chart(canvas, {
            type: 'doughnut',
            data: data,
            options: mergedOptions
        });
    }
    
    static deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }
    
    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
}

// Initialize responsive charts system
document.addEventListener('DOMContentLoaded', function() {
    window.responsiveCharts = new ResponsiveCharts();
});

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    if (window.responsiveCharts) {
        window.responsiveCharts.handleOrientationChange();
    }
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.responsiveCharts) {
            window.responsiveCharts.updateAllCharts();
        }
    }, 150);
});

// Override the original chart creation functions in manual-j-interface.js
document.addEventListener('DOMContentLoaded', function() {
    // Wait for manual-j-interface.js to load
    setTimeout(() => {
        if (window.createLoadBreakdownChart) {
            const originalCreateLoadBreakdownChart = window.createLoadBreakdownChart;
            window.createLoadBreakdownChart = function() {
                const ctx = document.getElementById('loadBreakdownChart');
                if (!ctx || !calculationResults.breakdown) return;
                
                const data = {
                    labels: calculationResults.breakdown.heating.labels,
                    datasets: [{
                        label: 'Heating Load (Btu/h)',
                        data: calculationResults.breakdown.heating.values,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', 
                            '#4BC0C0', '#9966FF', '#FF9F40'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                };
                
                return ResponsiveCharts.createResponsiveDoughnutChart('loadBreakdownChart', data);
            };
        }
        
        if (window.createMonthlyEnergyChart) {
            const originalCreateMonthlyEnergyChart = window.createMonthlyEnergyChart;
            window.createMonthlyEnergyChart = function() {
                const ctx = document.getElementById('monthlyEnergyChart');
                if (!ctx || !calculationResults.monthly) return;
                
                const data = {
                    labels: calculationResults.monthly.labels,
                    datasets: [{
                        label: 'Heating Energy (MBtu)',
                        data: calculationResults.monthly.heating,
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Cooling Energy (MBtu)',
                        data: calculationResults.monthly.cooling,
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                };
                
                const options = {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Energy (MBtu)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Energy Usage Profile',
                            font: {
                                size: window.innerWidth <= 768 ? 14 : 16
                            }
                        }
                    }
                };
                
                return ResponsiveCharts.createResponsiveLineChart('monthlyEnergyChart', data, options);
            };
        }
    }, 500);
});

// Export for external use
if (typeof window !== 'undefined') {
    window.ResponsiveCharts = ResponsiveCharts;
}