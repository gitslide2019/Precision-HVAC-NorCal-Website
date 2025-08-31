/**
 * Image Optimization Module
 * Implements WebP support, responsive images, lazy loading, and performance monitoring
 * 
 * Issue #17 Fix: Optimize images for better performance with WebP format and proper sizing
 */

class ImageOptimization {
    constructor() {
        this.supportsWebP = false;
        this.lazyImages = [];
        this.performanceMetrics = {
            imagesLoaded: 0,
            totalImageSize: 0,
            loadTime: 0
        };
        this.observer = null;
        
        // Image size mappings for responsive loading
        this.imageSizes = {
            hero: {
                small: '480w',
                medium: '768w', 
                large: '1200w',
                xlarge: '1920w'
            },
            gallery: {
                small: '300w',
                medium: '600w',
                large: '900w'
            },
            avatar: {
                small: '50w',
                medium: '100w',
                large: '150w'
            }
        };
    }

    /**
     * Initialize image optimization system
     */
    async init() {
        await this.detectWebPSupport();
        this.setupLazyLoading();
        this.optimizeExistingImages();
        this.setupPerformanceMonitoring();
        this.createImagePreloadSystem();
        console.log('Image optimization initialized', {
            webpSupport: this.supportsWebP,
            lazyImages: this.lazyImages.length
        });
    }

    /**
     * Detect WebP support in browser
     */
    async detectWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this.supportsWebP = (webP.height === 2);
                resolve(this.supportsWebP);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    /**
     * Setup intersection observer for lazy loading
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    /**
     * Optimize existing images in the document
     */
    optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-optimized])');
        
        images.forEach(img => {
            this.optimizeImage(img);
        });

        // Setup mutation observer for dynamically added images
        if ('MutationObserver' in window) {
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            const newImages = node.querySelectorAll ? 
                                node.querySelectorAll('img:not([data-optimized])') : 
                                (node.tagName === 'IMG' && !node.hasAttribute('data-optimized') ? [node] : []);
                            
                            newImages.forEach(img => this.optimizeImage(img));
                        }
                    });
                });
            });

            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Optimize individual image element
     */
    optimizeImage(img) {
        if (img.hasAttribute('data-optimized')) return;

        const originalSrc = img.src || img.getAttribute('data-src');
        if (!originalSrc) return;

        // Determine image type and create optimized version
        const imageType = this.getImageType(img);
        const optimizedSources = this.createOptimizedSources(originalSrc, imageType);

        // Create picture element with WebP support
        this.wrapImageWithPicture(img, optimizedSources);

        // Setup lazy loading
        this.setupImageLazyLoading(img);

        // Add loading attributes
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        img.setAttribute('data-optimized', 'true');

        // Add error handling
        this.addImageErrorHandling(img);
    }

    /**
     * Determine image type based on context
     */
    getImageType(img) {
        const classList = img.classList;
        const parentClasses = img.parentElement?.classList || [];
        
        if (classList.contains('hero-image') || parentClasses.contains('hero-section')) {
            return 'hero';
        }
        if (classList.contains('avatar') || img.getAttribute('alt')?.toLowerCase().includes('avatar')) {
            return 'avatar';
        }
        if (classList.contains('gallery-image') || parentClasses.contains('gallery')) {
            return 'gallery';
        }
        
        return 'gallery'; // Default to gallery sizing
    }

    /**
     * Create optimized image sources for different formats and sizes
     */
    createOptimizedSources(originalSrc, imageType) {
        const basePath = originalSrc.replace(/\.[^/.]+$/, ''); // Remove extension
        const extension = originalSrc.split('.').pop();
        
        const sizes = this.imageSizes[imageType];
        const sources = [];

        // WebP sources (if supported)
        if (this.supportsWebP) {
            sources.push({
                type: 'image/webp',
                srcset: this.generateSrcSet(basePath, 'webp', sizes),
                sizes: this.generateSizesAttribute(imageType)
            });
        }

        // Original format sources with different sizes
        sources.push({
            type: `image/${extension}`,
            srcset: this.generateSrcSet(basePath, extension, sizes),
            sizes: this.generateSizesAttribute(imageType)
        });

        return sources;
    }

    /**
     * Generate srcset attribute for responsive images
     */
    generateSrcSet(basePath, extension, sizes) {
        const srcsetItems = [];
        
        Object.entries(sizes).forEach(([sizeName, sizeValue]) => {
            // In a real implementation, these would be actual optimized images
            // For now, we'll use the original image with size hints
            const sizeWidth = sizeValue.replace('w', '');
            srcsetItems.push(`${basePath}.${extension} ${sizeWidth}w`);
        });

        return srcsetItems.join(', ');
    }

    /**
     * Generate sizes attribute based on image type
     */
    generateSizesAttribute(imageType) {
        const sizeRules = {
            hero: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw',
            gallery: '(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw',
            avatar: '(max-width: 768px) 50px, 100px'
        };

        return sizeRules[imageType] || sizeRules.gallery;
    }

    /**
     * Wrap image with picture element for format support
     */
    wrapImageWithPicture(img, sources) {
        if (img.parentElement.tagName === 'PICTURE') return;

        const picture = document.createElement('picture');
        const imgClone = img.cloneNode(true);

        // Add source elements
        sources.forEach(source => {
            const sourceEl = document.createElement('source');
            sourceEl.type = source.type;
            sourceEl.srcset = source.srcset;
            sourceEl.sizes = source.sizes;
            picture.appendChild(sourceEl);
        });

        // Add the img element
        picture.appendChild(imgClone);

        // Replace original img with picture
        img.parentElement.replaceChild(picture, img);

        return imgClone;
    }

    /**
     * Setup lazy loading for image
     */
    setupImageLazyLoading(img) {
        const src = img.src;
        
        if (src && src !== '' && !src.startsWith('data:')) {
            // Move src to data-src for lazy loading
            img.setAttribute('data-src', src);
            img.src = this.createPlaceholder(img);
            
            // Add to lazy loading list
            this.lazyImages.push(img);
            
            if (this.observer) {
                this.observer.observe(img);
            } else {
                // Fallback for browsers without IntersectionObserver
                this.loadImage(img);
            }
        }
    }

    /**
     * Create placeholder image
     */
    createPlaceholder(img) {
        const width = img.getAttribute('width') || 300;
        const height = img.getAttribute('height') || 200;
        
        // Create SVG placeholder
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f8f9fa"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
                      fill="#6c757d" text-anchor="middle" dy=".3em">Loading...</text>
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * Load image and handle performance tracking
     */
    loadImage(img) {
        const startTime = performance.now();
        const dataSrc = img.getAttribute('data-src');
        
        if (!dataSrc) return;

        // Create new image to preload
        const newImg = new Image();
        
        newImg.onload = () => {
            const loadTime = performance.now() - startTime;
            this.updatePerformanceMetrics(loadTime, newImg);
            
            // Apply loaded image
            img.src = dataSrc;
            img.classList.add('loaded');
            
            // Add fade-in effect
            this.addLoadingAnimation(img);
        };

        newImg.onerror = () => {
            console.error('Failed to load image:', dataSrc);
            this.handleImageError(img);
        };

        newImg.src = dataSrc;
    }

    /**
     * Add error handling for images
     */
    addImageErrorHandling(img) {
        img.addEventListener('error', () => {
            this.handleImageError(img);
        });
    }

    /**
     * Handle image loading errors
     */
    handleImageError(img) {
        // Create error placeholder
        const errorSvg = `
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6"/>
                <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="12" 
                      fill="#6c757d" text-anchor="middle">Image not available</text>
                <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="10" 
                      fill="#adb5bd" text-anchor="middle">Click to retry</text>
            </svg>
        `;
        
        img.src = `data:image/svg+xml;base64,${btoa(errorSvg)}`;
        img.classList.add('error');
        
        // Add retry functionality
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            const originalSrc = img.getAttribute('data-src');
            if (originalSrc) {
                img.src = this.createPlaceholder(img);
                img.classList.remove('error');
                img.style.cursor = 'auto';
                setTimeout(() => this.loadImage(img), 100);
            }
        });
    }

    /**
     * Add smooth loading animation
     */
    addLoadingAnimation(img) {
        img.style.transition = 'opacity 0.3s ease-in-out';
        img.style.opacity = '0';
        
        // Trigger fade in
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(loadTime, img) {
        this.performanceMetrics.imagesLoaded++;
        this.performanceMetrics.loadTime += loadTime;
        
        // Estimate image size (not exact, but useful for monitoring)
        if (img.naturalWidth && img.naturalHeight) {
            const estimatedSize = (img.naturalWidth * img.naturalHeight * 3) / 1024; // Rough KB estimate
            this.performanceMetrics.totalImageSize += estimatedSize;
        }
    }

    /**
     * Create image preload system for critical images
     */
    createImagePreloadSystem() {
        // Preload critical images
        const criticalImages = [
            '/images/heat-pump-exterior.jpg',
            '/images/comfortable-home.jpg'
        ];

        criticalImages.forEach(src => {
            this.preloadImage(src);
        });
    }

    /**
     * Preload individual image
     */
    preloadImage(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        
        // Add WebP version if supported
        if (this.supportsWebP) {
            const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
            link.href = webpSrc;
        }
        
        document.head.appendChild(link);
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            averageLoadTime: this.performanceMetrics.imagesLoaded > 0 ? 
                this.performanceMetrics.loadTime / this.performanceMetrics.imagesLoaded : 0,
            webpSupport: this.supportsWebP
        };
    }

    /**
     * Add CSS for image optimization effects
     */
    addOptimizationCSS() {
        const css = `
            <style>
            /* Image optimization styles */
            img {
                max-width: 100%;
                height: auto;
                display: block;
            }

            img[data-optimized] {
                transition: opacity 0.3s ease-in-out;
            }

            img.loaded {
                animation: fadeIn 0.3s ease-in-out;
            }

            img.error {
                border: 2px dashed #dee2e6;
                background: #f8f9fa;
            }

            img.error:hover {
                background: #e9ecef;
            }

            picture {
                display: block;
                width: 100%;
            }

            /* Responsive image containers */
            .hero-image-container,
            .gallery-image-container {
                position: relative;
                overflow: hidden;
            }

            .hero-image-container {
                aspect-ratio: 16/9;
            }

            .gallery-image-container {
                aspect-ratio: 4/3;
            }

            .avatar-container {
                aspect-ratio: 1/1;
                border-radius: 50%;
                overflow: hidden;
            }

            /* Loading placeholder animation */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            img[src*="data:image/svg+xml"] {
                animation: pulse 1.5s ease-in-out infinite;
            }

            /* Performance indicator */
            .image-performance-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 123, 255, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
                display: none;
                transition: all 0.3s ease;
            }

            .image-performance-indicator.visible {
                display: block;
            }

            .image-performance-indicator.good {
                background: rgba(40, 167, 69, 0.9);
            }

            .image-performance-indicator.poor {
                background: rgba(220, 53, 69, 0.9);
            }

            @media (max-width: 768px) {
                .hero-image-container {
                    aspect-ratio: 4/3;
                }
                
                .image-performance-indicator {
                    display: none !important;
                }
            }
            </style>
        `;

        if (!document.querySelector('style[data-image-optimization]')) {
            document.head.insertAdjacentHTML('beforeend', css);
            document.querySelector('head style:last-child').setAttribute('data-image-optimization', 'true');
        }
    }

    /**
     * Create performance monitoring UI
     */
    createPerformanceMonitor() {
        const indicator = document.createElement('div');
        indicator.className = 'image-performance-indicator';
        indicator.innerHTML = '<i class="fas fa-image"></i> Images: 0/0';
        document.body.appendChild(indicator);

        // Update indicator periodically
        setInterval(() => {
            const metrics = this.getPerformanceMetrics();
            const averageTime = Math.round(metrics.averageLoadTime);
            
            indicator.innerHTML = `
                <i class="fas fa-image"></i> 
                Images: ${metrics.imagesLoaded}/${this.lazyImages.length} 
                (${averageTime}ms avg)
            `;

            // Update indicator class based on performance
            indicator.className = 'image-performance-indicator visible';
            if (averageTime < 500) {
                indicator.classList.add('good');
            } else if (averageTime > 1500) {
                indicator.classList.add('poor');
            }

            // Hide after all images loaded
            if (metrics.imagesLoaded >= this.lazyImages.length && this.lazyImages.length > 0) {
                setTimeout(() => {
                    indicator.classList.remove('visible');
                }, 3000);
            }
        }, 1000);
    }
}

// Global instance
window.ImageOptimization = ImageOptimization;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const imageOptimization = new ImageOptimization();
    await imageOptimization.init();
    imageOptimization.addOptimizationCSS();
    imageOptimization.createPerformanceMonitor();
    
    window.imageOptimization = imageOptimization;
    
    console.log('Image optimization ready:', imageOptimization.getPerformanceMetrics());
});