import React, { useEffect, useState } from 'react';
import { X, Bell, Trophy, Users, Newspaper, Award, Megaphone, AlertTriangle } from 'lucide-react';

export interface ToastNotificationProps {
    id: string;
    title: string;
    message: string;
    category: 'match' | 'league' | 'social' | 'achievement' | 'announcement' | 'alert' | 'system';
    priority: 'high' | 'medium' | 'low';
    onClose: (id: string) => void;
    onClick?: () => void;
    duration?: number; // Auto-dismiss duration in ms (default: 5000)
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
    id,
    title,
    message,
    category,
    priority,
    onClose,
    onClick,
    duration = 5000
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Slide in animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Match animation duration
    };

    const getIcon = () => {
        const iconClass = "w-5 h-5";
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

    const getPriorityStyles = () => {
        switch (priority) {
            case 'high':
                return 'border-red-500/50 bg-red-600/10';
            case 'medium':
                return 'border-purple-500/30 bg-purple-600/10';
            case 'low':
                return 'border-gray-500/20 bg-gray-600/10';
            default:
                return 'border-purple-500/30 bg-purple-600/10';
        }
    };

    return (
        <div
            className={`
        fixed top-4 right-4 z-[100] w-full max-w-sm
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
        >
            <div
                className={`
          glass rounded-2xl border-2 ${getPriorityStyles()}
          p-4 shadow-2xl cursor-pointer
          hover:scale-105 transition-transform
        `}
                onClick={() => {
                    if (onClick) onClick();
                    handleClose();
                }}
            >
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                        {getIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-sm text-white truncate">
                                {title}
                            </h4>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClose();
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Progress bar for auto-dismiss */}
                {duration > 0 && (
                    <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{
                                animation: `shrink ${duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>

            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

export default ToastNotification;
