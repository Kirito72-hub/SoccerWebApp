/**
 * Toast Notification Component
 * Modern toast notifications with animations
 */

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    type,
    title,
    message,
    duration = 5000,
    onClose
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'border-green-500/30 bg-green-500/10';
            case 'error':
                return 'border-red-500/30 bg-red-500/10';
            case 'warning':
                return 'border-yellow-500/30 bg-yellow-500/10';
            case 'info':
                return 'border-blue-500/30 bg-blue-500/10';
        }
    };

    return (
        <div className={`glass rounded-xl border ${getColors()} p-4 shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300 min-w-[320px] max-w-md`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm mb-1">
                        {title}
                    </h3>
                    {message && (
                        <p className="text-xs text-gray-400 whitespace-pre-line">
                            {message}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        type: ToastType;
        title: string;
        message?: string;
        duration?: number;
    }>;
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        type={toast.type}
                        title={toast.title}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={() => onRemove(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};
