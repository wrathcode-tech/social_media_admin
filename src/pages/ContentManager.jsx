import { useCallback, useEffect, useState } from 'react';
import {
  adminDeleteContent,
  adminGetContent,
  adminPatchContentHide,
  adminPatchContentSensitive,
} from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import { DataTableSkeleton, MediaRowCardSkeleton } from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import PaginationBar from '../components/ui/PaginationBar';
import MediaThumb from '../components/ui/MediaThumb';
import { contentThumbUrl } from '../lib/placeholders';
import { confirmDestructive } from '../utils/confirmDestructive';

function fmtDateTime(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

/**
 * @param {{ title: string, description?: string, segment: 'posts'|'reels'|'stories'|'comments', showSensitive?: boolean, showHide?: boolean }} props
 */
export default function ContentManager({ title, description, segment, showSensitive, showHide = true }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await adminGetContent(segment, {
          page,
          limit: 15,
          userFilter,
          dateFrom,
          dateTo,
        });
        setRows(res.data || []);
        setMeta(res.meta || { page: 1, pages: 1 });
        setErr('');
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    },
    [segment, userFilter, dateFrom, dateTo]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const preview = (row) => row.caption || row.text || row.mediaUrl || row.videoUrl || '—';

  const doHide = async (id) => {
    try {
      await adminPatchContentHide(segment, id);
      setRows((r) => r.map((x) => (x._id === id ? { ...x, status: 'hidden' } : x)));
    } catch (e) {
      setErr(e.message);
    }
  };

  const del = async (id) => {
    const ok = await confirmDestructive({
      title: 'Delete this item?',
      text: 'This removes the content from the catalog. This cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!ok) return;
    try {
      await adminDeleteContent(segment, id);
      setRows((r) => r.filter((x) => x._id !== id));
    } catch (e) {
      setErr(e.message);
    }
  };

  const markSens = async (id, isSens) => {
    try {
      await adminPatchContentSensitive(segment, id, isSens);
      setRows((r) => r.map((x) => (x._id === id ? { ...x, isSensitive: isSens } : x)));
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <PageShell>
      <PageHeader title={title} description={description || 'Filter, hide, delete, mark sensitive.'} />
      <Card className="shadow-lg" padding="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            Author (user id)
            <input
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="ObjectId"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => load(1)}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700"
            >
              Apply filters
            </button>
          </div>
        </div>
      </Card>
      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div>
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
            ) : (
              rows.map((row) => (
                <Tr key={row._id}>
                  <Td>
                    <div className="flex max-w-md items-start gap-3">
                      <MediaThumb
                        src={contentThumbUrl(row, segment)}
                        className="h-14 w-14 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-700"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs leading-snug text-gray-700 dark:text-zinc-300">
                        {preview(row)}
                      </span>
                    </div>
                  </Td>
                  <Td className="font-medium">@{row.author?.username || row.author || '—'}</Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600 dark:text-zinc-400">{fmtDateTime(row.createdAt)}</Td>
                  <Td>
                    <Badge tone="default" className="capitalize">
                      {row.status}
                    </Badge>
                    {row.isSensitive ? (
                      <span className="ml-2">
                        <Badge tone="danger">Sensitive</Badge>
                      </span>
                    ) : null}
                  </Td>
                  <Td className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {showHide && segment !== 'comments' ? (
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                          onClick={() => doHide(row._id)}
                        >
                          Hide
                        </button>
                      ) : null}
                      {showSensitive ? (
                        <button
                          type="button"
                          className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                          onClick={() => markSens(row._id, !row.isSensitive)}
                        >
                          {row.isSensitive ? 'Unmark' : 'Sensitive'}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                        onClick={() => del(row._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </DataTable>
      </div>
      <div className="space-y-3 md:hidden">
        {loading ? (
          <MediaRowCardSkeleton count={5} />
        ) : (
          rows.map((row) => (
            <Card key={row._id} className="shadow-md" padding="p-4">
              <div className="flex gap-3">
                <MediaThumb
                  src={contentThumbUrl(row, segment)}
                  className="h-16 w-16 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-3 text-xs leading-snug text-gray-700 dark:text-zinc-300">{preview(row)}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-zinc-100">
                    @{row.author?.username || row.author || '—'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{fmtDateTime(row.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="default" className="capitalize">
                      {row.status}
                    </Badge>
                    {row.isSensitive ? <Badge tone="danger">Sensitive</Badge> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3 dark:border-zinc-800">
                    {showHide && segment !== 'comments' ? (
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400"
                        onClick={() => doHide(row._id)}
                      >
                        Hide
                      </button>
                    ) : null}
                    {showSensitive ? (
                      <button
                        type="button"
                        className="text-sm font-medium text-amber-700 dark:text-amber-400"
                        onClick={() => markSens(row._id, !row.isSensitive)}
                      >
                        {row.isSensitive ? 'Unmark' : 'Sensitive'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="text-sm font-medium text-red-600 dark:text-red-400"
                      onClick={() => del(row._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <PaginationBar page={meta.page} pages={meta.pages} onPageChange={load} disabled={loading} />
    </PageShell>
  );
}
