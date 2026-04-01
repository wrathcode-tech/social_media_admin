import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetFinancePayouts, adminGetFinanceTransactions, adminPatchPayout } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { userAvatarUrl } from '../lib/placeholders';

export default function FinancePage() {
  const [payouts, setPayouts] = useState([]);
  const [tx, setTx] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([adminGetFinancePayouts(30), adminGetFinanceTransactions(30)]);
        setPayouts(p.data || []);
        setTx(t.data || []);
        setErr('');
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  const updatePayout = async (id, status) => {
    try {
      await adminPatchPayout(id, { status });
      setPayouts((r) => r.map((x) => (x._id === id ? { ...x, status } : x)));
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Finance"
        description={
          <span>
            Payouts and ledger.{' '}
            <Link to="/finance/ad-payments" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              User ad payment requests →
            </Link>
          </span>
        }
      />
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <Card className="shadow-lg" padding="p-0 overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-semibold dark:text-zinc-50">Withdrawals</h2>
        </div>
        <div className="hidden md:block">
          <DataTable className="rounded-none border-0 shadow-none">
            <THead>
              <tr>
                <Th>Creator</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {payouts.map((p) => (
                <Tr key={p._id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <MediaThumb
                        src={userAvatarUrl(p.creator || {})}
                        className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
                      />
                      <span className="font-medium">@{p.creator?.username}</span>
                    </div>
                  </Td>
                  <Td className="tabular-nums">
                    {p.amount} {p.currency}
                  </Td>
                  <Td>
                    <Badge tone={p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}>{p.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    {p.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button type="button" className="text-sm font-semibold text-green-600 hover:underline dark:text-green-400" onClick={() => updatePayout(p._id, 'approved')}>
                          Approve
                        </button>
                        <button type="button" className="text-sm font-semibold text-red-600 hover:underline dark:text-red-400" onClick={() => updatePayout(p._id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      '—'
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {payouts.map((p) => (
            <Card key={p._id} className="shadow-md" padding="p-4">
              <div className="flex items-center gap-3">
                <MediaThumb
                  src={userAvatarUrl(p.creator || {})}
                  className="h-11 w-11 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-zinc-50">@{p.creator?.username}</p>
                  <p className="mt-1 text-lg tabular-nums font-semibold text-gray-800 dark:text-zinc-200">
                    {p.amount} {p.currency}
                  </p>
                  <Badge tone={p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'} className="mt-2">
                    {p.status}
                  </Badge>
                  {p.status === 'pending' ? (
                    <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3 dark:border-zinc-800">
                      <button type="button" className="text-sm font-semibold text-green-600 dark:text-green-400" onClick={() => updatePayout(p._id, 'approved')}>
                        Approve
                      </button>
                      <button type="button" className="text-sm font-semibold text-red-600 dark:text-red-400" onClick={() => updatePayout(p._id, 'rejected')}>
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
      <Card className="shadow-lg" padding="p-0 overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="font-semibold dark:text-zinc-50">Transactions</h2>
        </div>
        <div className="hidden md:block">
          <DataTable className="rounded-none border-0 shadow-none">
            <THead>
              <tr>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Reference</Th>
              </tr>
            </THead>
            <TBody>
              {tx.map((t) => (
                <Tr key={t._id}>
                  <Td>{t.type}</Td>
                  <Td className="tabular-nums">
                    {t.amount} {t.currency}
                  </Td>
                  <Td className="font-mono text-xs">{t.reference}</Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {tx.map((t) => (
            <Card key={t._id} className="shadow-md" padding="p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">{t.type}</p>
              <p className="mt-1 text-lg tabular-nums font-semibold">{t.amount} {t.currency}</p>
              <p className="mt-2 break-all font-mono text-xs text-gray-500 dark:text-zinc-400">{t.reference}</p>
            </Card>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
