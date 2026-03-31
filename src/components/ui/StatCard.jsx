export default function StatCard({ label, value, hint, trend, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-md transition-all duration-200 ease-out hover:border-blue-200/60 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900/40">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-500/15 dark:to-transparent" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                {icon}
              </span>
            ) : null}
            <div className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-zinc-50">
              {value == null || value === ''
                ? '—'
                : typeof value === 'number' || (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value)))
                  ? Number(value).toLocaleString()
                  : String(value)}
            </span>
            {trend ? (
              <span
                className={`text-xs font-semibold tabular-nums ${
                  trend.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.up ? '↑' : '↓'} {Math.abs(trend.pct)}%
                {trend.label ? <span className="ml-1 font-normal text-gray-400 dark:text-zinc-500">{trend.label}</span> : null}
              </span>
            ) : null}
          </div>
          {hint ? <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
