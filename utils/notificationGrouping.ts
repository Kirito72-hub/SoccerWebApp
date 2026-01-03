/**
 * Notification Grouping Utilities
 * Groups similar notifications for better organization
 */

import { EnhancedNotification, NotificationGroup, NotificationCategory } from '../types/notifications';

/**
 * Group notifications by category
 */
export const groupNotificationsByCategory = (
    notifications: EnhancedNotification[]
): NotificationGroup[] => {
    const groups = new Map<NotificationCategory, EnhancedNotification[]>();

    // Group notifications
    notifications.forEach(notification => {
        const category = notification.category || 'system';
        if (!groups.has(category)) {
            groups.set(category, []);
        }
        groups.get(category)!.push(notification);
    });

    // Convert to NotificationGroup array
    const groupArray: NotificationGroup[] = [];
    groups.forEach((notifs, category) => {
        if (notifs.length > 0) {
            groupArray.push({
                category,
                notifications: notifs,
                count: notifs.length,
                latestTimestamp: notifs[0].created_at,
                isExpanded: false
            });
        }
    });

    // Sort by latest timestamp
    return groupArray.sort((a, b) =>
        new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    );
};

/**
 * Group similar notifications (same title within 1 hour)
 */
export const groupSimilarNotifications = (
    notifications: EnhancedNotification[]
): NotificationGroup[] => {
    const groups: NotificationGroup[] = [];
    const processed = new Set<string>();

    notifications.forEach(notification => {
        if (processed.has(notification.id)) return;

        // Find similar notifications
        const similar = notifications.filter(n => {
            if (processed.has(n.id)) return false;
            if (n.title !== notification.title) return false;

            // Check if within 1 hour
            const timeDiff = Math.abs(
                new Date(n.created_at).getTime() - new Date(notification.created_at).getTime()
            );
            return timeDiff < 3600000; // 1 hour in milliseconds
        });

        // Mark as processed
        similar.forEach(n => processed.add(n.id));

        // Create group if multiple similar notifications
        if (similar.length > 1) {
            groups.push({
                category: notification.category,
                notifications: similar,
                count: similar.length,
                latestTimestamp: similar[0].created_at,
                isExpanded: false
            });
        } else {
            // Single notification as its own group
            groups.push({
                category: notification.category,
                notifications: [notification],
                count: 1,
                latestTimestamp: notification.created_at,
                isExpanded: true // Always expanded for single items
            });
        }
    });

    return groups;
};

/**
 * Check if notifications should be grouped
 */
export const shouldGroupNotifications = (notifications: EnhancedNotification[]): boolean => {
    // Group if more than 10 notifications
    if (notifications.length > 10) return true;

    // Group if there are many similar titles
    const titles = new Set(notifications.map(n => n.title));
    return titles.size < notifications.length * 0.7; // If 30%+ are duplicates
};

/**
 * Get group title
 */
export const getGroupTitle = (group: NotificationGroup): string => {
    if (group.count === 1) {
        return group.notifications[0].title;
    }

    const categoryNames: Record<NotificationCategory, string> = {
        match: 'Match Results',
        league: 'League Updates',
        social: 'Social Notifications',
        achievement: 'Achievements',
        announcement: 'Announcements',
        alert: 'Alerts',
        system: 'System Notifications'
    };

    return `${group.count} ${categoryNames[group.category] || 'Notifications'}`;
};

/**
 * Get group summary
 */
export const getGroupSummary = (group: NotificationGroup): string => {
    if (group.count === 1) {
        return group.notifications[0].message;
    }

    const unreadCount = group.notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        return `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`;
    }

    return `All notifications read`;
};
