import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

const PWAUpdatePrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) return;

        // Listen for service worker updates
        navigator.serviceWorker.ready.then((registration) => {
            // Check for updates periodically (every 60 seconds)
            setInterval(() => {
                registration.update();
            }, 60000);

            // Listen for new service worker waiting
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        console.log('🔄 New version available!');
                        setWaitingWorker(newWorker);
                        setShowPrompt(true);
                    }
                });
            });
        });

        // Listen for controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 New version activated! Reloading...');
            window.location.reload();
        });
    }, []);

    const handleUpdate = () => {
        if (!waitingWorker) return;

        // Tell the waiting service worker to skip waiting and become active
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Show again in 1 hour if user dismisses
        setTimeout(() => {
            if (waitingWorker) {
                setShowPrompt(true);
            }
        }, 3600000); // 1 hour
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 max-w-md z-50 animate-in slide-in-from-bottom duration-500">
            <div className="glass bg-[#1a1a2e]/95 p-4 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-600/20 rounded-xl animate-pulse">
                            <RefreshCw className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-white">Update Available! 🎉</h3>
                            <p className="text-xs text-gray-400">A new version of Rakla is ready to install</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleUpdate}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-emerald-600/20 transition-all"
                    >
                        UPDATE NOW
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-2.5 glass border border-white/10 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Later
                    </button>
                </div>

                <p className="text-[10px] text-gray-500 text-center">
                    The app will reload automatically after updating
                </p>
            </div>
        </div>
    );
};

export default PWAUpdatePrompt;
