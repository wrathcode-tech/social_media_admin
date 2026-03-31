import { useEffect, useState } from 'react';
import { adminGetLogs } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
export default function LogsPage() {
  const [tab, setTab] = useState('admin');
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await adminGetLogs(tab, 40);
        if (!c) {
          setRows(res.data || []);
          setErr('');
        }
      } catch (e) {
        if (!c) setErr(e.message);
      }
    })();
    return () => {
      c = true;
    };
  }, [tab]);

  return (
    <PageShell>
      <PageHeader title="Logs" description="Admin, user activity, deletions." />
      <div className="flex flex-wrap gap-2">
        {['admin', 'users', 'deleted'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-all duration-200 ${
              tab === t ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
            }`}
          >
            {t === 'deleted' ? 'Deleted content' : `${t} logs`}
          </button>
        ))}
      </div>
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <Card className="shadow-lg" padding="p-0 overflow-hidden">
        <div className="hidden md:block">
          <DataTable className="rounded-none border-0 shadow-none">
            <THead>
              <tr>
                <Th>Entry</Th>
                <Th>When</Th>
              </tr>
            </THead>
            <TBody>
              {rows.map((r) => (
                <Tr key={r._id}>
                  <Td className="max-w-xl font-mono text-xs">
                    {tab === 'admin' && (
                      <>
                        {r.action} · {r.actorAdmin?.email}
                      </>
                    )}
                    {tab === 'users' && (
                      <>
                        {r.user?.username} · {r.action}
                      </>
                    )}
                    {tab === 'deleted' && (
                      <>
                        {r.contentType} · {String(r.contentId)}
                      </>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-gray-500 dark:text-zinc-400">{new Date(r.createdAt).toLocaleString()}</Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {rows.map((r) => (
            <Card key={r._id} className="shadow-md" padding="p-4">
              <p className="font-mono text-xs leading-relaxed text-gray-800 dark:text-zinc-200">
                {tab === 'admin' && (
                  <>
                    {r.action} · {r.actorAdmin?.email}
                  </>
                )}
                {tab === 'users' && (
                  <>
                    {r.user?.username} · {r.action}
                  </>
                )}
                {tab === 'deleted' && (
                  <>
                    {r.contentType} · {String(r.contentId)}
                  </>
                )}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">{new Date(r.createdAt).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
