// Service Worker for Precision HVAC NorCal Website
// Provides caching for better performance and offline functionality

const CACHE_NAME = 'precision-hvac-v1.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manual-j-assessment.html',
    '/css/styles.css',
    '/css/mobile-fixes.css',
    '/css/manual-j.css',
    '/js/script.js',
    '/js/ui-fixes.js',
    '/js/manual-j-calculator.js',
    '/js/manual-j-interface.js',
    '/js/performance-optimizations.js',
    '/favicon.ico',
    // Cache some images
    '/images/heat-pump-exterior.jpg',
    '/images/heat-pump-installation.jpg',
    '/images/comfortable-home.jpg',
    '/images/electrification-plan.jpg'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', function(event) {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip caching for external resources
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(function(response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response as it can only be consumed once
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Background sync for form submissions (when network is available)
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // Handle offline form submissions when network is restored
    }
});

// Push notification support (for future enhancements)
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
    };
    
    event.waitUntil(
        self.registration.showNotification('Precision HVAC NorCal', options)
    );
});