export function TextField({ label, id, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`block text-sm font-medium text-gray-700 dark:text-zinc-300 ${className}`} htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        {...props}
      />
    </label>
  );
}
