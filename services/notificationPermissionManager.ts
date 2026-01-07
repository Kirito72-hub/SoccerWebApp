/**
 * Notification Permission Manager
 * Handles requesting and managing notification permissions for the PWA
 */

export class NotificationPermissionManager {
    /**
     * Request notification permission from the user
     * Shows native browser permission dialog
     */
    static async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return 'denied';
        }

        // If already granted, return immediately
        if (Notification.permission === 'granted') {
            console.log('✅ Notification permission already granted');
            return 'granted';
        }

        // If already denied, can't request again
        if (Notification.permission === 'denied') {
            console.warn('⚠️ Notification permission was previously denied');
            return 'denied';
        }

        try {
            console.log('📱 Requesting notification permission...');
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('✅ Notification permission granted!');
                // Show a welcome notification
                await this.showWelcomeNotification();
            } else {
                console.warn('❌ Notification permission denied');
            }

            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    }

    /**
     * Check if notifications are supported and enabled
     */
    static isSupported(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    /**
     * Get current permission status
     */
    static getPermissionStatus(): NotificationPermission {
        if (!('Notification' in window)) {
            return 'denied';
        }
        return Notification.permission;
    }

    /**
     * Check if permission has been requested before
     */
    static hasRequestedBefore(): boolean {
        return localStorage.getItem('notification_permission_requested') === 'true';
    }

    /**
     * Mark that permission has been requested
     */
    static markAsRequested(): void {
        localStorage.setItem('notification_permission_requested', 'true');
    }

    /**
     * Show a welcome notification after permission is granted
     */
    private static async showWelcomeNotification(): Promise<void> {
        try {
            // Wait for service worker to be ready
            const registration = await navigator.serviceWorker.ready;

            await registration.showNotification('Welcome to Rakla! ⚽', {
                body: 'You\'ll now receive notifications for matches, leagues, and updates!',
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: 'welcome',
                requireInteraction: false,
                data: {
                    url: '/'
                }
            });
        } catch (error) {
            console.error('Error showing welcome notification:', error);
        }
    }

    /**
     * Request permission with a custom dialog first (better UX)
     * Shows explanation before native browser dialog
     */
    static async requestWithDialog(): Promise<NotificationPermission> {
        // Check if already requested
        if (this.hasRequestedBefore()) {
            return this.getPermissionStatus();
        }

        // Show custom explanation dialog
        const userWantsNotifications = window.confirm(
            '🔔 Enable Notifications?\n\n' +
            'Get instant updates for:\n' +
            '• Match results (wins, losses, draws)\n' +
            '• League updates (started, finished)\n' +
            '• Table position changes (every 3 matches)\n' +
            '• Important announcements\n\n' +
            'You can disable this anytime in Settings.'
        );

        // Mark as requested
        this.markAsRequested();

        if (!userWantsNotifications) {
            console.log('User declined notification permission dialog');
            return 'denied';
        }

        // Request actual permission
        return await this.requestPermission();
    }

    /**
     * Check if PWA is installed (running in standalone mode)
     */
    static isPWAInstalled(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true ||
            document.referrer.includes('android-app://');
    }

    /**
     * Register for background sync (keep PWA active)
     */
    static async registerBackgroundSync(): Promise<void> {
        if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
            console.warn('Background Sync not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Register periodic background sync (if supported)
            if ('periodicSync' in registration) {
                try {
                    await (registration as any).periodicSync.register('check-notifications', {
                        minInterval: 60 * 60 * 1000 // 1 hour
                    });
                    console.log('✅ Periodic background sync registered');
                } catch (error) {
                    console.warn('Periodic sync not available:', error);
                }
            }

            console.log('✅ Background sync setup complete');
        } catch (error) {
            console.error('Error registering background sync:', error);
        }
    }

    /**
     * Request persistent storage (prevents data from being cleared)
     */
    static async requestPersistentStorage(): Promise<boolean> {
        if (!('storage' in navigator) || !('persist' in navigator.storage)) {
            console.warn('Persistent storage not supported');
            return false;
        }

        try {
            const isPersisted = await navigator.storage.persist();
            if (isPersisted) {
                console.log('✅ Persistent storage granted');
            } else {
                console.warn('⚠️ Persistent storage denied');
            }
            return isPersisted;
        } catch (error) {
            console.error('Error requesting persistent storage:', error);
            return false;
        }
    }

    /**
     * Full initialization - request all permissions needed for PWA
     */
    static async initializePWA(): Promise<void> {
        console.log('🚀 Initializing PWA features...');

        // 1. Request notification permission
        await this.requestWithDialog();

        // 2. Register background sync
        await this.registerBackgroundSync();

        // 3. Request persistent storage
        await this.requestPersistentStorage();

        console.log('✅ PWA initialization complete');
    }
}

export default NotificationPermissionManager;
