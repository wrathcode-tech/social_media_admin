export default function Card({ children, className = '', padding = 'p-4 md:p-6' }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-md transition-shadow duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-900 ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
