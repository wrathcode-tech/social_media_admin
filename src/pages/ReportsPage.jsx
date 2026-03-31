import { useCallback, useEffect, useState } from 'react';
import { adminGetReportsList, adminPatchReportAction } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import PaginationBar from '../components/ui/PaginationBar';
export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [detail, setDetail] = useState(null);

  const load = useCallback(
    async (page = 1) => {
      try {
        const res = await adminGetReportsList({
          page,
          limit: 20,
          category,
          status,
        });
        setRows(res.data || []);
        setMeta(res.meta || { page: 1, pages: 1 });
        setErr('');
      } catch (e) {
        setErr(e.message);
      }
    },
    [category, status]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const takeAction = async (id, actionTaken) => {
    try {
      await adminPatchReportAction(id, { actionTaken, status: 'resolved' });
      await load(meta.page);
      setDetail((d) => (d && d._id === id ? { ...d, status: 'resolved', actionTaken } : d));
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <PageShell>
      <PageHeader title="Reports" description="Trust & safety queue." />
      <Card className="shadow-lg" padding="p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="">All types</option>
            <option value="spam">Spam</option>
            <option value="nude">Nude</option>
            <option value="harassment">Harassment</option>
            <option value="fake">Fake</option>
            <option value="other">Other</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </Card>
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <div className="hidden md:block">
        <DataTable>
          <THead>
            <tr>
              <Th>Target</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {rows.map((r) => (
              <Tr key={r._id}>
                <Td>
                  <button
                    type="button"
                    className="text-left font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
                    onClick={() => setDetail(r)}
                  >
                    {r.targetType} ·…{String(r.targetId).slice(-6)}
                  </button>
                </Td>
                <Td>
                  <Badge tone="warning">{r.category}</Badge>
                </Td>
                <Td className="capitalize">{r.status}</Td>
                <Td className="text-right">
                  {r.status !== 'resolved' ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        type="button"
                        className="rounded-xl bg-yellow-400 px-2 py-1 text-xs font-semibold text-yellow-950 shadow-sm transition-colors hover:bg-yellow-500"
                        onClick={() => takeAction(r._id, 'warn')}
                      >
                        Warn
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                        onClick={() => takeAction(r._id, 'suspend')}
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                        onClick={() => takeAction(r._id, 'ban')}
                      >
                        Ban
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-rose-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
                        onClick={() => takeAction(r._id, 'remove')}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">{r.actionTaken}</span>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </DataTable>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <Card key={r._id} className="shadow-md" padding="p-4">
            <button
              type="button"
              className="w-full text-left font-mono text-xs text-blue-600 dark:text-blue-400"
              onClick={() => setDetail(r)}
            >
              {r.targetType} ·…{String(r.targetId).slice(-6)}
            </button>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="warning">{r.category}</Badge>
              <span className="text-sm capitalize text-gray-700 dark:text-zinc-300">{r.status}</span>
            </div>
            {r.status !== 'resolved' ? (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  className="rounded-xl bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-yellow-950"
                  onClick={() => takeAction(r._id, 'warn')}
                >
                  Warn
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                  onClick={() => takeAction(r._id, 'suspend')}
                >
                  Suspend
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                  onClick={() => takeAction(r._id, 'ban')}
                >
                  Ban
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                  onClick={() => takeAction(r._id, 'remove')}
                >
                  Delete
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">{r.actionTaken}</p>
            )}
          </Card>
        ))}
      </div>
      <PaginationBar page={meta.page} pages={meta.pages} onPageChange={load} />

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Report details"
        size="lg"
        footer={
          detail && detail.status !== 'resolved' ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setDetail(null)}>
                Close
              </Button>
              <button
                type="button"
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-950 hover:bg-yellow-500"
                onClick={() => takeAction(detail._id, 'warn')}
              >
                Warn
              </button>
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => takeAction(detail._id, 'suspend')}
              >
                Suspend
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => takeAction(detail._id, 'ban')}
              >
                Ban
              </button>
              <button
                type="button"
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                onClick={() => takeAction(detail._id, 'remove')}
              >
                Delete content
              </button>
            </div>
          ) : (
            <Button variant="secondary" type="button" onClick={() => setDetail(null)}>
              Close
            </Button>
          )
        }
      >
        {detail ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <dt className="text-gray-500 dark:text-zinc-400">Target type</dt>
            <dd className="font-medium">{detail.targetType}</dd>
            <dt className="text-gray-500 dark:text-zinc-400">Target id</dt>
            <dd className="break-all font-mono text-xs">{String(detail.targetId)}</dd>
            <dt className="text-gray-500 dark:text-zinc-400">Category</dt>
            <dd>
              <Badge tone="warning">{detail.category}</Badge>
            </dd>
            <dt className="text-gray-500 dark:text-zinc-400">Status</dt>
            <dd className="capitalize">{detail.status}</dd>
          </dl>
        ) : null}
      </Modal>
    </PageShell>
  );
}
