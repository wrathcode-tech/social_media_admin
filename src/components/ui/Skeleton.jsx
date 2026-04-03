export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 ${className}`}
      aria-hidden
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-gray-100 dark:border-zinc-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[8rem]" />
        </td>
      ))}
    </tr>
  );
}

/** Use inside `<tbody>` for native DataTable-style lists. */
export function DataTableSkeleton({ rows = 8, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  );
}

/** Shown while `react-data-table-component` is in `progressPending` state. */
export function TableProgressSkeleton({ rows = 10 }) {
  return (
    <div className="w-full space-y-3 px-4 py-8" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-3 w-2/3 max-w-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

const cardShell = 'rounded-2xl border border-gray-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900';

/** Stacked cards for mobile post/reel/story-style lists. */
export function MediaRowCardSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${cardShell} p-4`}>
          <div className="flex gap-3">
            <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/** Notifications list / similar rows. */
export function NotificationListSkeleton({ rows = 6 }) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3 w-full max-w-lg" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-20 shrink-0 rounded-xl sm:ml-4" />
        </li>
      ))}
    </ul>
  );
}

export function MaintenanceFormSkeleton() {
  return (
    <div className="mt-4 space-y-4" role="status" aria-label="Loading">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-1 h-6 w-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
      </div>
      <div>
        <Skeleton className="mb-2 h-4 w-16" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-44 rounded-xl" />
    </div>
  );
}

export function UserDetailPageSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-20 rounded" />
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="h-36 w-full rounded-none sm:h-44" />
        <div className="flex flex-col gap-4 border-t border-gray-200/80 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-end sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Skeleton className="-mt-14 h-24 w-24 shrink-0 rounded-2xl border-4 border-white dark:border-zinc-900 sm:-mt-16 sm:h-28 sm:w-28" />
            <div className="space-y-2 sm:pb-1">
              <Skeleton className="h-8 w-56 max-w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48 max-w-full" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${cardShell} p-4`}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-6 w-full" />
          </div>
        ))}
      </div>
    </>
  );
}

export function ContentDetailPageSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-24 rounded" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
      <div className={`${cardShell} mt-4 p-4 md:p-6`}>
        <div className="flex flex-col gap-6 lg:flex-row">
          <Skeleton className="h-48 w-full max-w-sm shrink-0 rounded-2xl lg:h-64 lg:w-64" />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ReportsOverviewSkeleton() {
  return (
    <div className="mt-4 space-y-4" role="status" aria-label="Loading stats">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-8 w-14" />
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function CommentBrowseListSkeleton({ rows = 6 }) {
  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-zinc-800 dark:border-zinc-700">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col gap-3 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-900/40"
        >
          <div className="flex min-w-0 flex-1 gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2 max-w-xs" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 shrink-0 rounded-xl" />
        </li>
      ))}
    </ul>
  );
}

export function CommentThreadSkeleton({ cards = 4 }) {
  return (
    <ul className="space-y-4">
      {Array.from({ length: cards }).map((_, i) => (
        <li key={i} className={`${cardShell} p-4`}>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-11/12 max-w-2xl" />
          <Skeleton className="mt-3 h-3 w-48" />
        </li>
      ))}
    </ul>
  );
}

export function ReportDetailModalSkeleton() {
  return (
    <div className="space-y-3 py-2" role="status" aria-label="Loading">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-4 w-28 shrink-0" />
          <Skeleton className="h-4 min-w-0 flex-1" />
        </div>
      ))}
    </div>
  );
}

/** Simple mobile list row (reports, etc.). */
export function SimpleStackedCardSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${cardShell} p-4`}>
          <Skeleton className="h-4 w-3/4 max-w-sm" />
          <Skeleton className="mt-2 h-3 w-full" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
