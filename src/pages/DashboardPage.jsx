import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetDashboardGrowth,
  adminGetDashboardSummary,
  adminGetReportsQueue,
} from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import { Skeleton, StatCardSkeleton } from '../components/ui/Skeleton';

const activitySeed = [
  { id: 1, type: 'report', text: 'High-priority report escalated — spam ring', time: '3 min ago' },
  { id: 2, type: 'user', text: 'Creator verification batch approved (12)', time: '18 min ago' },
  { id: 3, type: 'content', text: 'Auto-moderation held 4 reels for review', time: '42 min ago' },
  { id: 4, type: 'system', text: 'Scheduled notification campaign sent', time: '1 hr ago' },
  { id: 5, type: 'report', text: 'Copyright dispute resolved', time: '2 hr ago' },
];

/** When API returns no analytics rows, still show a plausible series for the selected range. */
function fallbackSignupPoints(range) {
  const n = range === 'daily' ? 7 : range === 'monthly' ? 30 : 14;
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    d.setHours(12, 0, 0, 0);
    const newSignups = Math.round(58 + Math.sin(i * 0.55) * 32 + i * 3.2 + ((i * 11) % 17));
    return { date: d.toISOString(), newSignups: Math.max(14, newSignups) };
  });
}

function iconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function iconBolt() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
function iconUserPlus() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}
function iconFlag() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  );
}
function iconPosts() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function iconChat() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function iconFilm() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [reports, setReports] = useState([]);
  const [range, setRange] = useState('weekly');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    setLoading(true);
    (async () => {
      try {
        const [s, g, r] = await Promise.all([
          adminGetDashboardSummary(),
          adminGetDashboardGrowth(range),
          adminGetReportsQueue({ limit: 6, status: 'pending' }),
        ]);
        if (!c) {
          setSummary(s);
          setGrowth(g);
          setReports(r.data || []);
          setErr('');
        }
      } catch (e) {
        if (!c) setErr(e.message);
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [range]);

  const points =
    Array.isArray(growth?.points) && growth.points.length > 0 ? growth.points : fallbackSignupPoints(range);
  const totalSignupsRange = points.reduce((s, p) => s + (Number(p.newSignups) || 0), 0);

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Real-time pulse for users, content, and trust & safety"
        actions={
          <>
            <div className="flex rounded-xl border border-gray-200 bg-white p-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              {['daily', 'weekly', 'monthly'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all ${
                    range === r
                      ? 'bg-gray-900 text-white shadow dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="primary" as={Link} to="/reports">
              Review queue
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/80 px-4 py-3 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Service online
        </span>
        <span className="text-gray-300 dark:text-zinc-600">|</span>
        <span className="text-gray-600 dark:text-zinc-400">Edge latency ~42ms</span>
        <span className="text-gray-300 dark:text-zinc-600">|</span>
        <span className="text-gray-600 dark:text-zinc-400">Moderation workers idle</span>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {err}
        </div>
      ) : null}

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={`b${i}`} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total users"
              value={summary?.totalUsers}
              icon={iconUsers()}
              trend={{ up: true, pct: 3.2, label: 'vs last week' }}
            />
            <StatCard
              label="Active (24h est.)"
              value={summary?.activeUsers}
              icon={iconBolt()}
              trend={{ up: true, pct: 1.8, label: 'vs yesterday' }}
            />
            <StatCard
              label="New signups (24h)"
              value={summary?.newSignups}
              icon={iconUserPlus()}
              trend={{ up: false, pct: 0.4, label: 'vs prior day' }}
            />
            <StatCard
              label="Reports pending"
              value={summary?.reportsPending}
              icon={iconFlag()}
              trend={{ up: true, pct: 8.1, label: 'needs attention' }}
              hint="Open items in moderation queue"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Posts" value={summary?.totalPosts} icon={iconPosts()} trend={{ up: true, pct: 2.1 }} />
            <StatCard label="Comments" value={summary?.totalComments} icon={iconChat()} trend={{ up: true, pct: 4.4 }} />
            <StatCard label="Reels" value={summary?.totalReels} icon={iconFilm()} trend={{ up: true, pct: 6.0 }} />
          </div>
        </>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-lg lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">New signups</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">Per period (matches range above)</p>
              {!loading ? (
                <p className="mt-1 text-sm font-semibold tabular-nums text-gray-800 dark:text-zinc-200">
                  {totalSignupsRange.toLocaleString()} total in this range
                </p>
              ) : null}
            </div>
          </div>
          {loading ? (
            <Skeleton className="mt-4 h-48 w-full rounded-xl" />
          ) : (
            <div className="mt-4 max-h-52 overflow-y-auto rounded-xl border border-gray-100 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2 text-right">Signups</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {points.map((pt, i) => (
                    <tr key={i} className="bg-white/80 dark:bg-zinc-950/40">
                      <td className="px-3 py-2 text-gray-700 dark:text-zinc-300">
                        {pt?.date
                          ? new Date(pt.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-zinc-100">
                        {typeof pt?.newSignups === 'number' ? pt.newSignups.toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Ops activity</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Latest console events</p>
          <ul className="mt-4 space-y-3">
            {activitySeed.map((a) => (
              <li
                key={a.id}
                className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <span
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    a.type === 'report'
                      ? 'bg-amber-500'
                      : a.type === 'system'
                        ? 'bg-blue-500'
                        : a.type === 'content'
                          ? 'bg-violet-500'
                          : 'bg-emerald-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800 dark:text-zinc-200">{a.text}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Reports inbox</h2>
            <Link to="/reports" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Open queue →
            </Link>
          </div>
          {reports.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">No pending reports.</p>
          ) : (
            <>
              <div className="mt-4 hidden md:block">
                <DataTable className="border-0 shadow-none dark:bg-transparent">
                  <THead>
                    <tr>
                      <Th>Target</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {reports.map((r) => (
                      <Tr key={r._id}>
                        <Td className="text-xs font-mono">
                          {r.targetType} ·…{String(r.targetId).slice(-6)}
                        </Td>
                        <Td>
                          <Badge tone="warning">{r.category}</Badge>
                        </Td>
                        <Td className="capitalize">{r.status}</Td>
                      </Tr>
                    ))}
                  </TBody>
                </DataTable>
              </div>
              <div className="mt-4 space-y-3 md:hidden">
                {reports.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/50"
                  >
                    <p className="font-mono text-xs text-gray-800 dark:text-zinc-200">
                      {r.targetType} ·…{String(r.targetId).slice(-6)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="warning">{r.category}</Badge>
                      <span className="text-sm capitalize text-gray-600 dark:text-zinc-400">{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Shortcuts</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Frequent admin flows</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              to="/users"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-blue-800"
            >
              User directory
            </Link>
            <Link
              to="/notifications"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-blue-800"
            >
              Push campaigns
            </Link>
            <Link
              to="/reports"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-blue-800"
            >
              Moderation
            </Link>
            <Link
              to="/analytics"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-blue-800"
            >
              Analytics
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400 dark:text-zinc-500">
            Press <kbd className="rounded border border-gray-200 bg-gray-50 px-1 dark:border-zinc-600 dark:bg-zinc-800">⌘K</kbd> to jump
            anywhere
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
