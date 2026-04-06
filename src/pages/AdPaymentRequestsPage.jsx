import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAdPaymentRequests, adminPatchAdPaymentRequest } from '../api/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { userAvatarUrl } from '../lib/placeholders';
import { useToast } from '../context/ToastContext';

function fmtWhen(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdPaymentRequestsPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState('');
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await adminGetAdPaymentRequests({ status: filter });
      setRows(res.data || []);
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, status) => {
    setBusyId(id);
    try {
      await adminPatchAdPaymentRequest(id, { status });
      await load();
      toast(status === 'approved' ? 'Payment verified — wallet credited' : 'Request rejected', 'success');
    } catch (e) {
      toast(e.message || 'Update failed', 'error');
    } finally {
      setBusyId('');
    }
  };

  const tone = (s) => (s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning');

  return (
    <PageShell>
      <PageHeader
        title="Ad payment requests"
        description="Top-ups initiated by users in the app for promoted content. Approve after payment is confirmed; funds credit the user wallet."
      />
      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {err}
        </div>
      ) : null}

      <Card className="shadow-lg" padding="p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {filter === 'pending' ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-zinc-100">{rows.length}</span> pending
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-900 dark:text-zinc-100">{rows.length}</span> request(s) in view
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value || 'all'}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-blue-600 text-white dark:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="shadow-lg" padding="p-0 overflow-hidden">
        <div className="hidden md:block">
          <DataTable className="rounded-none border-0 shadow-none">
            <THead>
              <tr>
                <Th>User</Th>
                <Th>Amount</Th>
                <Th>Purpose</Th>
                <Th>Reference</Th>
                <Th>Requested</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="py-12 text-center text-gray-500 dark:text-zinc-400">
                    No requests in this filter.
                  </Td>
                </Tr>
              ) : (
                rows.map((r) => (
                  <Tr key={r._id}>
                    <Td>
                      <Link
                        to={`/users/${r.user?._id}`}
                        className="flex items-center gap-3 font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <MediaThumb
                          src={userAvatarUrl(r.user || {})}
                          className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
                        />
                        @{r.user?.username}
                      </Link>
                    </Td>
                    <Td className="tabular-nums font-semibold">
                      {Number(r.amount).toLocaleString()} {r.currency}
                    </Td>
                    <Td className="text-gray-700 dark:text-zinc-300">{r.purpose || '—'}</Td>
                    <Td className="max-w-[140px] truncate font-mono text-xs text-gray-500 dark:text-zinc-400" title={r.externalRef}>
                      {r.externalRef || '—'}
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-gray-600 dark:text-zinc-400">{fmtWhen(r.createdAt)}</Td>
                    <Td>
                      <Badge tone={tone(r.status)}>{r.status}</Badge>
                      {r.status === 'rejected' && r.rejectReason ? (
                        <p className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-400">{r.rejectReason}</p>
                      ) : null}
                    </Td>
                    <Td className="text-right">
                      {r.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            className="px-3 py-1.5 text-xs"
                            disabled={busyId === r._id}
                            onClick={() => act(r._id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                            disabled={busyId === r._id}
                            onClick={() => act(r._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-zinc-500">{fmtWhen(r.processedAt)}</span>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </DataTable>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-zinc-400">No requests in this filter.</p>
          ) : (
            rows.map((r) => (
              <Card key={r._id} className="shadow-md" padding="p-4">
                <Link
                  to={`/users/${r.user?._id}`}
                  className="flex items-center gap-3 text-blue-600 dark:text-blue-400"
                >
                  <MediaThumb
                    src={userAvatarUrl(r.user || {})}
                    className="h-11 w-11 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
                  />
                  <span className="font-semibold">@{r.user?.username}</span>
                </Link>
                <p className="mt-2 text-lg tabular-nums font-bold text-gray-900 dark:text-zinc-50">
                  {Number(r.amount).toLocaleString()} {r.currency}
                </p>
                {r.purpose ? <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">{r.purpose}</p> : null}
                {r.externalRef ? (
                  <p className="mt-1 break-all font-mono text-xs text-gray-500 dark:text-zinc-500">{r.externalRef}</p>
                ) : null}
                <p className="mt-2 text-xs text-gray-500 dark:text-zinc-500">Requested {fmtWhen(r.createdAt)}</p>
                <Badge tone={tone(r.status)} className="mt-2">
                  {r.status}
                </Badge>
                {r.status === 'pending' ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                    <Button
                      type="button"
                      variant="primary"
                      className="flex-1 text-sm"
                      disabled={busyId === r._id}
                      onClick={() => act(r._id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1 border-red-200 text-sm text-red-700 dark:border-red-900/50 dark:text-red-400"
                      disabled={busyId === r._id}
                      onClick={() => act(r._id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                ) : r.rejectReason ? (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{r.rejectReason}</p>
                ) : null}
              </Card>
            ))
          )}
        </div>
      </Card>
    </PageShell>
  );
}
