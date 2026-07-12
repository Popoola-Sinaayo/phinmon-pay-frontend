"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (title: string, variant?: ToastVariant, options?: ToastOptions) => string;
  success: (title: string, options?: ToastOptions) => string;
  error: (title: string, options?: ToastOptions) => string;
  info: (title: string, options?: ToastOptions) => string;
  warning: (title: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; accent: string; ring: string }
> = {
  success: { icon: CheckCircle2, accent: "text-primary-600", ring: "ring-primary-100" },
  error: { icon: XCircle, accent: "text-error-600", ring: "ring-error-500/20" },
  warning: { icon: AlertTriangle, accent: "text-warning-600", ring: "ring-warning-500/20" },
  info: { icon: Info, accent: "text-secondary-600", ring: "ring-secondary-100" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (title: string, variant: ToastVariant = "info", options?: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      const duration = options?.duration ?? 4500;
      setToasts((prev) => [
        ...prev.slice(-3),
        { id, title, description: options?.description, variant, duration },
      ]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (title, options) => show(title, "success", options),
      error: (title, options) => show(title, "error", options),
      info: (title, options) => show(title, "info", options),
      warning: (title, options) => show(title, "warning", options),
      dismiss,
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-end sm:pr-6">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const { icon: Icon, accent, ring } = VARIANT_STYLES[toast.variant];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-modal border border-ink-900/[0.07] bg-white p-4 shadow-lift ring-1",
                  ring
                )}
                role="status"
                aria-live="polite"
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", accent)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-0.5 text-sm leading-snug text-ink-500">{toast.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="-m-1 shrink-0 rounded-full p-1 text-ink-500 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-900"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
