import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { userAvatarUrl } from '../lib/placeholders';
import AuthService from '../api/services/AuthService';
import CustomDataTable from '../utils/DataTable';
import { MediaRowCardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

function IconCopy({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function userRowId(u) {
  if (!u) return '';
  return String(u._id ?? u.id ?? '');
}

function deriveUserStatus(u) {
  if (!u || typeof u !== 'object') return 'active';
  // Ban flags must win over a stale/default status string from the API.
  if (u.isBanned === true || u.banned === true) return 'blocked';

  const raw = u.status ?? u.accountStatus ?? u.userStatus ?? u.state;
  const s = raw != null ? String(raw).trim().toLowerCase() : '';
  if (s && ['blocked', 'banned', 'ban', 'suspended', 'suspend'].includes(s)) return 'blocked';
  if (s && (s.includes('bann') || s.includes('suspend'))) return 'blocked';

  if (u.isActive === false || s === 'inactive') return 'inactive';
  if (!s || s === 'active' || s === 'verified' || s === 'ok') return 'active';
  return raw != null ? String(raw) : 'active';
}

/** Align list rows with Status dropdown when the API ignores or mis-sends the filter. */
function filterUsersByStatusFilter(list, statusFilter) {
  if (!statusFilter) return list;
  return list.filter((u) => {
    const st = deriveUserStatus(u);
    if (statusFilter === 'blocked') return st === 'blocked';
    if (statusFilter === 'active') return st !== 'blocked';
    return true;
  });
}

function normalizeAdminUserRow(u) {
  if (!u || typeof u !== 'object') return u;
  const id = u._id ?? u.id;
  return { ...u, _id: id, id, status: deriveUserStatus(u) };
}

function downloadUserCsv(rows) {
  const headers = ['username', 'email', 'fullName', 'followers', 'status'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map((u) =>
      [u.username, u.email, u.fullName ?? '', u.followersCount ?? '', u.status].map(esc).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function extractUsersArrayFromResponse(res) {
  if (!res || typeof res !== 'object') return [];
  const raw = res.data;
  const candidates = [
    raw?.users,
    Array.isArray(raw?.data) ? raw.data : raw?.data?.users,
    raw?.data?.users,
    raw?.data?.data?.users,
    Array.isArray(raw) ? raw : null,
    res.result?.users,
    res.payload?.users,
    res.users,
  ];
  let emptyFallback = null;
  for (const c of candidates) {
    if (!Array.isArray(c)) continue;
    if (c.length > 0) return c;
    if (emptyFallback === null) emptyFallback = c;
  }
  return emptyFallback || [];
}

function normalizeUserListResponse(res, { requestedPage = 1, requestedLimit = 10 } = {}) {
  const raw = res?.data;
  const inner =
    raw && typeof raw === 'object' && !Array.isArray(raw) && raw.data != null && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? raw.data
      : null;

  let list = extractUsersArrayFromResponse(res);

  if (list.length === 0) {
    if (Array.isArray(raw)) list = raw;
    else if (Array.isArray(raw?.users)) list = raw.users;
    else if (Array.isArray(inner?.users)) list = inner.users;
    else if (Array.isArray(raw?.data)) list = raw.data;
    else if (Array.isArray(inner?.data)) list = inner.data;
  }

  list = list.map((u) => normalizeAdminUserRow(u)).filter((u) => u && typeof u === 'object');

  const pag = res?.pagination ?? raw?.pagination ?? inner?.pagination ?? {};
  const metaSrc = {
    ...(typeof pag === 'object' ? pag : {}),
    ...(res?.meta && typeof res.meta === 'object' ? res.meta : {}),
    ...(raw?.meta && typeof raw.meta === 'object' ? raw.meta : {}),
  };

  const limit = Number(metaSrc.limit ?? res?.limit ?? requestedLimit) || requestedLimit;
  const page = Number(metaSrc.page ?? res?.page ?? raw?.page ?? requestedPage) || requestedPage;
  const total =
    metaSrc.total ??
    metaSrc.totalCount ??
    res?.total ??
    res?.totalCount ??
    raw?.total ??
    raw?.totalCount ??
    inner?.total ??
    inner?.totalCount;

  let pages = metaSrc.pages ?? metaSrc.totalPages;
  if (pages == null && total != null && Number.isFinite(Number(total))) {
    pages = Math.max(1, Math.ceil(Number(total) / limit));
  }
  if (pages == null) {
    if (list.length >= limit) pages = page + 1;
    else pages = Math.max(1, page);
  }

  const meta = {
    page,
    pages: Math.max(1, Number(pages) || 1),
    limit,
    ...(total != null ? { total: Number(total) } : {}),
    ...(res?.count != null ? { count: res.count } : {}),
  };

  return { list, meta };
}

function fmtDateTime(iso) {
  if (iso == null || iso === '') return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function UsersPage() {
  const { toast } = useToast();
  const [userListData, setUserListData] = useState([]);
  const [userListMeta, setUserListMeta] = useState({ page: 1, pages: 1 });
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, itemsPerPage]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await AuthService.userList({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          status: statusFilter,
        });
        if (!alive) return;
        const { list, meta } = normalizeUserListResponse(res, {
          requestedPage: currentPage,
          requestedLimit: itemsPerPage,
        });
        if (res && typeof res === 'object' && res.success === false) {
          setUserListData([]);
          setErr(res?.message || 'Something went wrong');
          return;
        }
        setUserListData(filterUsersByStatusFilter(list, statusFilter));
        setUserListMeta(meta);
        if (meta.total != null && Number.isFinite(Number(meta.total))) {
          setTotalUsers(Number(meta.total));
        } else {
          setTotalUsers(0);
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || 'Failed to fetch users');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter]);

  const pageCount = useMemo(() => {
    if (totalUsers > 0 && itemsPerPage > 0) {
      return Math.max(1, Math.ceil(totalUsers / itemsPerPage));
    }
    return Math.max(1, userListMeta.pages ?? 1);
  }, [totalUsers, itemsPerPage, userListMeta.pages]);

  const columns = useMemo(() => {
    const skip = (currentPage - 1) * itemsPerPage;
    const copyId = async (row) => {
      const id = userRowId(row);
      if (!id) return;
      try {
        await navigator.clipboard.writeText(id);
        toast('User ID copied', 'success');
      } catch {
        toast('Could not copy', 'error');
      }
    };
    return [
      {
        name: 'Sr.',
        width: '56px',
        center: true,
        sortable: false,
        selector: (_row, i) => skip + i + 1,
      },
      {
        name: 'User ID',
        width: '200px',
        wrap: true,
        sortable: false,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/users/${userRowId(row)}`}
              className="font-mono text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {(userRowId(row) || '—').slice(0, 8).toUpperCase()}…
            </Link>
            <button
              type="button"
              aria-label="Copy user id"
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              onClick={() => copyId(row)}
            >
              <IconCopy className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        name: 'User',
        minWidth: '220px',
        sortable: false,
        cell: (row) => (
          <div className="flex items-center gap-2 py-0.5">
            <MediaThumb
              src={userAvatarUrl(row)}
              className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
            />
            <span className="font-medium text-gray-900 dark:text-zinc-100">@{row.username || '—'}</span>
          </div>
        ),
      },
      {
        name: 'Full name',
        minWidth: '140px',
        sortable: false,
        selector: (row) => row.fullName || '—',
      },
      {
        name: 'Email',
        minWidth: '200px',
        wrap: true,
        sortable: false,
        selector: (row) => row.email || '—',
      },
      {
        name: 'Followers',
        right: true,
        width: '100px',
        sortable: false,
        selector: (row) =>
          row.followersCount != null ? Number(row.followersCount).toLocaleString() : '—',
      },
      {
        name: 'Following',
        right: true,
        width: '100px',
        sortable: false,
        selector: (row) =>
          row.followingCount != null ? Number(row.followingCount).toLocaleString() : '—',
      },
      {
        name: 'Status',
        width: '120px',
        sortable: false,
        cell: (row) => <Badge>{row.status}</Badge>,
      },
      {
        name: 'Joined',
        width: '160px',
        sortable: false,
        selector: (row) => fmtDateTime(row.createdAt),
      },
      {
        name: 'Last login',
        width: '160px',
        sortable: false,
        selector: (row) => fmtDateTime(row.lastLogin ?? row.lastLoginTime),
      },
    ];
  }, [currentPage, itemsPerPage, toast]);

  return (
    <PageShell>
      <PageHeader
        title="Users"
        description="Directory, risk signals, and moderation actions"
        actions={
          <Button
            type="button"
            variant="secondary"
            disabled={loading || userListData.length === 0}
            onClick={() => downloadUserCsv(userListData)}
          >
            Export CSV
          </Button>
        }
      />
      <Card className="shadow-lg" padding="p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
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
              className="mt-1 block w-full min-w-[160px] rounded-xl border border-gray-300 px-3 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-zinc-500">
          <span className="font-medium text-gray-700 dark:text-zinc-300">Total users</span>
          {totalUsers > 0 ? (
            <span className="ms-1 text-emerald-600 dark:text-emerald-400">({totalUsers.toLocaleString()})</span>
          ) : null}
          {!loading ? (
            <>
              {' '}
              · Showing {userListData.length} on this page · Page {currentPage} / {pageCount}
            </>
          ) : null}
        </p>
      </Card>
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900 md:block">
        <CustomDataTable columns={columns} data={userListData} pagination={false} persistTableHead progressPending={loading} />
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          <MediaRowCardSkeleton count={5} />
        ) : userListData.length === 0 ? (
          <Card className="shadow-md" padding="p-6">
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400">No users on this page.</p>
          </Card>
        ) : (
          userListData.map((row) => {
            const id = userRowId(row);
            const copyId = async () => {
              if (!id) return;
              try {
                await navigator.clipboard.writeText(id);
                toast('User ID copied', 'success');
              } catch {
                toast('Could not copy', 'error');
              }
            };
            return (
              <Card key={id || row.email} className="shadow-md" padding="p-4">
                <div className="flex gap-3">
                  <MediaThumb
                    src={userAvatarUrl(row)}
                    className="h-12 w-12 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {id ? (
                        <Link
                          to={`/users/${id}`}
                          className="text-base font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                          @{row.username || '—'}
                        </Link>
                      ) : (
                        <span className="text-base font-semibold text-gray-900 dark:text-zinc-100">@{row.username || '—'}</span>
                      )}
                      <Badge className="capitalize">{row.status}</Badge>
                    </div>
                    {row.fullName ? (
                      <p className="mt-0.5 text-sm text-gray-600 dark:text-zinc-400">{row.fullName}</p>
                    ) : null}
                    <p className="mt-1 break-all text-xs text-gray-600 dark:text-zinc-400">{row.email || '—'}</p>
                    {id ? (
                      <p className="mt-1 font-mono text-[10px] text-gray-400 dark:text-zinc-500">{id}</p>
                    ) : null}
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-3 text-xs dark:border-zinc-800">
                  <div>
                    <dt className="text-gray-500 dark:text-zinc-500">Followers</dt>
                    <dd className="font-medium text-gray-900 dark:text-zinc-100">
                      {row.followersCount != null ? Number(row.followersCount).toLocaleString() : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-zinc-500">Following</dt>
                    <dd className="font-medium text-gray-900 dark:text-zinc-100">
                      {row.followingCount != null ? Number(row.followingCount).toLocaleString() : '—'}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500 dark:text-zinc-500">Joined</dt>
                    <dd className="font-medium text-gray-900 dark:text-zinc-100">{fmtDateTime(row.createdAt)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500 dark:text-zinc-500">Last login</dt>
                    <dd className="font-medium text-gray-900 dark:text-zinc-100">
                      {fmtDateTime(row.lastLogin ?? row.lastLoginTime)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  {id ? (
                    <Link
                      to={`/users/${id}`}
                      className="inline-flex rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      View profile
                    </Link>
                  ) : null}
                  {id ? (
                    <button
                      type="button"
                      onClick={copyId}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <IconCopy className="h-4 w-4" />
                      Copy ID
                    </button>
                  ) : null}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
          Rows per page
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <ReactPaginate
          breakLabel="…"
          nextLabel="Next ›"
          previousLabel="‹ Prev"
          onPageChange={({ selected }) => setCurrentPage(selected + 1)}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          pageCount={pageCount}
          forcePage={currentPage - 1}
          renderOnZeroPageCount={null}
          containerClassName="flex flex-wrap items-center gap-1 list-none p-0"
          pageClassName="inline-block"
          pageLinkClassName="inline-flex min-w-[2.25rem] justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          activeClassName="!border-blue-500 !bg-blue-50 dark:!border-blue-600 dark:!bg-blue-950/50"
          previousClassName="inline-block"
          nextClassName="inline-block"
          previousLinkClassName="inline-flex rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          nextLinkClassName="inline-flex rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          disabledClassName="pointer-events-none opacity-40"
        />
      </div>
    </PageShell>
  );
}
