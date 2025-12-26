const CACHE_NAME = 'rakla-pwa-v1.5.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
    // Removed /icons/icon.svg - file doesn't exist and was causing SW to fail
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Don't skip waiting automatically - let the user decide via update prompt
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Handle notification requests from main thread
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        console.log('🔔 Service Worker received SHOW_NOTIFICATION message');
        console.log('  - Title:', event.data.title);
        console.log('  - Permission:', Notification.permission);

        const { title, options } = event.data;

        // Enhanced options for Android
        const notificationOptions = {
            ...options,
            icon: options.icon || '/icons/pwa-192x192.png',
            badge: options.badge || '/icons/pwa-192x192.png',
            vibrate: options.vibrate || [200, 100, 200, 100, 200],
            requireInteraction: true,
            silent: false,
            renotify: true
        };

        console.log('📱 Showing notification with options:', notificationOptions);

        event.waitUntil(
            self.registration.showNotification(title, notificationOptions)
                .then(() => {
                    console.log('✅ Notification shown successfully!');
                })
                .catch((error) => {
                    console.error('❌ Failed to show notification:', error);
                })
        );
    }
});

// Activate event - cleanup old caches AGGRESSIVELY
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activating - clearing old caches...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Old caches cleared! New version active.');
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip API requests (let them go to network)
    if (event.request.url.includes('/rest/v1/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if found
            if (response) {
                return response;
            }

            // Otherwise fetch from network
            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone response to cache it
                const responseToCache = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});

// Push notification event - Enhanced for Android
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    // Enhanced notification options for Android
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
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'close',
                title: 'Dismiss'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
