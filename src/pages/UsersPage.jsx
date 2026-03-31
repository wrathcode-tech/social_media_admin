import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetUsers } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import PaginationBar from '../components/ui/PaginationBar';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import MediaThumb from '../components/ui/MediaThumb';
import { userAvatarUrl } from '../lib/placeholders';

function downloadUserCsv(rows) {
  const headers = ['username', 'email', 'followers', 'status'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map((u) =>
      [u.username, u.email, u.followersCount ?? '', u.status].map(esc).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function SortButton({ label, active, dir, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-semibold text-gray-500 transition-colors hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {label}
      <span className="text-[10px] tabular-nums text-gray-400 dark:text-zinc-500">
        {active ? (dir === 'asc' ? '▲' : '▼') : '◇'}
      </span>
    </button>
  );
}

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState(null);
  const [sortKey, setSortKey] = useState('username');
  const [sortDir, setSortDir] = useState('asc');

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminGetUsers({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      setData(res.data || []);
      setMeta(res.meta || meta);
      setErr('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'followers' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    const copy = [...data];
    const dir = sortDir === 'asc' ? 1 : -1;
    copy.sort((a, b) => {
      if (sortKey === 'followers') {
        return dir * ((a.followersCount || 0) - (b.followersCount || 0));
      }
      const va = String(a[sortKey] || '').toLowerCase();
      const vb = String(b[sortKey] || '').toLowerCase();
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const tone = (s) => (s === 'active' ? 'success' : s === 'blocked' ? 'warning' : 'default');

  return (
    <PageShell>
      <PageHeader
        title="Users"
        description="Directory, risk signals, and moderation actions"
        actions={
          <Button
            type="button"
            variant="secondary"
            disabled={loading || data.length === 0}
            onClick={() => downloadUserCsv(sorted)}
          >
            Export CSV
          </Button>
        }
      />
      <Card className="shadow-lg" padding="p-4 md:p-5">
        <form
          className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            load(1);
          }}
        >
          <label className="min-w-[200px] flex-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
            Search
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Username or email"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full min-w-[140px] rounded-xl border border-gray-300 px-3 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <Button type="submit" variant="primary">
            Apply
          </Button>
        </form>
        {!loading ? (
          <p className="mt-3 text-xs text-gray-500 dark:text-zinc-500">
            Showing {data.length} on this page · Page {meta.page} of {meta.pages}
          </p>
        ) : null}
      </Card>
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <div className="hidden md:block">
        <DataTable>
          <THead>
            <tr>
              <Th>
                <SortButton label="User" active={sortKey === 'username'} dir={sortDir} onClick={() => toggleSort('username')} />
              </Th>
              <Th>
                <SortButton label="Email" active={sortKey === 'email'} dir={sortDir} onClick={() => toggleSort('email')} />
              </Th>
              <Th>
                <SortButton
                  label="Followers"
                  active={sortKey === 'followers'}
                  dir={sortDir}
                  onClick={() => toggleSort('followers')}
                />
              </Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
            ) : sorted.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-12 text-center text-gray-500 dark:text-zinc-400">
                  No users match your filters.
                </Td>
              </Tr>
            ) : (
              sorted.map((u) => (
                <Tr key={u._id} className="group">
                  <Td>
                    <div className="flex items-center gap-3">
                      <MediaThumb
                        src={userAvatarUrl(u)}
                        className="h-10 w-10 shrink-0 rounded-xl border border-gray-200 shadow-inner dark:border-zinc-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-zinc-50">@{u.username}</div>
                        <div className="text-xs text-gray-400 dark:text-zinc-500">ID …{String(u._id).slice(-6)}</div>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-gray-600 dark:text-zinc-400">{u.email}</Td>
                  <Td className="tabular-nums font-medium">{u.followersCount?.toLocaleString?.() ?? u.followersCount}</Td>
                  <Td>
                    <Badge tone={tone(u.status)}>{u.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="mr-3 text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                      onClick={() => setPreview(u)}
                    >
                      Quick view
                    </button>
                    <Link
                      to={`/users/${u._id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Profile
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </DataTable>
      </div>
      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800"
            />
          ))
        ) : sorted.length === 0 ? (
          <Card className="shadow-md" padding="p-6">
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400">No users match your filters.</p>
          </Card>
        ) : (
          sorted.map((u) => (
            <Card key={u._id} className="shadow-md" padding="p-4">
              <div className="flex gap-3">
                <MediaThumb
                  src={userAvatarUrl(u)}
                  className="h-12 w-12 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-zinc-50">@{u.username}</p>
                  <p className="truncate text-sm text-gray-600 dark:text-zinc-400">{u.email}</p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">ID …{String(u._id).slice(-6)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm tabular-nums text-gray-700 dark:text-zinc-300">
                      {u.followersCount?.toLocaleString?.() ?? u.followersCount} followers
                    </span>
                    <Badge tone={tone(u.status)}>{u.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3 dark:border-zinc-800">
                    <button
                      type="button"
                      className="text-sm font-semibold text-violet-600 dark:text-violet-400"
                      onClick={() => setPreview(u)}
                    >
                      Quick view
                    </button>
                    <Link to={`/users/${u._id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Profile
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <PaginationBar page={meta.page} pages={meta.pages} onPageChange={load} disabled={loading} />

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview ? `@${preview.username}` : ''}
        footer={
          preview ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button variant="primary" as={Link} to={`/users/${preview._id}`} onClick={() => setPreview(null)}>
                Full profile
              </Button>
            </div>
          ) : null
        }
      >
        {preview ? (
          <div className="flex gap-4 border-b border-gray-100 pb-4 dark:border-zinc-800">
            <MediaThumb
              src={userAvatarUrl(preview)}
              className="h-14 w-14 shrink-0 rounded-2xl border border-gray-200 dark:border-zinc-600"
            />
            <dl className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
              <dt className="text-gray-500 dark:text-zinc-400">Email</dt>
              <dd className="font-medium text-gray-900 dark:text-zinc-100">{preview.email}</dd>
              <dt className="text-gray-500 dark:text-zinc-400">Followers</dt>
              <dd className="tabular-nums font-semibold">{preview.followersCount?.toLocaleString?.()}</dd>
              <dt className="text-gray-500 dark:text-zinc-400">Status</dt>
              <dd>
                <Badge tone={tone(preview.status)}>{preview.status}</Badge>
              </dd>
            </dl>
          </div>
        ) : null}
      </Modal>
    </PageShell>
  );
}
