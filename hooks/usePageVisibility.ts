import { useEffect, useState } from 'react';

/**
 * Hook to detect when the app becomes visible/hidden
 * Useful for reconnecting realtime subscriptions on mobile
 */
export const usePageVisibility = () => {
    const [isVisible, setIsVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = !document.hidden;
            setIsVisible(visible);
            console.log(`[PageVisibility] App is now ${visible ? 'visible' : 'hidden'}`);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also listen for focus/blur events (additional mobile support)
        const handleFocus = () => {
            setIsVisible(true);
            console.log('[PageVisibility] App focused');
        };

        const handleBlur = () => {
            setIsVisible(false);
            console.log('[PageVisibility] App blurred');
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    return isVisible;
};
