import { useEffect, useState } from 'react';
import { adminGetAds, adminPatchAdApprove, adminPostAd } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { TextField } from '../components/ui/TextField';
import DataTable, { TBody, Td, Th, THead, Tr } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { adCreativeUrl } from '../lib/placeholders';
export default function AdsPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ title: '', placement: 'feed', imageUrl: '', linkUrl: '' });
  const load = async () => {
    try {
      const res = await adminGetAds(40);
      setRows(res.data || []);
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id) => {
    try {
      await adminPatchAdApprove(id);
      setRows((r) => r.map((x) => (x._id === id ? { ...x, status: 'approved' } : x)));
    } catch (e) {
      setErr(e.message);
    }
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    try {
      await adminPostAd({ ...form, status: 'pending' });
      setUploadOpen(false);
      setForm({ title: '', placement: 'feed', imageUrl: '', linkUrl: '' });
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const tone = (p) => (p === 'reels' ? 'purple' : p === 'story' ? 'info' : 'default');

  return (
    <PageShell>
      <PageHeader
        title="Ads"
        description="Feed, story, and reels placements."
        actions={
          <Button variant="primary" type="button" onClick={() => setUploadOpen(true)}>
            New ad
          </Button>
        }
      />
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-lg font-semibold dark:text-zinc-50">Reels placement preview</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`relative aspect-[9/16] overflow-hidden rounded-xl border-2 text-center text-[10px] font-medium ${
                i === 3
                  ? 'border-blue-500 shadow-md dark:border-blue-400'
                  : 'border-gray-200 dark:border-zinc-700'
              }`}
            >
              <MediaThumb
                src={`https://picsum.photos/seed/reelprev${i}/360/640`}
                className="absolute inset-0 h-full w-full"
                imgClassName="opacity-90"
              />
              <div
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-3 pt-8 text-white ${
                  i === 3 ? 'font-bold' : ''
                }`}
              >
                {i === 3 ? 'Ad slot' : `R${i}`}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="hidden md:block">
        <DataTable>
          <THead>
            <tr>
              <Th className="w-24">Creative</Th>
              <Th>Title</Th>
              <Th>Placement</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {rows.map((a) => (
              <Tr key={a._id}>
                <Td>
                  <MediaThumb
                    src={adCreativeUrl(a)}
                    className="h-12 w-20 rounded-lg border border-gray-200 dark:border-zinc-600"
                  />
                </Td>
                <Td className="font-medium">{a.title}</Td>
                <Td>
                  <Badge tone={tone(a.placement)}>{a.placement}</Badge>
                </Td>
                <Td className="capitalize">{a.status}</Td>
                <Td className="text-right">
                  {a.status === 'pending' ? (
                    <Button type="button" variant="primary" className="px-3 py-1.5 text-xs" onClick={() => approve(a._id)}>
                      Approve
                    </Button>
                  ) : (
                    '—'
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </DataTable>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((a) => (
          <Card key={a._id} className="shadow-md" padding="p-4">
            <div className="flex gap-3">
              <MediaThumb
                src={adCreativeUrl(a)}
                className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-zinc-50">{a.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={tone(a.placement)}>{a.placement}</Badge>
                  <span className="text-sm capitalize text-gray-600 dark:text-zinc-400">{a.status}</span>
                </div>
                {a.status === 'pending' ? (
                  <div className="mt-3 border-t border-gray-100 pt-3 dark:border-zinc-800">
                    <Button type="button" variant="primary" className="w-full px-3 py-2 text-sm" onClick={() => approve(a._id)}>
                      Approve
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Create ad"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="ad-form">
              Save
            </Button>
          </div>
        }
      >
        <form id="ad-form" className="space-y-4" onSubmit={submitUpload}>
          <TextField label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
            Placement
            <select
              value={form.placement}
              onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="feed">Feed</option>
              <option value="story">Story</option>
              <option value="reels">Reels</option>
            </select>
          </label>
          <TextField label="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
          <TextField label="Click URL" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} />
        </form>
      </Modal>
    </PageShell>
  );
}
