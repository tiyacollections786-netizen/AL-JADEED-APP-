import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (item: Omit<ToastItem, 'id'>) => string;
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts(prev => [...prev.slice(-3), newToast]); // Keep up to 4 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: 'success', title, message, duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: 'error', title, message, duration });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, removeToast }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div
        id="toast-notification-container"
        className="fixed top-4 right-0 sm:right-4 left-0 sm:left-auto z-[99999] pointer-events-none flex flex-col items-center sm:items-end gap-2.5 px-3 sm:px-0 max-w-sm w-full"
        aria-live="polite"
      >
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all transform animate-in fade-in slide-in-from-top-3 duration-300 ${
                isSuccess
                  ? 'bg-gradient-to-r from-[#0d1f18]/95 via-[#130d2e]/95 to-[#1c0c3b]/95 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                  : isError
                  ? 'bg-gradient-to-r from-[#290c14]/95 via-[#18092a]/95 to-[#1c0c3b]/95 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
                  : isWarning
                  ? 'bg-gradient-to-r from-[#291b08]/95 via-[#18092a]/95 to-[#1c0c3b]/95 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                  : 'bg-gradient-to-r from-[#170a38]/95 via-[#12072e]/95 to-[#1c0c3b]/95 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.25)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSuccess
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : isError
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-white tracking-wide">{toast.title}</h4>
                    {isSuccess && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                  </div>
                  {toast.message && (
                    <p className="text-[11px] text-purple-200/90 mt-1 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-purple-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Glowing bottom accent line */}
              <div
                className={`h-0.5 w-full mt-3 rounded-full ${
                  isSuccess
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-transparent'
                    : isError
                    ? 'bg-gradient-to-r from-rose-400 via-pink-400 to-transparent'
                    : isWarning
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-transparent'
                    : 'bg-gradient-to-r from-purple-400 via-pink-400 to-transparent'
                }`}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
