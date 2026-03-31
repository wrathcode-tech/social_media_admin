export default function DataTable({ children, className = '' }) {
  return (
    <div
      className={`overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/80">{children}</thead>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400 ${className}`}>
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">{children}</tbody>;
}

export function Tr({ children, className = '' }) {
  return (
    <tr
      className={`bg-white transition-colors duration-150 ease-in-out hover:bg-gray-50/90 even:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/60 dark:even:bg-zinc-900/70 ${className}`}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '', colSpan }) {
  return (
    <td className={`px-4 py-3 text-gray-800 dark:text-zinc-200 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
