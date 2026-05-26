import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2, XCircle, AlertTriangle, Info,
    Receipt, Sun, SunMedium, Sunset, Moon, X, Trash2, Loader2
} from 'lucide-react';

export const Toast = React.memo(({ id, message, type, duration = 3000, onClose }) => {
    const durationSec = duration / 1000;

    // Unified elite blue style for all system notifications
    const systemStyle = {
        color: "text-blue-600",
        iconBg: "bg-blue-100",
        iconBorder: "border-blue-200",
        cardBg: "bg-blue-50/90",
        cardBorder: "border-blue-200",
        shadow: "shadow-blue-200/60",
        accent: "bg-blue-600",
        progress: "bg-blue-600",
        label: "text-blue-500/70"
    };

    const typeConfig = {
        success: { ...systemStyle, icon: <CheckCircle2 size={18} /> },
        error: {
            icon: <XCircle size={18} />,
            color: "text-red-600",
            iconBg: "bg-red-100",
            iconBorder: "border-red-200",
            cardBg: "bg-red-50/90",
            cardBorder: "border-red-200",
            shadow: "shadow-red-200/60",
            accent: "bg-red-600",
            progress: "bg-red-600",
            label: "text-red-500/70"
        },
        warning: {
            icon: <AlertTriangle size={18} />,
            color: "text-amber-600",
            iconBg: "bg-amber-100",
            iconBorder: "border-amber-200",
            cardBg: "bg-amber-50/90",
            cardBorder: "border-amber-200",
            shadow: "shadow-amber-200/60",
            accent: "bg-amber-500",
            progress: "bg-amber-500",
            label: "text-amber-500/70"
        },
        info: { ...systemStyle, icon: <Info size={18} /> },
        realtime: { ...systemStyle, icon: <Receipt size={18} /> },
        greeting_morning: {
            icon: <Sun size={18} />,
            color: "text-amber-600",
            iconBg: "bg-amber-100",
            iconBorder: "border-amber-200",
            cardBg: "bg-amber-50/90",
            cardBorder: "border-amber-200",
            shadow: "shadow-amber-200/60",
            accent: "bg-amber-500",
            progress: "bg-amber-500",
            label: "text-amber-500/70"
        },
        greeting_afternoon: {
            icon: <SunMedium size={18} />,
            color: "text-orange-600",
            iconBg: "bg-orange-100",
            iconBorder: "border-orange-200",
            cardBg: "bg-orange-50/90",
            cardBorder: "border-orange-200",
            shadow: "shadow-orange-200/60",
            accent: "bg-orange-500",
            progress: "bg-orange-500",
            label: "text-orange-500/70"
        },
        greeting_evening: {
            icon: <Sunset size={18} />,
            color: "text-rose-600",
            iconBg: "bg-rose-100",
            iconBorder: "border-rose-200",
            cardBg: "bg-rose-50/90",
            cardBorder: "border-rose-200",
            shadow: "shadow-rose-200/60",
            accent: "bg-rose-500",
            progress: "bg-rose-500",
            label: "text-rose-500/70"
        },
        greeting_night: {
            icon: <Moon size={18} />,
            color: "text-indigo-300",
            iconBg: "bg-indigo-900/50",
            iconBorder: "border-indigo-700",
            cardBg: "bg-slate-800/90",
            cardBorder: "border-slate-700",
            shadow: "shadow-slate-400/40",
            accent: "bg-indigo-400",
            progress: "bg-indigo-400",
            label: "text-indigo-300/70",
            dark: true
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    return (
        <motion.div
            layout
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, scale: 0.8, opacity: 0 }}
            className={`min-w-[300px] max-w-[380px] border shadow-xl p-4 rounded-2xl flex items-start gap-4 relative overflow-hidden font-manrope backdrop-blur-md ${config.cardBg} ${config.cardBorder} ${config.shadow}`}
        >
            {/* Left accent strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`} />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.iconBg} ${config.color} ${config.iconBorder}`}>
                {config.icon}
            </div>
            <div className="flex-1 pr-6 min-w-0 pt-0.5">
                <p className={`text-[10px] font-black tracking-widest uppercase mb-1 ${config.label}`}>KASIRKITE</p>
                <p className={`text-sm font-semibold leading-tight ${config.dark ? 'text-slate-100' : 'text-slate-800'}`}>{message}</p>
            </div>
            <button onClick={() => onClose(id)} className={`absolute top-4 right-4 transition-colors ${config.dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-300 hover:text-slate-500'}`}>
                <X size={16} />
            </button>
            <motion.div initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: durationSec, ease: "linear" }} className={`absolute bottom-0 left-0 right-0 h-1 ${config.progress} opacity-30`} />
        </motion.div>
    );
});

export const ConfirmDialog = React.memo(({ isOpen, title, text, confirmLabel, cancelLabel, onConfirm, onClose, isProcessing = false, processingLabel = 'Memproses...' }) => {
    if (!isOpen) return null;

    const isWarningOnly = !confirmLabel;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2000] flex items-center justify-center p-4 font-manrope">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-6 text-center"
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isWarningOnly ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                    {isWarningOnly ? (
                        <AlertTriangle size={20} />
                    ) : (
                        <Trash2 size={20} className={isProcessing ? 'animate-pulse' : ''} />
                    )}
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">{title}</h3>
                <p className="text-xs text-slate-500 mb-6">{text}</p>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className={`py-2.5 bg-slate-100 rounded-xl font-bold text-xs text-slate-600 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'} ${isWarningOnly ? 'w-full' : 'flex-1'}`}
                    >
                        {cancelLabel || (isWarningOnly ? 'Kembali' : 'Batal')}
                    </button>

                    {!isWarningOnly && (
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 ${isProcessing ? 'opacity-80 cursor-not-allowed' : 'hover:bg-red-600 active:scale-[0.98]'}`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    {processingLabel && <span>{processingLabel}</span>}
                                </>
                            ) : (
                                <span>{confirmLabel}</span>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
});
