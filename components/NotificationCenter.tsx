import React, { useState, useEffect } from 'react';
import { X, Bell, Trophy, Users, Newspaper, CheckCircle, Trash2 } from 'lucide-react';
import { notificationStorage, NotificationItem } from '../services/notificationStorage';

interface NotificationCenterProps {
    userId: string;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onClose }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    const loadNotifications = () => {
        const notifs = notificationStorage.getNotifications(userId);
        setNotifications(notifs);
    };

    const handleMarkAsRead = (notificationId: string) => {
        notificationStorage.markAsRead(userId, notificationId);
        loadNotifications();
    };

    const handleMarkAllAsRead = () => {
        notificationStorage.markAllAsRead(userId);
        loadNotifications();
    };

    const handleDelete = (notificationId: string) => {
        notificationStorage.deleteNotification(userId, notificationId);
        loadNotifications();
    };

    const handleClearAll = () => {
        if (confirm('Clear all notifications?')) {
            notificationStorage.clearAll(userId);
            loadNotifications();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'match':
                return <Trophy className="w-5 h-5 text-emerald-400" />;
            case 'league':
                return <Users className="w-5 h-5 text-purple-400" />;
            case 'news':
                return <Newspaper className="w-5 h-5 text-blue-400" />;
            default:
                return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
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
                                {notifications.filter(n => !n.read).length} unread
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                            <>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="px-3 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-600/10 rounded-lg transition-all"
                                >
                                    Mark all read
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all"
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

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No notifications yet</p>
                            <p className="text-xs text-gray-600 mt-2">
                                You'll see match results, league updates, and news here
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-xl border transition-all group ${notification.read
                                        ? 'bg-white/5 border-white/5'
                                        : 'bg-purple-600/10 border-purple-500/30'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${notification.read ? 'bg-white/5' : 'bg-white/10'
                                        }`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={`font-bold text-sm ${notification.read ? 'text-gray-400' : 'text-white'
                                                }`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-[10px] text-gray-600 whitespace-nowrap">
                                                {formatTime(notification.timestamp)}
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-1 ${notification.read ? 'text-gray-600' : 'text-gray-400'
                                            }`}>
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-purple-400 hover:bg-purple-600/10 rounded transition-all"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Mark read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 hover:text-red-400 hover:bg-red-600/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
