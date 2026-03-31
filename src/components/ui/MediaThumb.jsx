import { useState } from 'react';

/**
 * @param {{ src: string, alt?: string, className?: string, imgClassName?: string, fallbackClassName?: string }} props
 */
export default function MediaThumb({ src, alt = '', className = '', imgClassName = '', fallbackClassName = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-medium text-slate-500 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-400 ${className} ${fallbackClassName}`}
        aria-hidden
      >
        —
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-gray-100 dark:bg-zinc-800 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${imgClassName}`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
