/**
 * Notification Storage Service
 * Manages in-app notification history
 */

export interface NotificationItem {
    id: string;
    type: 'league' | 'match' | 'news' | 'system';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    icon?: string;
}

class NotificationStorage {
    private readonly STORAGE_KEY = 'rakla_notifications';
    private readonly MAX_NOTIFICATIONS = 50; // Keep last 50 notifications

    /**
     * Get all notifications for current user
     */
    getNotifications(userId: string): NotificationItem[] {
        try {
            const key = `${this.STORAGE_KEY}_${userId}`;
            const stored = localStorage.getItem(key);
            if (!stored) return [];

            const notifications = JSON.parse(stored) as NotificationItem[];
            // Sort by timestamp (newest first)
            return notifications.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error loading notifications:', error);
            return [];
        }
    }

    /**
     * Add a new notification
     */
    addNotification(userId: string, notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
        try {
            const notifications = this.getNotifications(userId);

            const newNotification: NotificationItem = {
                ...notification,
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                read: false
            };

            // Add to beginning of array
            notifications.unshift(newNotification);

            // Keep only last MAX_NOTIFICATIONS
            const trimmed = notifications.slice(0, this.MAX_NOTIFICATIONS);

            // Save
            const key = `${this.STORAGE_KEY}_${userId}`;
            localStorage.setItem(key, JSON.stringify(trimmed));

            console.log('📬 Notification added:', newNotification);
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    }

    /**
     * Mark notification as read
     */
    markAsRead(userId: string, notificationId: string): void {
        try {
            const notifications = this.getNotifications(userId);
            const updated = notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            );

            const key = `${this.STORAGE_KEY}_${userId}`;
            localStorage.setItem(key, JSON.stringify(updated));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(userId: string): void {
        try {
            const notifications = this.getNotifications(userId);
            const updated = notifications.map(n => ({ ...n, read: true }));

            const key = `${this.STORAGE_KEY}_${userId}`;
            localStorage.setItem(key, JSON.stringify(updated));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    /**
     * Get unread count
     */
    getUnreadCount(userId: string): number {
        const notifications = this.getNotifications(userId);
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Clear all notifications
     */
    clearAll(userId: string): void {
        try {
            const key = `${this.STORAGE_KEY}_${userId}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }

    /**
     * Delete specific notification
     */
    deleteNotification(userId: string, notificationId: string): void {
        try {
            const notifications = this.getNotifications(userId);
            const filtered = notifications.filter(n => n.id !== notificationId);

            const key = `${this.STORAGE_KEY}_${userId}`;
            localStorage.setItem(key, JSON.stringify(filtered));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }
}

export const notificationStorage = new NotificationStorage();
