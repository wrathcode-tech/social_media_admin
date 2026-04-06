import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenNavItems } from '../../config/adminNav';

export default function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const items = useMemo(() => flattenNavItems(), []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const blob = `${it.label} ${it.keywords || ''} ${it.section || ''}`.toLowerCase();
      return blob.includes(s);
    });
  }, [items, q]);

  useEffect(() => {
    setIdx(0);
  }, [q, filtered.length]);

  const run = useCallback(
    (to) => {
      navigate(to);
      onClose();
      setQ('');
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onNav = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filtered[idx]) {
        e.preventDefault();
        run(filtered[idx].to);
      }
    };
    window.addEventListener('keydown', onNav);
    return () => window.removeEventListener('keydown', onNav);
  }, [open, filtered, idx, run, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[max(1rem,env(safe-area-inset-top,0px))] sm:px-4 sm:pt-[12vh]">
      <button type="button" className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div
        className="relative mt-2 w-full max-h-[min(70dvh,calc(100dvh-2rem))] max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:mt-0"
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2 border-b border-gray-100 px-3 dark:border-zinc-800">
          <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to page…"
            className="w-full border-0 bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-zinc-100"
          />
          <kbd className="hidden shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-[10px] text-gray-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 sm:inline">
            esc
          </kbd>
        </div>
        <ul className="max-h-[min(45dvh,280px)] overflow-y-auto overscroll-contain py-2 sm:max-h-[min(50vh,320px)]">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-gray-500 dark:text-zinc-400">No matches</li>
          ) : (
            filtered.map((it, i) => (
              <li key={`${it.to}-${it.label}`}>
                <button
                  type="button"
                  onClick={() => run(it.to)}
                  className={`flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors sm:gap-3 sm:px-4 ${
                    i === idx ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100' : 'text-gray-800 dark:text-zinc-200'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{it.label}</span>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-zinc-500">{it.section}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 dark:border-zinc-800 dark:text-zinc-500">
          <span className="font-medium text-gray-500 dark:text-zinc-400">↑↓</span> navigate ·{' '}
          <span className="font-medium text-gray-500 dark:text-zinc-400">↵</span> open ·{' '}
          <span className="font-medium text-gray-500 dark:text-zinc-400">⌘K</span> toggle
        </div>
      </div>
    </div>
  );
}
