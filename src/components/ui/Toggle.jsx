export default function Toggle({ id, label, description, checked, onChange, disabled }) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4 transition-colors duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-900/50 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="relative inline-flex h-7 w-12 flex-shrink-0 items-center">
        <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="peer sr-only" />
        <span
          className="h-7 w-12 rounded-full bg-gray-300 transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 dark:bg-zinc-600 dark:peer-checked:bg-blue-500"
          aria-hidden
        />
        <span
          className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out peer-checked:translate-x-5"
          aria-hidden
        />
      </div>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-zinc-100">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-gray-500 dark:text-zinc-400">{description}</span> : null}
      </span>
    </label>
  );
}
