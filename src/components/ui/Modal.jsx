import { useEffect, useId, useRef } from 'react';

export default function Modal({ open, title, children, footer, onClose, size = 'md' }) {
  const titleId = useId();
  const closeRef = useRef(null);
  const maxW =
    size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : size === 'xl' ? 'max-w-4xl' : 'max-w-lg';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-200 ease-in-out dark:bg-black/60"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[min(90vh,720px)] w-full ${maxW} flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 dark:border-zinc-800 md:px-6">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <span className="text-xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-gray-700 dark:text-zinc-300 md:px-6">{children}</div>
        {footer ? (
          <div className="border-t border-gray-100 px-4 py-3 dark:border-zinc-800 md:px-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
