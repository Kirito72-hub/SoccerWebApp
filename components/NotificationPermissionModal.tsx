import React from 'react';
import { Bell, X, Check } from 'lucide-react';

interface NotificationPermissionModalProps {
    onAccept: () => void;
    onDecline: () => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ onAccept, onDecline }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onDecline}
            />

            {/* Modal */}
            <div className="relative glass rounded-3xl border border-purple-500/30 p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                {/* Close button */}
                <button
                    onClick={onDecline}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-purple-600/20 rounded-2xl">
                        <Bell className="w-12 h-12 text-purple-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-center mb-3">
                    Enable Notifications? 🔔
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-center mb-6">
                    Get instant updates for important events
                </p>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="p-1 bg-emerald-600/20 rounded-lg mt-0.5">
                            <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">Match Results</p>
                            <p className="text-xs text-gray-500">Wins, losses, and draws</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="p-1 bg-blue-600/20 rounded-lg mt-0.5">
                            <Check className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">League Updates</p>
                            <p className="text-xs text-gray-500">Started and finished leagues</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="p-1 bg-purple-600/20 rounded-lg mt-0.5">
                            <Check className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">Table Position</p>
                            <p className="text-xs text-gray-500">Every 3 matches</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="p-1 bg-orange-600/20 rounded-lg mt-0.5">
                            <Check className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">Announcements</p>
                            <p className="text-xs text-gray-500">Important updates</p>
                        </div>
                    </div>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500 text-center mb-6">
                    You can disable this anytime in Settings
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-4 py-3 glass border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 px-4 py-3 bg-purple-600 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 hover:bg-purple-500 transition-all"
                    >
                        Enable
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPermissionModal;
