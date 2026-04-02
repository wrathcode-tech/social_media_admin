import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton } from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AuthService from '../api/services/AuthService';

function fmtWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

function fmtRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  if (diff < 0) return fmtWhen(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatActionLabel(action) {
  if (action == null || action === '') return 'Action';
  const s = String(action).replace(/_/g, ' ').trim();
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : 'Action';
}

function activityBadgeTone(action) {
  const a = String(action || '').toLowerCase();
  if (a.includes('unban') || a.includes('approve') || a.includes('restore')) return 'success';
  if (a.includes('ban') || a.includes('delete') || a.includes('remove')) return 'danger';
  if (a.includes('restrict') || a.includes('warn') || a.includes('flag')) return 'warning';
  if (a.includes('login') || a.includes('session')) return 'default';
  return 'info';
}

function activitySubtitle(a) {
  const parts = [];
  const uname =
    a?.targetUsername ??
    a?.targetUser?.username ??
    a?.user?.username ??
    a?.metadata?.username ??
    a?.metadata?.targetUsername;
  const uid = a?.targetUserId ?? a?.userId ?? a?.targetUser?._id ?? a?.targetUser?.id;
  if (uname) parts.push(`@${uname}`);
  else if (uid) parts.push(`User ${String(uid).slice(0, 10)}…`);
  if (a?.resourceType) parts.push(String(a.resourceType));
  if (a?.resourceId && !a?.resourceType) parts.push(`#${String(a.resourceId).slice(0, 8)}`);
  return parts.length ? parts.join(' · ') : null;
}

export default function DashboardPage() {
  const [dash, setDash] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const getDashboard = async () => {
    try {
      setLoading(true);
      const res = await AuthService.dashboard();

      if (res?.success) {
        setDash(res?.data);
      } else {
        setErr(res?.message || "Something went wrong");
      }
    } catch (e) {
      setErr("Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboard();
  }, []);

  const signupChart = Array.isArray(dash?.users?.signupChart)
    ? dash.users.signupChart
    : [];

  const totalSignupChart = signupChart.reduce(
    (s, p) => s + (Number(p?.count) || 0),
    0
  );

  const adminActivity = Array.isArray(dash?.adminActivity)
    ? dash.adminActivity
    : [];

  const lastAdmin = adminActivity[0] || null;

  const showSkeleton = loading;

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Real-time pulse for users, content, and trust & safety"
      />

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {err}
        </div>
      ) : null}

      {showSkeleton ? (
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
              value={dash?.users?.total}
              trend={{ up: true, pct: 3.2, label: 'vs last week' }}
            />
            <StatCard
              label="Active users"
              value={dash?.users?.active}
              trend={{ up: true, pct: 1.8, label: 'vs yesterday' }}
            />
            <StatCard
              label="New signups (today)"
              value={dash?.users?.newSignups?.today}
              trend={{ up: false, pct: 0.4, label: 'vs prior day' }}
            />
            <StatCard
              label="Verified users"
              value={dash?.users?.verified}
              trend={{ up: true, pct: 8.1, label: 'total verified' }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            <StatCard label="Signups (today)" value={dash?.users?.newSignups?.today} />
            <StatCard label="Signups (weekly)" value={dash?.users?.newSignups?.weekly} />
            <StatCard label="Signups (monthly)" value={dash?.users?.newSignups?.monthly} />
            <StatCard label="Signup chart total" value={totalSignupChart} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            <StatCard label="Posts" value={dash?.posts?.total} />
            <StatCard label="Comments" value={dash?.comments?.total} />
            <StatCard label="Reels" value={dash?.reels?.total} />
          </div>

          <section className="mt-6" aria-labelledby="admin-activity-heading">
            <Card className="overflow-hidden shadow-lg !p-0" padding="p-0">
              <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/95 to-white px-4 py-4 dark:border-zinc-800 dark:from-zinc-900/90 dark:to-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <h2
                    id="admin-activity-heading"
                    className="text-lg font-semibold tracking-tight text-gray-900 dark:text-zinc-50"
                  >
                    Admin activity
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                    {lastAdmin?.createdAt
                      ? `Latest event ${fmtRelative(lastAdmin.createdAt)} · ${fmtWhen(lastAdmin.createdAt)}`
                      : 'Moderation and admin actions across the platform'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold tabular-nums text-gray-700 shadow-sm ring-1 ring-gray-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700">
                    {adminActivity.length} {adminActivity.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
              </div>

              {adminActivity.length === 0 ? (
                <div className="px-4 py-12 text-center sm:px-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700 dark:text-zinc-300">No admin activity yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-zinc-500">
                    Bans, restrictions, and other admin actions will show up here as they happen.
                  </p>
                </div>
              ) : (
                <ul className="max-h-[min(28rem,55vh)] divide-y divide-gray-100 overflow-y-auto overscroll-contain dark:divide-zinc-800">
                  {adminActivity.slice(0, 25).map((a, i) => {
                    const sub = activitySubtitle(a);
                    const adminName =
                      a?.admin?.username ||
                      a?.admin?.email ||
                      a?.admin?.fullName ||
                      a?.actorAdmin?.email ||
                      a?.performedBy;
                    return (
                      <li key={a._id || a.id || `${a.action}-${a.createdAt}-${i}`}>
                        <div className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50/90 sm:flex-row sm:items-start sm:gap-4 sm:px-6 dark:hover:bg-zinc-800/40">
                          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                            <div className="shrink-0 pt-0.5">
                              <Badge tone={activityBadgeTone(a.action)} className="max-w-[14rem] truncate sm:max-w-[16rem]">
                                {formatActionLabel(a.action)}
                              </Badge>
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              {adminName ? (
                                <p className="text-sm text-gray-900 dark:text-zinc-100">
                                  <span className="text-gray-500 dark:text-zinc-400">By </span>
                                  <span className="font-medium">{adminName}</span>
                                </p>
                              ) : null}
                              {sub ? (
                                <p className="text-xs text-gray-600 dark:text-zinc-400">{sub}</p>
                              ) : null}
                              {a?.ipAddress ? (
                                <p className="font-mono text-[11px] text-gray-400 dark:text-zinc-500">{a.ipAddress}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="shrink-0 text-left sm:w-36 sm:text-right">
                            <time
                              className="text-sm font-medium tabular-nums text-gray-900 dark:text-zinc-200"
                              dateTime={a.createdAt}
                              title={fmtWhen(a.createdAt)}
                            >
                              {fmtRelative(a.createdAt)}
                            </time>
                            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-zinc-500">{fmtWhen(a.createdAt)}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}
    </PageShell>
  );
}