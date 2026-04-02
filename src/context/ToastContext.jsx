import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { bindToastPush } from '../utils/snackbarUtils';

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'default') => {
      const id = ++idSeq;
      setToasts((list) => [...list, { id, message, variant }].slice(-5));
      const tid = setTimeout(() => dismiss(id), 4200);
      timers.current.set(id, tid);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast: push, dismiss }), [push, dismiss]);

  useEffect(() => {
    bindToastPush(push);
    return () => bindToastPush(null);
  }, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 p-0 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm dark:shadow-zinc-950/50 ${
              t.variant === 'success'
                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/90 dark:text-emerald-100'
                : t.variant === 'error'
                  ? 'border-red-200 bg-red-50/95 text-red-900 dark:border-red-900/50 dark:bg-red-950/90 dark:text-red-100'
                  : 'border-gray-200 bg-white/95 text-gray-900 dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-100'
            }`}
            role="status"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
