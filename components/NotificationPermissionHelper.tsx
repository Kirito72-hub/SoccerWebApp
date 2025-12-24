import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Settings as SettingsIcon } from 'lucide-react';

/**
 * Notification Permission Helper
 * Guides users through enabling notifications on Android/iOS
 */

interface NotificationHelperProps {
    onClose: () => void;
}

const NotificationPermissionHelper: React.FC<NotificationHelperProps> = ({ onClose }) => {
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
    const [isPWA, setIsPWA] = useState(false);
    const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');

    useEffect(() => {
        // Check permission
        if ('Notification' in window) {
            setPermissionStatus(Notification.permission);
        }

        // Check if PWA
        const isPWAMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');
        setIsPWA(isPWAMode);

        // Detect platform
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('android')) {
            setPlatform('android');
        } else if (ua.includes('iphone') || ua.includes('ipad')) {
            setPlatform('ios');
        } else {
            setPlatform('desktop');
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);

            if (permission === 'granted') {
                // Send test notification
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification('Notifications Enabled! 🎉', {
                        body: 'You will now receive notifications from Rakla',
                        icon: '/icons/pwa-192x192.png',
                        vibrate: [200, 100, 200]
                    });
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass rounded-3xl border border-purple-500/30 w-full max-w-2xl p-6 animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-600/20 rounded-xl">
                        <Bell className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black">Enable Notifications</h2>
                        <p className="text-xs text-gray-500">Get notified about matches, leagues, and news</p>
                    </div>
                </div>

                {/* Permission Status */}
                <div className={`p-4 rounded-xl mb-6 ${permissionStatus === 'granted' ? 'bg-green-600/10 border border-green-500/30' :
                        permissionStatus === 'denied' ? 'bg-red-600/10 border border-red-500/30' :
                            'bg-yellow-600/10 border border-yellow-500/30'
                    }`}>
                    <div className="flex items-center gap-3">
                        {permissionStatus === 'granted' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                        )}
                        <div className="flex-1">
                            <p className="font-bold text-sm">
                                {permissionStatus === 'granted' ? 'Browser Permission: Granted ✅' :
                                    permissionStatus === 'denied' ? 'Browser Permission: Denied ❌' :
                                        'Browser Permission: Not Set'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {permissionStatus === 'granted' ? 'Browser can send notifications' :
                                    permissionStatus === 'denied' ? 'You blocked notifications in browser' :
                                        'Click below to grant permission'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Android-specific instructions */}
                {platform === 'android' && (
                    <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <SettingsIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold text-sm text-blue-400 mb-2">
                                    Android Settings Required
                                </p>
                                <p className="text-xs text-gray-300 mb-3">
                                    Even with browser permission, you must enable notifications in Android settings:
                                </p>
                                <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside">
                                    <li>Open <span className="font-bold text-white">Android Settings</span></li>
                                    <li>Go to <span className="font-bold text-white">Apps</span> → <span className="font-bold text-white">Rakla</span></li>
                                    <li>Tap <span className="font-bold text-white">Notifications</span></li>
                                    <li>Turn ON <span className="font-bold text-white">"Show notifications"</span></li>
                                    <li>Enable <span className="font-bold text-white">Sound</span> and <span className="font-bold text-white">Vibration</span></li>
                                    <li>Return to app and test!</li>
                                </ol>
                                <div className="mt-3 p-3 bg-yellow-600/20 rounded-lg">
                                    <p className="text-xs text-yellow-300">
                                        ⚠️ <span className="font-bold">Important:</span> If notifications are OFF in Android settings,
                                        you won't receive system notifications even if browser permission is granted!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* iOS-specific instructions */}
                {platform === 'ios' && (
                    <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <SettingsIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold text-sm text-blue-400 mb-2">
                                    iOS Settings Required
                                </p>
                                <p className="text-xs text-gray-300 mb-3">
                                    Make sure notifications are enabled in iOS settings:
                                </p>
                                <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside">
                                    <li>Open <span className="font-bold text-white">iOS Settings</span></li>
                                    <li>Scroll to <span className="font-bold text-white">Rakla</span></li>
                                    <li>Tap <span className="font-bold text-white">Notifications</span></li>
                                    <li>Turn ON <span className="font-bold text-white">"Allow Notifications"</span></li>
                                    <li>Enable <span className="font-bold text-white">Sounds</span> and <span className="font-bold text-white">Badges</span></li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* PWA Status */}
                <div className={`p-4 rounded-xl mb-6 ${isPWA ? 'bg-green-600/10 border border-green-500/30' :
                        'bg-yellow-600/10 border border-yellow-500/30'
                    }`}>
                    <p className="font-bold text-sm mb-1">
                        {isPWA ? '✅ Installed as PWA' : '⚠️ Running in Browser'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {isPWA ?
                            'Great! PWA mode enables better notifications' :
                            'For best notifications, install as PWA (Add to Home Screen)'
                        }
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {permissionStatus !== 'granted' && (
                        <button
                            onClick={requestPermission}
                            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-sm transition-all"
                        >
                            Grant Browser Permission
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all"
                    >
                        {permissionStatus === 'granted' ? 'Done' : 'Later'}
                    </button>
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    Need help? Check the notification settings in your device's system settings.
                </p>
            </div>
        </div>
    );
};

export default NotificationPermissionHelper;
