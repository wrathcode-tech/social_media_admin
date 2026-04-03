import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import {
  DataTableSkeleton,
  ReportDetailModalSkeleton,
  ReportsOverviewSkeleton,
  SimpleStackedCardSkeleton,
} from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import PaginationBar from '../components/ui/PaginationBar';
import {
  extractReportsList,
  extractReportsListMeta,
  extractStatsPayload,
  reportCategoryLabel,
  reportRowId,
  reportStatusLabel,
  reportTargetLabel,
} from './reportsUtils';

function fmtDateTime(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

function isApiError(res) {
  return res && typeof res === 'object' && res.success === false;
}

function toneForStatus(s) {
  const x = String(s || '').toLowerCase();
  if (x === 'resolved' || x === 'closed' || x === 'dismissed') return 'success';
  if (x === 'pending' || x === 'open' || x === 'new') return 'warning';
  if (x === 'reviewing' || x === 'in_review') return 'info';
  return 'default';
}

function BreakdownTable({ title, obj }) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const entries = Object.entries(obj).filter(([, v]) => v != null);
  if (entries.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">{title}</p>
      <ul className="mt-1 space-y-1 text-sm text-gray-800 dark:text-zinc-200">
        {entries.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-4 border-b border-gray-100 py-1 dark:border-zinc-800">
            <span className="font-mono text-xs text-gray-600 dark:text-zinc-400">{k}</span>
            <span className="font-medium">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrendBlock({ trend }) {
  if (trend == null) return null;
  if (Array.isArray(trend)) {
    if (trend.length === 0) return null;
    const rows = trend.map((row, i) => {
      if (row && typeof row === 'object') {
        const day = row.date ?? row.day ?? row._id ?? row.label ?? `Row ${i + 1}`;
        const count = row.count ?? row.total ?? row.value ?? row.reports ?? '—';
        return { key: String(day) + i, day: String(day), count };
      }
      return { key: i, day: String(i), count: String(row) };
    });
    return (
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">7-day trend</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
          <table className="w-full min-w-[240px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Period</th>
                <th className="px-3 py-2 font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-gray-100 dark:border-zinc-800">
                  <td className="px-3 py-2 font-mono text-xs">{r.day}</td>
                  <td className="px-3 py-2">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  if (typeof trend === 'object') {
    return <BreakdownTable title="Trend (object)" obj={trend} />;
  }
  return null;
}

function DetailGrid({ data }) {
  if (!data || typeof data !== 'object') return <p className="text-sm text-gray-500">No detail.</p>;
  const skip = new Set(['__v']);
  const entries = Object.entries(data).filter(([k]) => !skip.has(k));
  return (
    <dl className="grid max-h-[60vh] gap-2 overflow-y-auto text-sm sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-gray-500 dark:text-zinc-400">{k}</dt>
          <dd className="break-all font-mono text-xs text-gray-900 dark:text-zinc-100">
            {v != null && typeof v === 'object' ? (
              <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-2 text-[11px] dark:bg-zinc-900">{JSON.stringify(v, null, 2)}</pre>
            ) : (
              String(v)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const FILTER_MODES = [
  { id: 'all', label: 'All reports' },
  { id: 'user', label: 'By user' },
  { id: 'post', label: 'By post' },
  { id: 'reel', label: 'By reel' },
];

export default function ReportsPage() {
  const [filterMode, setFilterMode] = useState('all');
  const [filterId, setFilterId] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsErr, setStatsErr] = useState('');
  const [err, setErr] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsErr('');
    try {
      const res = await AuthService.adminReportsStats();
      if (isApiError(res)) {
        setStats(null);
        setStatsErr(res.message || 'Stats request failed');
        return;
      }
      setStats(extractStatsPayload(res));
    } catch (e) {
      setStats(null);
      setStatsErr(e?.message || 'Stats request failed');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadList = useCallback(
    async (page = 1) => {
      setLoading(true);
      setErr('');
      try {
        let res;
        const id = filterId.trim();
        if (filterMode === 'user') {
          if (!id) {
            setErr('Enter a user id');
            setRows([]);
            setLoading(false);
            return;
          }
          res = await AuthService.adminReportsByUser(id);
        } else if (filterMode === 'post') {
          if (!id) {
            setErr('Enter a post id');
            setRows([]);
            setLoading(false);
            return;
          }
          res = await AuthService.adminReportsByPost(id);
        } else if (filterMode === 'reel') {
          if (!id) {
            setErr('Enter a reel id');
            setRows([]);
            setLoading(false);
            return;
          }
          res = await AuthService.adminReportsByReel(id);
        } else {
          res = await AuthService.adminReportsList({ page, limit: 20 });
        }

        if (isApiError(res)) {
          setErr(res.message || 'Failed to load reports');
          setRows([]);
          return;
        }

        const list = extractReportsList(res);
        setRows(list);
        if (filterMode === 'all') {
          const m = extractReportsListMeta(res, { requestedPage: page, requestedLimit: 20 });
          setMeta(m);
        } else {
          setMeta({ page: 1, pages: 1, total: list.length });
        }
      } catch (e) {
        setErr(e?.message || 'Failed to load reports');
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [filterMode, filterId]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadList(1);
  }, [filterMode]);

  const applyFilter = () => {
    loadList(1);
  };

  const openDetail = async (row) => {
    const id = reportRowId(row);
    if (!id) {
      setDetail(row);
      return;
    }
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await AuthService.adminGetReport(id);
      if (isApiError(res)) {
        setErr(res.message || 'Could not load report');
        setDetail(row);
      } else {
        const payload = res?.data && typeof res.data === 'object' ? res.data : res;
        const full = payload?.report ?? (payload?._id || payload?.id ? payload : null) ?? row;
        setDetail(full && typeof full === 'object' ? full : row);
      }
    } catch (e) {
      setErr(e?.message || 'Could not load report');
      setDetail(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalHint = useMemo(() => {
    if (!stats || typeof stats !== 'object') return null;
    const t = stats.total ?? stats.totalCount ?? stats.count;
    const p = stats.pending ?? stats.pendingCount ?? stats.openCount;
    return { total: t, pending: p };
  }, [stats]);

  const trendData = useMemo(() => {
    if (!stats || typeof stats !== 'object') return null;
    return stats.trend ?? stats.trends ?? stats.last7Days ?? stats.sevenDayTrend ?? stats.lastSevenDays ?? null;
  }, [stats]);

  return (
    <PageShell>
      <PageHeader
        title="Reports"
        description="Trust & safety — overview stats, full list, and filters by user, post, or reel."
      />

      <Card className="shadow-lg" padding="p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Overview</h2>
          <Button type="button" variant="secondary" className="text-xs" onClick={() => loadStats()}>
            Refresh stats
          </Button>
        </div>
        {statsLoading ? (
          <ReportsOverviewSkeleton />
        ) : !stats ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-500 dark:text-zinc-400">No stats available.</p>
            {statsErr ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                {statsErr}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {totalHint?.total != null ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Total</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-zinc-100">{totalHint.total}</p>
                </div>
              ) : null}
              {totalHint?.pending != null ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Pending</p>
                  <p className="mt-1 text-2xl font-bold text-amber-950 dark:text-amber-100">{totalHint.pending}</p>
                </div>
              ) : null}
            </div>
            <BreakdownTable title="By status" obj={stats.byStatus ?? stats.statusCounts ?? stats.by_status} />
            <BreakdownTable title="By type" obj={stats.byType ?? stats.typeCounts ?? stats.by_type} />
            <BreakdownTable title="By reason" obj={stats.byReason ?? stats.reasonCounts ?? stats.by_reason} />
            <TrendBlock trend={trendData} />
          </div>
        )}
      </Card>

      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">List</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTER_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setFilterMode(m.id);
                setErr('');
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filterMode === m.id
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {filterMode !== 'all' ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="min-w-[12rem] flex-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
              {filterMode === 'user' ? 'User ID' : filterMode === 'post' ? 'Post ID' : 'Reel ID'}
              <input
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="ObjectId"
              />
            </label>
            <Button type="button" variant="primary" onClick={applyFilter} disabled={loading}>
              Load
            </Button>
          </div>
        ) : null}
      </Card>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {err}
        </div>
      ) : null}

      <div className="hidden md:block">
        <DataTable>
          <THead>
            <tr>
              <Th>Target</Th>
              <Th>Category / reason</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th className="text-right">Open</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <DataTableSkeleton rows={8} cols={5} />
            ) : rows.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-8 text-center text-gray-500">
                  No reports.
                </Td>
              </Tr>
            ) : (
              rows.map((r) => {
                const id = reportRowId(r);
                return (
                  <Tr key={id || JSON.stringify(r).slice(0, 40)}>
                    <Td>
                      <button
                        type="button"
                        className="text-left text-sm text-blue-600 hover:underline dark:text-blue-400"
                        onClick={() => openDetail(r)}
                      >
                        {reportTargetLabel(r)}
                      </button>
                      {id ? <p className="mt-0.5 font-mono text-[10px] text-gray-400 dark:text-zinc-500">{id}</p> : null}
                    </Td>
                    <Td>
                      <Badge tone="warning" className="capitalize">
                        {reportCategoryLabel(r)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={toneForStatus(reportStatusLabel(r))} className="capitalize">
                        {reportStatusLabel(r)}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-gray-600 dark:text-zinc-400">{fmtDateTime(r.createdAt)}</Td>
                    <Td className="text-right">
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        onClick={() => openDetail(r)}
                      >
                        Details
                      </button>
                    </Td>
                  </Tr>
                );
              })
            )}
          </TBody>
        </DataTable>
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          <SimpleStackedCardSkeleton count={5} />
        ) : rows.length === 0 ? (
          <Card className="shadow-md" padding="p-6">
            <p className="text-center text-sm text-gray-500">No reports.</p>
          </Card>
        ) : (
          rows.map((r, idx) => {
            const id = reportRowId(r);
            return (
              <Card key={id || `r-${idx}`} className="shadow-md" padding="p-4">
                <button type="button" className="w-full text-left text-sm text-blue-600 dark:text-blue-400" onClick={() => openDetail(r)}>
                  {reportTargetLabel(r)}
                </button>
                {id ? <p className="mt-1 font-mono text-[10px] text-gray-400">{id}</p> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="warning" className="capitalize">
                    {reportCategoryLabel(r)}
                  </Badge>
                  <Badge tone={toneForStatus(reportStatusLabel(r))} className="capitalize">
                    {reportStatusLabel(r)}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-gray-500">{fmtDateTime(r.createdAt)}</p>
              </Card>
            );
          })
        )}
      </div>

      {filterMode === 'all' ? (
        <PaginationBar page={meta.page} pages={meta.pages} onPageChange={loadList} disabled={loading} />
      ) : null}

      <Modal
        open={!!detail || detailLoading}
        onClose={() => !detailLoading && setDetail(null)}
        title="Report details"
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" disabled={detailLoading} onClick={() => setDetail(null)}>
              Close
            </Button>
            {detail && typeof detail === 'object' ? (
              <>
                {detail.reportedUserId || detail.userId || detail.targetUserId ? (
                  <Button as={Link} variant="secondary" to={`/users/${detail.reportedUserId || detail.userId || detail.targetUserId}`}>
                    User
                  </Button>
                ) : null}
                {detail.postId || (detail.targetType === 'post' && detail.targetId) ? (
                  <Button as={Link} variant="secondary" to={`/posts/${detail.postId || detail.targetId}`}>
                    Post
                  </Button>
                ) : null}
                {detail.reelId || (detail.targetType === 'reel' && detail.targetId) ? (
                  <Button as={Link} variant="secondary" to={`/reels/${detail.reelId || detail.targetId}`}>
                    Reel
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        }
      >
        {detailLoading ? <ReportDetailModalSkeleton /> : null}
        {!detailLoading && detail ? <DetailGrid data={detail} /> : null}
      </Modal>
    </PageShell>
  );
}
