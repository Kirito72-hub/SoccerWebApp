/**
 * useToast Hook
 * Custom hook for managing toast notifications
 */

import { useState, useCallback } from 'react';
import type { ToastType } from '../components/Toast';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((
        type: ToastType,
        title: string,
        message?: string,
        duration: number = 5000
    ) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, type, title, message, duration };

        setToasts((prev) => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string, duration?: number) => {
        showToast('success', title, message, duration);
    }, [showToast]);

    const error = useCallback((title: string, message?: string, duration?: number) => {
        showToast('error', title, message, duration);
    }, [showToast]);

    const warning = useCallback((title: string, message?: string, duration?: number) => {
        showToast('warning', title, message, duration);
    }, [showToast]);

    const info = useCallback((title: string, message?: string, duration?: number) => {
        showToast('info', title, message, duration);
    }, [showToast]);

    return {
        toasts,
        removeToast,
        success,
        error,
        warning,
        info
    };
};
