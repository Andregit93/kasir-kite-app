import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from '@/Components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => {
            const next = [...prev, { id, message, type, duration }];
            // Limit to 3 toasts at a time to keep UI clean
            return next.length > 3 ? next.slice(-3) : next;
        });
        
        // Auto remove handled by state update after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* Global Toast Container - Fixed at the root level */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 items-end pointer-events-none">
                <div className="pointer-events-auto">
                    <AnimatePresence>
                        {toasts.map(t => (
                            <Toast 
                                key={t.id} 
                                id={t.id} 
                                message={t.message} 
                                type={t.type} 
                                duration={t.duration} 
                                onClose={removeToast} 
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </ToastContext.Provider>
    );
};
