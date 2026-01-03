/**
 * useToastNotifications Hook
 * Manages toast notification queue and lifecycle
 */

import { useState, useCallback } from 'react';
import { ToastNotificationData } from '../types/notifications';
import { notificationSound } from '../services/notificationSound';

export const useToastNotifications = () => {
    const [toasts, setToasts] = useState<ToastNotificationData[]>([]);

    /**
     * Add a new toast notification
     */
    const addToast = useCallback((toast: Omit<ToastNotificationData, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastNotificationData = {
            ...toast,
            id,
            duration: toast.duration || 5000
        };

        setToasts(prev => [...prev, newToast]);

        // Play sound if enabled
        if (toast.category === 'achievement') {
            notificationSound.playAchievement();
        } else {
            notificationSound.playNotification();
        }

        return id;
    }, []);

    /**
     * Remove a toast by ID
     */
    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    /**
     * Clear all toasts
     */
    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    /**
     * Show a success toast
     */
    const showSuccess = useCallback((title: string, message: string) => {
        return addToast({
            title,
            message,
            category: 'achievement',
            priority: 'medium',
            duration: 3000
        });
    }, [addToast]);

    /**
     * Show an error toast
     */
    const showError = useCallback((title: string, message: string) => {
        return addToast({
            title,
            message,
            category: 'alert',
            priority: 'high',
            duration: 5000
        });
    }, [addToast]);

    /**
     * Show an info toast
     */
    const showInfo = useCallback((title: string, message: string) => {
        return addToast({
            title,
            message,
            category: 'announcement',
            priority: 'medium',
            duration: 4000
        });
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        showSuccess,
        showError,
        showInfo
    };
};
