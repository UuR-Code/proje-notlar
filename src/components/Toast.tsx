"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, action?: { label: string; onClick: () => void }) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", action?: { label: string; onClick: () => void }) => {
      const id = Math.random().toString(36).slice(2);
      const newToast: ToastItem = { id, message, type, action };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string) => {
      toast(message, "success");
    },
    [toast]
  );

  const error = useCallback(
    (message: string) => {
      toast(message, "error");
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg transition-all transform duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-white border-emerald-200 text-slate-800"
                : t.type === "error"
                ? "bg-white border-rose-200 text-slate-800"
                : "bg-white border-blue-200 text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
              <span>{t.message}</span>
            </div>

            <div className="flex items-center gap-2">
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                >
                  {t.action.label}
                </button>
              )}
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
