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
    async addNotification(userId: string, notification: Omit<NotificationItem, 'id' | 'user_id' | 'created_at' | 'read'>): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    read: false
                });

            if (error) {
                console.error('Error adding notification:', error);
                return;
            }

            console.log('📬 Notification added to database:', notification.title);
        } catch (error) {
            console.error('Error adding notification:', error);
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

    /**
     * Archive notification
     */
    async archiveNotification(userId: string, notificationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ archived: true })
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error archiving notification:', error);
            }
        } catch (error) {
            console.error('Error archiving notification:', error);
        }
    }

    /**
     * Unarchive notification
     */
    async unarchiveNotification(userId: string, notificationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ archived: false })
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error unarchiving notification:', error);
            }
        } catch (error) {
            console.error('Error unarchiving notification:', error);
        }
    }

    /**
     * Snooze notification until a specific time
     */
    async snoozeNotification(userId: string, notificationId: string, until: Date): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ snoozed_until: until.toISOString() })
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error snoozing notification:', error);
            }
        } catch (error) {
            console.error('Error snoozing notification:', error);
        }
    }

    /**
     * Batch mark notifications as read
     */
    async batchMarkAsRead(userId: string, notificationIds: string[]): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', notificationIds)
                .eq('user_id', userId);

            if (error) {
                console.error('Error batch marking as read:', error);
            }
        } catch (error) {
            console.error('Error batch marking as read:', error);
        }
    }

    /**
     * Batch delete notifications
     */
    async batchDelete(userId: string, notificationIds: string[]): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .in('id', notificationIds)
                .eq('user_id', userId);

            if (error) {
                console.error('Error batch deleting:', error);
            }
        } catch (error) {
            console.error('Error batch deleting:', error);
        }
    }

    /**
     * Batch archive notifications
     */
    async batchArchive(userId: string, notificationIds: string[]): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ archived: true })
                .in('id', notificationIds)
                .eq('user_id', userId);

            if (error) {
                console.error('Error batch archiving:', error);
            }
        } catch (error) {
            console.error('Error batch archiving:', error);
        }
    }

    /**
     * Search notifications by title or message
     */
    async searchNotifications(userId: string, query: string): Promise<NotificationItem[]> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error searching notifications:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error searching notifications:', error);
            return [];
        }
    }

    /**
     * Get notifications by category
     */
    async getByCategory(userId: string, category: string): Promise<NotificationItem[]> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('category', category)
                .eq('archived', false)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error getting notifications by category:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error getting notifications by category:', error);
            return [];
        }
    }

    /**
     * Get notifications by priority
     */
    async getByPriority(userId: string, priority: string): Promise<NotificationItem[]> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('priority', priority)
                .eq('archived', false)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error getting notifications by priority:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error getting notifications by priority:', error);
            return [];
        }
    }

    /**
     * Get archived notifications
     */
    async getArchived(userId: string): Promise<NotificationItem[]> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('archived', true)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error getting archived notifications:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error getting archived notifications:', error);
            return [];
        }
    }

    /**
     * Get notifications with filters
     */
    async getFiltered(
        userId: string,
        filters: {
            category?: string;
            priority?: string;
            read?: boolean;
            archived?: boolean;
        }
    ): Promise<NotificationItem[]> {
        try {
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId);

            // Apply filters
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.priority) {
                query = query.eq('priority', filters.priority);
            }
            if (filters.read !== undefined) {
                query = query.eq('read', filters.read);
            }
            if (filters.archived !== undefined) {
                query = query.eq('archived', filters.archived);
            } else {
                // Default: don't show archived
                query = query.eq('archived', false);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error getting filtered notifications:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error getting filtered notifications:', error);
            return [];
        }
    }
}

export const notificationStorage = new NotificationStorage();
