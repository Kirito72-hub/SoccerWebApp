/**
 * useSwipe Hook
 * Custom hook for handling swipe gestures on mobile
 */

import { useRef, useEffect, TouchEvent } from 'react';

interface SwipeConfig {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    minSwipeDistance?: number; // Minimum distance for swipe (default: 50px)
    maxSwipeTime?: number; // Maximum time for swipe (default: 300ms)
}

export const useSwipe = (config: SwipeConfig) => {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        minSwipeDistance = 50,
        maxSwipeTime = 300
    } = config;

    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const touchStartTime = useRef<number>(0);

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();

        const deltaX = touchEndX - touchStartX.current;
        const deltaY = touchEndY - touchStartY.current;
        const deltaTime = touchEndTime - touchStartTime.current;

        // Check if swipe was fast enough
        if (deltaTime > maxSwipeTime) return;

        // Determine swipe direction
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Horizontal swipe
        if (absX > absY && absX > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right
                onSwipeRight?.();
            } else {
                // Swipe left
                onSwipeLeft?.();
            }
        }
        // Vertical swipe
        else if (absY > absX && absY > minSwipeDistance) {
            if (deltaY > 0) {
                // Swipe down
                onSwipeDown?.();
            } else {
                // Swipe up
                onSwipeUp?.();
            }
        }
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd
    };
};
