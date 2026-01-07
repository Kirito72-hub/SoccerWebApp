import React, { useState, useEffect } from 'react';
import {
    X, Bell, Trophy, Users, Newspaper, CheckCircle, Trash2, CheckCheck,
    Search, Archive, ArchiveRestore, Award, Megaphone, AlertTriangle,
    Clock, Filter, MoreVertical
} from 'lucide-react';
import { notificationStorage, NotificationItem } from '../services/notificationStorage';
import { supabase } from '../services/supabase';
import { NotificationCategory } from '../types/notifications';
import NotificationFilters from './NotificationFilters';
import { useSwipe } from '../hooks/useSwipe';
import SwipeableNotificationItem from './SwipeableNotificationItem';

interface NotificationCenterProps {
    userId: string;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onClose }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<NotificationCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();

        // Subscribe to Realtime updates
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('📬 Notification Realtime update:', payload);
                    loadNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Apply filters whenever notifications, filter, or search changes
    useEffect(() => {
        applyFilters();
    }, [notifications, activeFilter, searchQuery, showArchived]);

    const loadNotifications = async () => {
        setLoading(true);
        let notifs: NotificationItem[];

        if (showArchived) {
            notifs = await notificationStorage.getArchived(userId);
        } else {
            notifs = await notificationStorage.getNotifications(userId);
        }

        setNotifications(notifs);
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...notifications];

        // Apply category filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(n => n.category === activeFilter || n.type === activeFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.message.toLowerCase().includes(query)
            );
        }

        setFilteredNotifications(filtered);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await notificationStorage.markAsRead(userId, notificationId);
        await loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await notificationStorage.markAllAsRead(userId);
        await loadNotifications();
    };

    const handleDelete = async (notificationId: string) => {
        await notificationStorage.deleteNotification(userId, notificationId);
        await loadNotifications();
    };

    const handleClearAll = async () => {
        if (confirm('Clear all notifications?')) {
            await notificationStorage.clearAll(userId);
            await loadNotifications();
        }
    };

    const handleArchive = async (notificationId: string) => {
        await notificationStorage.archiveNotification(userId, notificationId);
        await loadNotifications();
    };

    const handleUnarchive = async (notificationId: string) => {
        await notificationStorage.unarchiveNotification(userId, notificationId);
        await loadNotifications();
    };



    const getIcon = (type: string, category?: string) => {
        const cat = category || type;
        switch (cat) {
            case 'match':
                return <Trophy className="w-5 h-5 text-emerald-400" />;
            case 'league':
                return <Users className="w-5 h-5 text-purple-400" />;
            case 'social':
                return <Users className="w-5 h-5 text-blue-400" />;
            case 'achievement':
                return <Award className="w-5 h-5 text-yellow-400" />;
            case 'announcement':
            case 'news':
                return <Megaphone className="w-5 h-5 text-indigo-400" />;
            case 'alert':
                return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default:
                return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatTime = (created_at: string) => {
        const now = Date.now();
        const timestamp = new Date(created_at).getTime();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    // Calculate counts for filters
    const filterCounts = {
        all: notifications.filter(n => !n.archived).length,
        match: notifications.filter(n => (n.category === 'match' || n.type === 'match') && !n.archived).length,
        league: notifications.filter(n => (n.category === 'league' || n.type === 'league') && !n.archived).length,
        social: notifications.filter(n => n.category === 'social' && !n.archived).length,
        achievement: notifications.filter(n => n.category === 'achievement' && !n.archived).length,
        announcement: notifications.filter(n => (n.category === 'announcement' || n.type === 'news') && !n.archived).length,
        alert: notifications.filter(n => n.category === 'alert' && !n.archived).length
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass rounded-3xl border border-purple-500/30 w-full max-w-2xl mt-20 max-h-[80vh] flex flex-col animate-in slide-in-from-top duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600/20 rounded-xl">
                            <Bell className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">Notifications</h2>
                            <p className="text-xs text-gray-500">
                                {filteredNotifications.filter(n => !n.read).length} unread
                                {showArchived && ' (archived)'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Archive Toggle */}
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`p-2 rounded-lg transition-all ${showArchived
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-500 hover:bg-white/10 hover:text-white'
                                }`}
                            title={showArchived ? 'Show active' : 'Show archived'}
                        >
                            <Archive className="w-4 h-4" />
                        </button>

                        {!showArchived && filteredNotifications.length > 0 && (
                            <>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="p-2 text-purple-400 hover:bg-purple-600/10 rounded-lg transition-all"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all"
                                    title="Clear all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {!showArchived && (
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                )}

                {/* Filters */}
                {!showArchived && (
                    <div className="px-4 pt-4 border-b border-white/10">
                        <NotificationFilters
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                            counts={filterCounts}
                        />
                    </div>
                )}



                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                            <p className="text-gray-500 font-bold">Loading...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">
                                {searchQuery ? 'No matching notifications' : showArchived ? 'No archived notifications' : 'No notifications yet'}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                                {searchQuery ? 'Try a different search term' : showArchived ? 'Archived notifications will appear here' : "You'll see match results, league updates, and news here"}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <SwipeableNotificationItem
                                key={notification.id}
                                notification={notification}
                                isSelected={false}
                                showArchived={showArchived}
                                batchMode={false}
                                onToggleSelect={() => { }}
                                onMarkAsRead={() => handleMarkAsRead(notification.id)}
                                onArchive={() => handleArchive(notification.id)}
                                onUnarchive={() => handleUnarchive(notification.id)}
                                onDelete={() => handleDelete(notification.id)}
                                getIcon={getIcon}
                                formatTime={formatTime}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
