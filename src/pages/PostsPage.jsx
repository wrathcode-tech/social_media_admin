import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import { DataTableSkeleton, MediaRowCardSkeleton } from '../components/ui/Skeleton';
import PaginationBar from '../components/ui/PaginationBar';
import MediaThumb from '../components/ui/MediaThumb';
import { contentThumbUrl, userAvatarUrl } from '../lib/placeholders';
import { useToast } from '../context/ToastContext';
import { confirmDestructive } from '../utils/confirmDestructive';
import {
  deriveModerationFlags,
  filterPostsClientSide,
  normalizePostsListResponse,
  postListPreview,
  postListStatsLine,
  postRowId,
} from './postsUtils';

function fmtDateTime(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

export default function PostsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: undefined });
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [moderateOpen, setModerateOpen] = useState(false);
  const [moderateTargetId, setModerateTargetId] = useState('');
  const [moderateDraft, setModerateDraft] = useState({ hidden: false, sensitive: false, restricted: false });
  const [moderateSaving, setModerateSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await AuthService.adminListPosts({
          page,
          limit: 15,
          userId: userFilter.trim(),
          from: dateFrom,
          to: dateTo,
          status: statusFilter.trim(),
        });
        if (res && typeof res === 'object' && res.success === false) {
          setErr(res.message || 'Failed to load posts');
          setRows([]);
          return;
        }
        const { list, meta: m } = normalizePostsListResponse(res, { requestedPage: page, requestedLimit: 15 });
        setRows(list);
        setMeta(m);
        setErr('');
      } catch (e) {
        setErr(e?.message || 'Failed to load posts');
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [userFilter, dateFrom, dateTo, statusFilter]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const displayRows = useMemo(() => filterPostsClientSide(rows, search), [rows, search]);

  const preview = (row) => postListPreview(row);

  const openModerate = (row) => {
    const id = postRowId(row);
    if (!id) return;
    setModerateTargetId(id);
    setModerateDraft(deriveModerationFlags(row));
    setModerateOpen(true);
  };

  const submitModerate = async (e) => {
    e.preventDefault();
    if (!moderateTargetId) return;
    const ok = await confirmDestructive({
      title: 'Apply moderation changes?',
      text: 'Updates hidden, sensitive, and restricted settings for this post.',
      confirmButtonText: 'Save changes',
      confirmButtonColor: '#2563eb',
      icon: 'question',
    });
    if (!ok) return;
    setModerateSaving(true);
    try {
      const res = await AuthService.adminModeratePost(moderateTargetId, {
        hidden: moderateDraft.hidden,
        sensitive: moderateDraft.sensitive,
        restricted: moderateDraft.restricted,
      });
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Moderate failed');
      }
      setModerateOpen(false);
      toast('Post updated', 'success');
      await load(meta.page);
    } catch (e2) {
      toast(e2?.message || 'Could not moderate post', 'error');
    } finally {
      setModerateSaving(false);
    }
  };

  const doRestore = async (id) => {
    try {
      const res = await AuthService.adminRestorePost(id);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Restore failed');
      }
      toast('Post restored', 'success');
      await load(meta.page);
    } catch (e) {
      toast(e?.message || 'Could not restore', 'error');
    }
  };

  const del = async (id) => {
    const ok = await confirmDestructive({
      title: 'Permanently delete this post?',
      text: 'This cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!ok) return;
    try {
      const res = await AuthService.adminDeletePost(id);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Delete failed');
      }
      toast('Post deleted', 'success');
      await load(meta.page);
    } catch (e) {
      toast(e?.message || 'Could not delete', 'error');
    }
  };

  const canRestore = (row) => {
    const st = String(row?.status || '').toLowerCase();
    return st === 'deleted' || st === 'hidden' || row?.isDeleted === true || row?.deletedAt;
  };

  const statusTone = (st) => {
    const s = String(st || '').toLowerCase();
    if (s === 'deleted') return 'danger';
    if (s === 'hidden' || s === 'removed') return 'warning';
    if (s === 'active' || s === 'published') return 'success';
    return 'default';
  };

  return (
    <PageShell>
      <PageHeader title="Posts" description="Feed posts — list, moderate, restore, or delete via admin API." />
      <Card className="shadow-lg" padding="p-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            Search (this page)
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Caption, author, or post id"
            />
          </label>
        </div>
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
              <Th>Preview</Th>
              <Th>Author</Th>
              <Th>Engagement</Th>
              <Th>Posted</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <DataTableSkeleton rows={8} cols={6} />
            ) : rows.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-8 text-center text-gray-500">
                  No posts found.
                </Td>
              </Tr>
            ) : displayRows.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="py-8 text-center text-gray-500">
                  No posts match your search on this page.
                </Td>
              </Tr>
            ) : (
              displayRows.map((row) => {
                const id = postRowId(row);
                const flags = deriveModerationFlags(row);
                return (
                  <Tr key={id}>
                    <Td>
                      <div className="flex max-w-md items-start gap-3">
                        <MediaThumb
                          src={contentThumbUrl(row, 'posts')}
                          className="h-14 w-14 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-700"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs leading-snug text-gray-800 dark:text-zinc-200">{preview(row)}</p>
                          <p className="mt-1 font-mono text-[10px] leading-tight text-gray-400 dark:text-zinc-500">{id}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex max-w-[14rem] items-center gap-2">
                        <MediaThumb
                          src={userAvatarUrl(row.author || {})}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full border border-gray-200 dark:border-zinc-600"
                        />
                        <span className="min-w-0 truncate font-medium">
                          @{row.author?.username || row.authorUsername || row.user?.username || '—'}
                        </span>
                      </div>
                    </Td>
                    <Td className="text-sm text-gray-700 dark:text-zinc-300">
                      {postListStatsLine(row) || '—'}
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-gray-600 dark:text-zinc-400">{fmtDateTime(row.createdAt)}</Td>
                    <Td>
                      <Badge tone={statusTone(row.status)} className="capitalize">
                        {row.status || '—'}
                      </Badge>
                      {flags.sensitive ? (
                        <span className="ml-2">
                          <Badge tone="warning">Sensitive</Badge>
                        </span>
                      ) : null}
                      {flags.restricted ? (
                        <span className="ml-2">
                          <Badge tone="info">Restricted</Badge>
                        </span>
                      ) : null}
                      {flags.hidden ? (
                        <span className="ml-2">
                          <Badge tone="default">Hidden</Badge>
                        </span>
                      ) : null}
                    </Td>
                    <Td className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          to={`/posts/${id}`}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                          onClick={() => openModerate(row)}
                        >
                          Moderate
                        </button>
                        {canRestore(row) ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-green-700 hover:underline dark:text-green-400"
                            onClick={() => doRestore(id)}
                          >
                            Restore
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                          onClick={() => del(id)}
                        >
                          Delete
                        </button>
                      </div>
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
          <MediaRowCardSkeleton count={5} />
        ) : rows.length === 0 ? (
          <Card className="shadow-md" padding="p-6">
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400">No posts found.</p>
          </Card>
        ) : displayRows.length === 0 ? (
          <Card className="shadow-md" padding="p-6">
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
              No posts match your search on this page.
            </p>
          </Card>
        ) : (
          displayRows.map((row) => {
            const id = postRowId(row);
            const flags = deriveModerationFlags(row);
            return (
              <Card key={id} className="shadow-md" padding="p-4">
                <div className="flex gap-3">
                  <MediaThumb
                    src={contentThumbUrl(row, 'posts')}
                    className="h-16 w-16 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-3 text-xs leading-snug text-gray-800 dark:text-zinc-200">{preview(row)}</p>
                    <p className="mt-1 text-[11px] text-gray-600 dark:text-zinc-400">{postListStatsLine(row) || '—'}</p>
                    <p className="mt-1 font-mono text-[10px] text-gray-400 dark:text-zinc-500">{id}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <MediaThumb
                        src={userAvatarUrl(row.author || {})}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-full border border-gray-200 dark:border-zinc-600"
                      />
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                        @{row.author?.username || row.authorUsername || row.user?.username || '—'}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{fmtDateTime(row.createdAt)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={statusTone(row.status)} className="capitalize">
                        {row.status || '—'}
                      </Badge>
                      {flags.sensitive ? <Badge tone="warning">Sensitive</Badge> : null}
                      {flags.restricted ? <Badge tone="info">Restricted</Badge> : null}
                      {flags.hidden ? <Badge tone="default">Hidden</Badge> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3 dark:border-zinc-800">
                      <Link to={`/posts/${id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        View
                      </Link>
                      <button
                        type="button"
                        className="text-sm font-medium text-violet-600 dark:text-violet-400"
                        onClick={() => openModerate(row)}
                      >
                        Moderate
                      </button>
                      {canRestore(row) ? (
                        <button
                          type="button"
                          className="text-sm font-medium text-green-700 dark:text-green-400"
                          onClick={() => doRestore(id)}
                        >
                          Restore
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 dark:text-red-400"
                        onClick={() => del(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="space-y-1">
        <PaginationBar page={meta.page} pages={meta.pages} onPageChange={load} disabled={loading} />
        {meta.total != null && Number.isFinite(Number(meta.total)) ? (
          <p className="text-center text-xs text-gray-500 dark:text-zinc-500">
            {meta.total} post{Number(meta.total) === 1 ? '' : 's'} total
            {search.trim() ? ` · ${displayRows.length} match filter` : ` · ${rows.length} on this page`}
          </p>
        ) : null}
      </div>

      <Modal
        open={moderateOpen}
        onClose={() => !moderateSaving && setModerateOpen(false)}
        title="Moderate post"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" disabled={moderateSaving} onClick={() => setModerateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="moderate-post-form" disabled={moderateSaving}>
              {moderateSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="moderate-post-form" className="space-y-3" onSubmit={submitModerate}>
          {[
            ['hidden', 'Hidden (not visible in feed)'],
            ['sensitive', 'Sensitive / NSFW'],
            ['restricted', 'Restricted distribution'],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
                checked={moderateDraft[key]}
                onChange={(e) => setModerateDraft((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{label}</span>
            </label>
          ))}
        </form>
      </Modal>
    </PageShell>
  );
}
