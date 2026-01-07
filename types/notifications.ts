/**
 * Enhanced Notification Types
 * Supports the upgraded notification system with priorities, categories, and advanced features
 */

// Notification Priority Levels
export type NotificationPriority = 'high' | 'medium' | 'low';

// Notification Categories
export type NotificationCategory =
    | 'match'        // Match results
    | 'league'       // League updates
    | 'social'       // Friend requests, mentions
    | 'achievement'  // Achievements, milestones
    | 'announcement' // App updates, news
    | 'alert'        // Important alerts, warnings
    | 'system';      // System notifications

// Enhanced Notification Interface (matches database schema)
export interface EnhancedNotification {
    id: string;
    user_id: string;
    type: 'league' | 'match' | 'news' | 'system'; // Legacy field, kept for compatibility
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    message: string;
    read: boolean;
    archived: boolean;
    snoozed_until: string | null;
    metadata: Record<string, any>;
    action_url: string | null;
    action_label: string | null;
    created_at: string;
}

// User Notification Preferences (matches database schema)
export interface NotificationPreferences {
    id: string;
    user_id: string;

    // Notification type toggles
    match_notifications: boolean;
    league_notifications: boolean;
    social_notifications: boolean;
    achievement_notifications: boolean;
    announcement_notifications: boolean;
    alert_notifications: boolean;

    // Delivery preferences
    sound_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;

    // Do Not Disturb settings
    do_not_disturb_enabled: boolean;
    do_not_disturb_start: string; // Time format: "HH:MM:SS"
    do_not_disturb_end: string;   // Time format: "HH:MM:SS"

    // Timestamps
    created_at: string;
    updated_at: string;
}

// Notification Analytics (for tracking engagement)
export interface NotificationAnalytics {
    id: string;
    notification_id: string;
    user_id: string;

    // Event timestamps
    delivered_at: string;
    read_at: string | null;
    clicked_at: string | null;
    dismissed_at: string | null;

    // Metadata
    device_type: 'mobile' | 'tablet' | 'desktop' | null;
}

// Toast Notification Props
export interface ToastNotificationData {
    id: string;
    title: string;
    message: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    action_url?: string;
    action_label?: string;
    duration?: number; // Auto-dismiss duration in ms
}

// Notification Filter Options
export interface NotificationFilters {
    category?: NotificationCategory | 'all';
    priority?: NotificationPriority | 'all';
    read?: boolean | 'all';
    archived?: boolean;
    searchQuery?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

// Notification Group (for grouping similar notifications)
export interface NotificationGroup {
    category: NotificationCategory;
    notifications: EnhancedNotification[];
    count: number;
    latestTimestamp: string;
    isExpanded: boolean;
}

// Batch Action Types
export type NotificationBatchAction =
    | 'mark_read'
    | 'mark_unread'
    | 'delete'
    | 'archive'
    | 'unarchive';

// Notification Sound Types
export type NotificationSoundType =
    | 'new_notification'
    | 'mark_read'
    | 'delete'
    | 'achievement'
    | 'match_winner'
    | 'match_loser'
    | 'championship';

// Helper type for creating notifications
export type CreateNotificationInput = Omit<
    EnhancedNotification,
    'id' | 'user_id' | 'created_at' | 'read' | 'archived'
>;

// Helper type for updating preferences
export type UpdatePreferencesInput = Partial<
    Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;
