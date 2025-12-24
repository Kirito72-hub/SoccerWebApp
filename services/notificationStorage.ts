/**
 * Notification Storage Service
 * Manages notifications in Supabase for cross-device sync
 */

import { supabase } from './supabase';

export interface NotificationItem {
    id: string;
    user_id: string;
    type: 'league' | 'match' | 'news' | 'system';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

class NotificationStorage {
    /**
     * Get all notifications for current user from Supabase
     */
    async getNotifications(userId: string): Promise<NotificationItem[]> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error loading notifications:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            return [];
        }
    }

    /**
     * Add a new notification to Supabase
     */
    async addNotification(userId: string, notification: Omit<NotificationItem, 'id' | 'user_id' | 'created_at' | 'read'>): Promise<NotificationItem | null> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    read: false
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding notification:', error);
                return null;
            }

            console.log('📬 Notification added to database:', notification.title);
            return data as NotificationItem;
        } catch (error) {
            console.error('Error adding notification:', error);
            return null;
        }
    }

    /**
     * Mark notification as read in Supabase
     */
    async markAsRead(userId: string, notificationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error marking notification as read:', error);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read in Supabase
     */
    async markAllAsRead(userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) {
                console.error('Error marking all as read:', error);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    /**
     * Get unread count from Supabase
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) {
                console.error('Error getting unread count:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * Clear all notifications from Supabase
     */
    async clearAll(userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error clearing notifications:', error);
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }

    /**
     * Delete specific notification from Supabase
     */
    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting notification:', error);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }
}

export const notificationStorage = new NotificationStorage();
