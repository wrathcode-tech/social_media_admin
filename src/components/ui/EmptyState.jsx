export default function EmptyState({ title, detail }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 px-4 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
      <p className="font-medium text-gray-800 dark:text-zinc-200">{title}</p>
      {detail ? <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{detail}</p> : null}
    </div>
  );
}
