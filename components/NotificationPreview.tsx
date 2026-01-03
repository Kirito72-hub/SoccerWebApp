import React from 'react';
import { Bell, Trophy, Users, Newspaper, Award, Megaphone, AlertTriangle, CheckCircle } from 'lucide-react';
import { EnhancedNotification } from '../types/notifications';

interface NotificationPreviewProps {
    notifications: EnhancedNotification[];
    onViewAll: () => void;
    onMarkAsRead: (id: string) => void;
    isOpen: boolean;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
    notifications,
    onViewAll,
    onMarkAsRead,
    isOpen
}) => {
    if (!isOpen) return null;

    const getIcon = (category: string) => {
        const iconClass = "w-4 h-4";
        switch (category) {
            case 'match':
                return <Trophy className={`${iconClass} text-emerald-400`} />;
            case 'league':
                return <Users className={`${iconClass} text-purple-400`} />;
            case 'social':
                return <Users className={`${iconClass} text-blue-400`} />;
            case 'achievement':
                return <Award className={`${iconClass} text-yellow-400`} />;
            case 'announcement':
                return <Megaphone className={`${iconClass} text-indigo-400`} />;
            case 'alert':
                return <AlertTriangle className={`${iconClass} text-red-400`} />;
            default:
                return <Bell className={`${iconClass} text-gray-400`} />;
        }
    };

    const formatTime = (created_at: string) => {
        const now = Date.now();
        const timestamp = new Date(created_at).getTime();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    // Show only last 3 unread notifications
    const previewNotifications = notifications
        .filter(n => !n.read)
        .slice(0, 3);

    return (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="glass rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-sm">Recent Notifications</h3>
                        <span className="text-xs text-gray-500">
                            {previewNotifications.length} unread
                        </span>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {previewNotifications.length === 0 ? (
                        <div className="p-6 text-center">
                            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 font-bold">All caught up!</p>
                            <p className="text-xs text-gray-600 mt-1">No new notifications</p>
                        </div>
                    ) : (
                        previewNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-start gap-2">
                                    {/* Icon */}
                                    <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                                        {getIcon(notification.category)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-bold text-xs text-white truncate">
                                                {notification.title}
                                            </h4>
                                            <span className="text-[10px] text-gray-600 whitespace-nowrap">
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>

                                        {/* Quick action */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMarkAsRead(notification.id);
                                            }}
                                            className="flex items-center gap-1 mt-2 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <CheckCircle className="w-3 h-3" />
                                            Mark as read
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/10 bg-white/5">
                    <button
                        onClick={onViewAll}
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-xs text-white transition-colors"
                    >
                        View All Notifications
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreview;
