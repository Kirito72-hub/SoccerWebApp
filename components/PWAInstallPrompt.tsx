import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen
            setShowPrompt(true);
        });
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the installation prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install confirmation: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 max-w-md z-50 animate-in slide-in-from-bottom duration-500">
            <div className="glass bg-[#1a1a2e]/90 p-4 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/20 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600/20 rounded-xl">
                            <Download className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-white">Install Rakla App</h3>
                            <p className="text-xs text-gray-400">Install our app for the best experience!</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-purple-600/20 transition-all"
                    >
                        INSTALL APP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
