// =====================================================
// RAKLA PWA SERVICE WORKER - AGGRESSIVE CACHE BUSTING
// =====================================================
// This service worker implements an aggressive cache-busting strategy
// to ensure users always get the latest version without manual intervention.
//
// Strategy:
// 1. Dynamic cache versioning based on file modification time
// 2. Network-First for HTML/JS files (always fresh when online)
// 3. Cache-First for static assets (images, fonts)
// 4. Automatic old cache deletion on activation
// 5. Immediate activation (skipWaiting) for instant updates
// =====================================================

// Dynamic cache version - will be updated automatically on each deployment
// The timestamp ensures old caches are invalidated
const CACHE_VERSION = 'v1.7.0-beta';
const CACHE_NAME = `rakla-pwa-${CACHE_VERSION}-${Date.now()}`;

// Cache names for different types of content
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// Static assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Maximum cache sizes to prevent storage bloat
const MAX_CACHE_SIZE = {
    static: 50,
    dynamic: 100,
    images: 60
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Limit cache size by removing oldest entries
 */
const limitCacheSize = async (cacheName, maxSize) => {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxSize) {
        // Delete oldest entries (FIFO)
        const deleteCount = keys.length - maxSize;
        for (let i = 0; i < deleteCount; i++) {
            await cache.delete(keys[i]);
        }
        console.log(`🗑️ Cleaned ${deleteCount} old entries from ${cacheName}`);
    }
};

/**
 * Delete all old caches except current ones
 */
const deleteOldCaches = async () => {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];

    const deletionPromises = cacheNames
        .filter(cacheName => !currentCaches.includes(cacheName))
        .map(cacheName => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
        });

    await Promise.all(deletionPromises);
    console.log('✅ All old caches deleted!');
};

// =====================================================
// INSTALL EVENT - Cache static assets
// =====================================================
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...', CACHE_NAME);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Static assets cached successfully');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache static assets:', error);
            })
    );
});

// =====================================================
// ACTIVATE EVENT - Clean up old caches
// =====================================================
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activating...', CACHE_NAME);

    event.waitUntil(
        deleteOldCaches()
            .then(() => {
                console.log('✅ Service Worker activated!');
                // Take control of all clients immediately
                return self.clients.claim();
            })
            .then(() => {
                // Notify all clients that a new version is active
                return self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SW_ACTIVATED',
                            version: CACHE_VERSION,
                            timestamp: Date.now()
                        });
                    });
                });
            })
    );
});

// =====================================================
// FETCH EVENT - Network-First for HTML/JS, Cache-First for assets
// =====================================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    // Skip API requests (always go to network)
    if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
        return;
    }

    // Determine caching strategy based on request type
    if (request.destination === 'image') {
        // Cache-First for images
        event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    } else if (
        request.destination === 'document' ||
        request.destination === 'script' ||
        request.destination === 'style' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css')
    ) {
        // Network-First for HTML/JS/CSS (ensures fresh content)
        event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    } else {
        // Cache-First for other static assets
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    }
});

// =====================================================
// CACHING STRATEGIES
// =====================================================

/**
 * Network-First Strategy
 * Try network first, fall back to cache if offline
 * Perfect for HTML/JS/CSS that should always be fresh
 */
const networkFirstStrategy = async (request, cacheName) => {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());

            // Limit cache size
            limitCacheSize(cacheName, MAX_CACHE_SIZE.dynamic);
        }

        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        console.log('📡 Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('✅ Serving from cache:', request.url);
            return cachedResponse;
        }

        // Both failed
        console.error('❌ Both network and cache failed:', request.url);
        throw error;
    }
};

/**
 * Cache-First Strategy
 * Try cache first, fall back to network if not cached
 * Perfect for images and static assets that don't change often
 */
const cacheFirstStrategy = async (request, cacheName) => {
    // Try cache first
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    // Not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());

            // Limit cache size based on cache type
            const maxSize = cacheName.includes('images')
                ? MAX_CACHE_SIZE.images
                : MAX_CACHE_SIZE.static;
            limitCacheSize(cacheName, maxSize);
        }

        return networkResponse;
    } catch (error) {
        console.error('❌ Failed to fetch:', request.url, error);
        throw error;
    }
};

// =====================================================
// MESSAGE HANDLER - Handle messages from main thread
// =====================================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Handle notification requests
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;

        const notificationOptions = {
            ...options,
            icon: options.icon || '/icons/pwa-192x192.png',
            badge: options.badge || '/icons/pwa-192x192.png',
            vibrate: options.vibrate || [200, 100, 200, 100, 200],
            requireInteraction: true,
            silent: false,
            renotify: true
        };

        event.waitUntil(
            self.registration.showNotification(title, notificationOptions)
        );
    }

    // Handle cache clear request
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('✅ All caches cleared!');
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// =====================================================
// PUSH NOTIFICATION HANDLER
// =====================================================
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body,
        icon: '/icons/pwa-192x192.png',
        badge: '/icons/pwa-192x192.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        silent: false,
        tag: data.tag || 'notification',
        renotify: true,
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'view', title: 'View' },
            { action: 'close', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// =====================================================
// NOTIFICATION CLICK HANDLER
// =====================================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

console.log('🚀 Rakla Service Worker loaded!', CACHE_NAME);
