import React, { useState } from 'react';
import { CheckCircle, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { NotificationItem } from '../services/notificationStorage';
import { useSwipe } from '../hooks/useSwipe';

interface SwipeableNotificationItemProps {
    notification: NotificationItem;
    isSelected: boolean;
    showArchived: boolean;
    batchMode: boolean;
    onToggleSelect: () => void;
    onMarkAsRead: () => void;
    onArchive: () => void;
    onUnarchive: () => void;
    onDelete: () => void;
    getIcon: (type: string, category?: string) => React.ReactNode;
    formatTime: (created_at: string) => string;
}

const SwipeableNotificationItem: React.FC<SwipeableNotificationItemProps> = ({
    notification,
    isSelected,
    showArchived,
    batchMode,
    onToggleSelect,
    onMarkAsRead,
    onArchive,
    onUnarchive,
    onDelete,
    getIcon,
    formatTime
}) => {
    const [swipeAction, setSwipeAction] = useState<'delete' | 'action' | null>(null);

    const swipeHandlers = useSwipe({
        onSwipeLeft: () => {
            // Swipe left = Delete
            setSwipeAction('delete');
            setTimeout(() => {
                onDelete();
                setSwipeAction(null);
            }, 300);
        },
        onSwipeRight: () => {
            // Swipe right = Mark as Read or Archive
            if (!showArchived) {
                setSwipeAction('action');
                setTimeout(() => {
                    if (!notification.read) {
                        onMarkAsRead();
                    } else {
                        onArchive();
                    }
                    setSwipeAction(null);
                }, 300);
            }
        },
        minSwipeDistance: 80
    });

    return (
        <div
            {...swipeHandlers}
            className={`relative overflow-hidden rounded-xl transition-all duration-300 ${swipeAction === 'delete' ? 'translate-x-[-100%] opacity-0' :
                    swipeAction === 'action' ? 'translate-x-[100%] opacity-0' : ''
                }`}
        >
            {/* Swipe Action Background - Delete (Left) */}
            {swipeAction === 'delete' && (
                <div className="absolute inset-0 flex items-center justify-end pr-6 bg-red-600/30 rounded-xl animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-400" />
                        <span className="text-sm font-bold text-red-400">Deleting...</span>
                    </div>
                </div>
            )}

            {/* Swipe Action Background - Action (Right) */}
            {swipeAction === 'action' && (
                <div className="absolute inset-0 flex items-center justify-start pl-6 bg-blue-600/30 rounded-xl animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        {!notification.read ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-bold text-blue-400">Marking as read...</span>
                            </>
                        ) : (
                            <>
                                <Archive className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-bold text-blue-400">Archiving...</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Content */}
            <div
                className={`p-4 border transition-all group ${notification.read
                    ? 'bg-white/5 border-white/5'
                    : 'bg-purple-600/10 border-purple-500/30'
                    } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
            >
                <div className="flex items-start gap-3">
                    {/* Checkbox (batch mode) */}
                    {batchMode && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-purple-600"
                        />
                    )}

                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${notification.read ? 'bg-white/5' : 'bg-white/10'}`}>
                        {getIcon(notification.type, notification.category)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-bold text-sm ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                                {notification.title}
                            </h3>
                            <span className="text-[10px] text-gray-600 whitespace-nowrap">
                                {formatTime(notification.created_at)}
                            </span>
                        </div>
                        <p className={`text-xs mt-1 ${notification.read ? 'text-gray-600' : 'text-gray-400'}`}>
                            {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                            {!notification.read && !showArchived && (
                                <button
                                    onClick={onMarkAsRead}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-purple-400 hover:bg-purple-600/10 rounded transition-all"
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    Mark read
                                </button>
                            )}
                            {!showArchived ? (
                                <button
                                    onClick={onArchive}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 hover:text-blue-400 hover:bg-blue-600/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Archive className="w-3 h-3" />
                                    Archive
                                </button>
                            ) : (
                                <button
                                    onClick={onUnarchive}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-400 hover:bg-blue-600/10 rounded transition-all"
                                >
                                    <ArchiveRestore className="w-3 h-3" />
                                    Restore
                                </button>
                            )}
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 hover:text-red-400 hover:bg-red-600/10 rounded transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete
                            </button>
                        </div>

                        {/* Swipe Hint (Mobile Only) */}
                        <div className="md:hidden mt-2 text-[9px] text-gray-600 italic">
                            Swipe left to delete, right to {!notification.read ? 'mark as read' : 'archive'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SwipeableNotificationItem;
