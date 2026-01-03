/**
 * Notification Preferences Service
 * Manages user notification settings and preferences
 */

import { supabase } from './supabase';
import { NotificationPreferences, NotificationCategory } from '../types/notifications';

class NotificationPreferencesService {
    /**
     * Get user notification preferences
     * Creates default preferences if they don't exist
     */
    async getPreferences(userId: string): Promise<NotificationPreferences | null> {
        try {
            const { data, error } = await supabase
                .from('user_notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                // If preferences don't exist, create defaults
                if (error.code === 'PGRST116') {
                    return await this.createDefaultPreferences(userId);
                }
                console.error('Error getting preferences:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error getting preferences:', error);
            return null;
        }
    }

    /**
     * Create default preferences for a new user
     */
    async createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
        try {
            const defaultPrefs = {
                user_id: userId,
                match_notifications: true,
                league_notifications: true,
                social_notifications: true,
                achievement_notifications: true,
                announcement_notifications: true,
                alert_notifications: true,
                sound_enabled: true,
                email_notifications: false,
                push_notifications: true,
                do_not_disturb_enabled: false,
                do_not_disturb_start: '22:00:00',
                do_not_disturb_end: '08:00:00'
            };

            const { data, error } = await supabase
                .from('user_notification_preferences')
                .insert(defaultPrefs)
                .select()
                .single();

            if (error) {
                console.error('Error creating default preferences:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error creating default preferences:', error);
            return null;
        }
    }

    /**
     * Update user notification preferences
     */
    async updatePreferences(
        userId: string,
        updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_notification_preferences')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating preferences:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error updating preferences:', error);
            return false;
        }
    }

    /**
     * Check if a specific notification category is allowed for a user
     */
    async isNotificationAllowed(userId: string, category: NotificationCategory): Promise<boolean> {
        try {
            const prefs = await this.getPreferences(userId);
            if (!prefs) return true; // Default to allowing if no preferences

            // Map category to preference field
            switch (category) {
                case 'match':
                    return prefs.match_notifications;
                case 'league':
                    return prefs.league_notifications;
                case 'social':
                    return prefs.social_notifications;
                case 'achievement':
                    return prefs.achievement_notifications;
                case 'announcement':
                    return prefs.announcement_notifications;
                case 'alert':
                    return prefs.alert_notifications;
                case 'system':
                    return true; // System notifications always allowed
                default:
                    return true;
            }
        } catch (error) {
            console.error('Error checking notification permission:', error);
            return true; // Default to allowing on error
        }
    }

    /**
     * Check if user is currently in Do Not Disturb mode
     */
    async isInDoNotDisturb(userId: string): Promise<boolean> {
        try {
            const prefs = await this.getPreferences(userId);
            if (!prefs || !prefs.do_not_disturb_enabled) {
                return false;
            }

            const now = new Date();
            const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

            const startTime = prefs.do_not_disturb_start;
            const endTime = prefs.do_not_disturb_end;

            // Handle overnight DND (e.g., 22:00 to 08:00)
            if (startTime > endTime) {
                return currentTime >= startTime || currentTime < endTime;
            }

            // Handle same-day DND (e.g., 12:00 to 14:00)
            return currentTime >= startTime && currentTime < endTime;
        } catch (error) {
            console.error('Error checking Do Not Disturb:', error);
            return false;
        }
    }

    /**
     * Toggle sound notifications
     */
    async toggleSound(userId: string, enabled: boolean): Promise<boolean> {
        return await this.updatePreferences(userId, { sound_enabled: enabled });
    }

    /**
     * Toggle email notifications
     */
    async toggleEmail(userId: string, enabled: boolean): Promise<boolean> {
        return await this.updatePreferences(userId, { email_notifications: enabled });
    }

    /**
     * Toggle push notifications
     */
    async togglePush(userId: string, enabled: boolean): Promise<boolean> {
        return await this.updatePreferences(userId, { push_notifications: enabled });
    }

    /**
     * Toggle Do Not Disturb mode
     */
    async toggleDoNotDisturb(userId: string, enabled: boolean): Promise<boolean> {
        return await this.updatePreferences(userId, { do_not_disturb_enabled: enabled });
    }

    /**
     * Set Do Not Disturb hours
     */
    async setDoNotDisturbHours(userId: string, startTime: string, endTime: string): Promise<boolean> {
        return await this.updatePreferences(userId, {
            do_not_disturb_start: startTime,
            do_not_disturb_end: endTime
        });
    }

    /**
     * Toggle specific notification category
     */
    async toggleCategory(userId: string, category: NotificationCategory, enabled: boolean): Promise<boolean> {
        const updates: any = {};

        switch (category) {
            case 'match':
                updates.match_notifications = enabled;
                break;
            case 'league':
                updates.league_notifications = enabled;
                break;
            case 'social':
                updates.social_notifications = enabled;
                break;
            case 'achievement':
                updates.achievement_notifications = enabled;
                break;
            case 'announcement':
                updates.announcement_notifications = enabled;
                break;
            case 'alert':
                updates.alert_notifications = enabled;
                break;
            default:
                return false;
        }

        return await this.updatePreferences(userId, updates);
    }

    /**
     * Reset preferences to defaults
     */
    async resetToDefaults(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_notification_preferences')
                .update({
                    match_notifications: true,
                    league_notifications: true,
                    social_notifications: true,
                    achievement_notifications: true,
                    announcement_notifications: true,
                    alert_notifications: true,
                    sound_enabled: true,
                    email_notifications: false,
                    push_notifications: true,
                    do_not_disturb_enabled: false,
                    do_not_disturb_start: '22:00:00',
                    do_not_disturb_end: '08:00:00',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error resetting preferences:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error resetting preferences:', error);
            return false;
        }
    }

    /**
     * Check if sound is enabled
     */
    async isSoundEnabled(userId: string): Promise<boolean> {
        const prefs = await this.getPreferences(userId);
        return prefs?.sound_enabled ?? true;
    }

    /**
     * Get all enabled categories for a user
     */
    async getEnabledCategories(userId: string): Promise<NotificationCategory[]> {
        const prefs = await this.getPreferences(userId);
        if (!prefs) return ['match', 'league', 'social', 'achievement', 'announcement', 'alert', 'system'];

        const enabled: NotificationCategory[] = [];

        if (prefs.match_notifications) enabled.push('match');
        if (prefs.league_notifications) enabled.push('league');
        if (prefs.social_notifications) enabled.push('social');
        if (prefs.achievement_notifications) enabled.push('achievement');
        if (prefs.announcement_notifications) enabled.push('announcement');
        if (prefs.alert_notifications) enabled.push('alert');
        enabled.push('system'); // Always include system

        return enabled;
    }
}

export const notificationPreferences = new NotificationPreferencesService();
