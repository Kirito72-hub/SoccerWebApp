import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

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
        <button
            onClick={handleInstallClick}
            className="fixed bottom-6 right-6 p-4 bg-purple-600 hover:bg-purple-500 rounded-full shadow-2xl shadow-purple-600/50 z-50 transition-all duration-300 hover:scale-110 group"
            title="Install Rakla App"
        >
            <Download className="w-6 h-6 text-white" />
            {/* Tooltip */}
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Install App
            </span>
        </button>
    );
};

export default PWAInstallPrompt;
