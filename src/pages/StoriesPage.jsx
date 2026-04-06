import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import { DataTableSkeleton, MediaRowCardSkeleton } from '../components/ui/Skeleton';
import PaginationBar from '../components/ui/PaginationBar';
import MediaThumb from '../components/ui/MediaThumb';
import Badge from '../components/ui/Badge';
import { contentThumbUrl } from '../lib/placeholders';
import { useToast } from '../context/ToastContext';
import { confirmDestructive } from '../utils/confirmDestructive';
import { deriveModerationFlags } from './postsUtils';
import {
  filterStoriesClientSide,
  normalizeStoriesListResponse,
  storyListPreview,
  storyRowId,
} from './storiesUtils';

function fmtDateTime(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

function statusTone(st) {
  const s = String(st || '').toLowerCase();
  if (s === 'deleted') return 'danger';
  if (s === 'hidden' || s === 'removed' || s === 'expired') return 'warning';
  if (s === 'active' || s === 'published') return 'success';
  return 'default';
}

export default function StoriesPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const { toast } = useToast();

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await AuthService.adminListStories({
          page,
          limit: 15,
          userId: userFilter.trim(),
          from: dateFrom,
          to: dateTo,
          status: statusFilter.trim(),
        });
        if (res && typeof res === 'object' && res.success === false) {
          setErr(res.message || 'Failed to load stories');
          setRows([]);
          return;
        }
        const { list, meta: m } = normalizeStoriesListResponse(res, { requestedPage: page, requestedLimit: 15 });
        setRows(list);
        setMeta(m);
        setErr('');
      } catch (e) {
        setErr(e?.message || 'Failed to load stories');
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

  const displayRows = useMemo(() => filterStoriesClientSide(rows, search), [rows, search]);

  const preview = (row) => storyListPreview(row);

  const del = async (id) => {
    const ok = await confirmDestructive({
      title: 'Permanently delete this story?',
      text: 'This cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!ok) return;
    try {
      const res = await AuthService.adminDeleteStory(id);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Delete failed');
      }
      toast('Story deleted', 'success');
      await load(meta.page);
    } catch (e) {
      toast(e?.message || 'Could not delete', 'error');
    }
  };

  return (
    <PageShell>
      <PageHeader title="Stories" description="24h stories — list, view, or permanently delete." />
      <Card className="shadow-lg" padding="p-4">
        <div>

          <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            Search (this page)
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Caption, author, or story id"
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
              <Th>Posted</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <DataTableSkeleton rows={8} cols={5} />
            ) : rows.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-8 text-center text-gray-500">
                  No stories found.
                </Td>
              </Tr>
            ) : displayRows.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-8 text-center text-gray-500">
                  No stories match your search on this page.
                </Td>
              </Tr>
            ) : (
              displayRows.map((row) => {
                const id = storyRowId(row);
                const flags = deriveModerationFlags(row);
                return (
                  <Tr key={id}>
                    <Td>
                      <div className="flex max-w-md items-start gap-3">
                        <MediaThumb
                          src={contentThumbUrl(row, 'stories')}
                          className="h-14 w-14 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-700"
                        />
                        <span className="min-w-0 flex-1 truncate text-xs leading-snug text-gray-700 dark:text-zinc-300">
                          {preview(row)}
                        </span>
                      </div>
                    </Td>
                    <Td className="font-medium">@{row.author?.username || row.authorUsername || row.user?.username || '—'}</Td>
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
                      {flags.hidden ? (
                        <span className="ml-2">
                          <Badge tone="default">Hidden</Badge>
                        </span>
                      ) : null}
                    </Td>
                    <Td className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          to={`/stories/${id}`}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View
                        </Link>
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
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400">No stories found.</p>
          </Card>
        ) : displayRows.length === 0 ? (
          <Card className="shadow-md" padding="p-6">
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
              No stories match your search on this page.
            </p>
          </Card>
        ) : (
          displayRows.map((row) => {
            const id = storyRowId(row);
            const flags = deriveModerationFlags(row);
            return (
              <Card key={id} className="shadow-md" padding="p-4">
                <div className="flex gap-3">
                  <MediaThumb
                    src={contentThumbUrl(row, 'stories')}
                    className="h-16 w-16 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-3 text-xs leading-snug text-gray-700 dark:text-zinc-300">{preview(row)}</p>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-zinc-100">
                      @{row.author?.username || row.authorUsername || row.user?.username || '—'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{fmtDateTime(row.createdAt)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={statusTone(row.status)} className="capitalize">
                        {row.status || '—'}
                      </Badge>
                      {flags.sensitive ? <Badge tone="warning">Sensitive</Badge> : null}
                      {flags.hidden ? <Badge tone="default">Hidden</Badge> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3 dark:border-zinc-800">
                      <Link to={`/stories/${id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        View
                      </Link>
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

      <PaginationBar page={meta.page} pages={meta.pages} onPageChange={load} disabled={loading} />
    </PageShell>
  );
}
