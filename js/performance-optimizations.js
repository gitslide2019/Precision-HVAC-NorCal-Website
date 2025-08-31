/**
 * Performance Optimizations
 * Addresses loading time and performance issues identified in testing
 */

// Lazy load non-critical resources
document.addEventListener('DOMContentLoaded', function() {
    initializePerformanceOptimizations();
});

function initializePerformanceOptimizations() {
    // Lazy load images
    lazyLoadImages();
    
    // Optimize Chart.js loading
    optimizeChartLoading();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Implement service worker for caching
    registerServiceWorker();
    
    // Optimize map tiles loading
    optimizeMapLoading();
}

// Lazy load images to improve initial page load
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
}

// Optimize Chart.js loading for Manual J assessment
function optimizeChartLoading() {
    // Only load Chart.js when needed
    if (document.getElementById('loadBreakdownChart') || document.getElementById('monthlyEnergyChart')) {
        // Chart.js is already loaded via CDN in the HTML
        // Optimize chart creation with requestAnimationFrame
        if (typeof Chart !== 'undefined') {
            Chart.defaults.animation.duration = 300; // Reduce animation time
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
        }
    }
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        'css/styles.css',
        'css/mobile-fixes.css',
        'js/script.js',
        'js/ui-fixes.js'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        
        if (resource.endsWith('.css')) {
            link.as = 'style';
        } else if (resource.endsWith('.js')) {
            link.as = 'script';
        }
        
        link.href = resource;
        document.head.appendChild(link);
    });
}

// Register service worker for caching
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    }
}

// Optimize map loading
function optimizeMapLoading() {
    if (typeof L !== 'undefined') {
        // Reduce tile loading for better performance
        const originalTileLayer = L.tileLayer;
        L.tileLayer = function(url, options = {}) {
            return originalTileLayer(url, {
                ...options,
                maxZoom: options.maxZoom || 16, // Reduce max zoom to limit tile requests
                keepBuffer: 2, // Reduce buffer to save memory
                updateWhenIdle: true, // Update tiles only when map is idle
                updateWhenZooming: false // Don't update during zoom animation
            });
        };
    }
}

// Optimize form performance for large forms
function optimizeFormPerformance() {
    // Debounce form input events to reduce processing
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        let timeout;
        const originalHandler = input.oninput;
        
        input.oninput = function(e) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (originalHandler) {
                    originalHandler.call(this, e);
                }
            }, 150); // Debounce input events
        };
    });
}

// Memory cleanup utilities
function cleanupMemory() {
    // Clean up event listeners on page unload
    window.addEventListener('beforeunload', () => {
        // Remove map instance to prevent memory leaks
        if (window.eligibilityMap) {
            window.eligibilityMap.remove();
        }
        
        // Clean up chart instances
        if (window.Chart && Chart.instances) {
            Object.values(Chart.instances).forEach(chart => {
                chart.destroy();
            });
        }
    });
}

// Initialize optimizations
document.addEventListener('DOMContentLoaded', optimizeFormPerformance);
window.addEventListener('load', cleanupMemory);

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            console.log('Performance Metrics:');
            console.log(`Page Load Time: ${pageLoadTime}ms`);
            console.log(`DOM Ready Time: ${domReadyTime}ms`);
            
            // Send to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: pageLoadTime,
                    custom_parameter: window.location.pathname
                });
            }
        });
    }
}

// Resource hints for better loading
function addResourceHints() {
    const hints = [
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: '//unpkg.com' },
        { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
    ];
    
    hints.forEach(hint => {
        const link = document.createElement('link');
        Object.keys(hint).forEach(attr => {
            link.setAttribute(attr, hint[attr]);
        });
        document.head.appendChild(link);
    });
}

// Critical CSS inlining for above-the-fold content
function inlineCriticalCSS() {
    const criticalCSS = `
        .header { background: rgba(255, 255, 255, 0.95); position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
        .eligibility-checker { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6rem 0 3rem; margin-top: 80px; }
        .loading-spinner { width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #2c5282; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
}

// Image compression and optimization
function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add loading="lazy" for native lazy loading
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add proper alt attributes if missing
        if (!img.hasAttribute('alt')) {
            img.setAttribute('alt', '');
        }
        
        // Optimize image sizes based on container
        img.addEventListener('load', function() {
            const container = this.parentElement;
            const containerWidth = container.offsetWidth;
            
            if (this.naturalWidth > containerWidth * 2) {
                console.log(`Image ${this.src} could be optimized - natural width: ${this.naturalWidth}, container: ${containerWidth}`);
            }
        });
    });
}

// Initialize all optimizations
document.addEventListener('DOMContentLoaded', function() {
    addResourceHints();
    inlineCriticalCSS();
    optimizeImages();
    measurePerformance();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        optimizeFormPerformance,
        lazyLoadImages,
        measurePerformance
    };
} else if (typeof window !== 'undefined') {
    window.PerformanceOptimizations = {
        optimizeFormPerformance,
        lazyLoadImages,
        measurePerformance
    };
}