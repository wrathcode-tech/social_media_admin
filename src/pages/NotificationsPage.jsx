import { useEffect, useState } from 'react';
import { adminGetNotifications, adminPostNotification, adminPostNotificationSend } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import MediaThumb from '../components/ui/MediaThumb';
import { notificationCampaignThumb } from '../lib/placeholders';

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState('global');
  const [scheduledAt, setScheduledAt] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const res = await adminGetNotifications(30);
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

  const create = async (e) => {
    e.preventDefault();
    try {
      await adminPostNotification({
        title,
        body,
        scope,
        bannerText: scope === 'banner' ? bannerText : '',
        scheduledAt: scheduledAt || undefined,
        status: scheduledAt ? 'scheduled' : 'draft',
      });
      setTitle('');
      setBody('');
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const sendNow = async (id) => {
    try {
      await adminPostNotificationSend(id);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const previewBanner = scope === 'banner' && bannerText ? bannerText : 'Announcement preview text';

  return (
    <PageShell>
      <PageHeader title="Notifications" description="Push campaigns, banners, scheduling." />
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-lg" padding="p-4 md:p-6">
          <h2 className="text-lg font-semibold dark:text-zinc-50">Create</h2>
          <form onSubmit={create} className="mt-4 space-y-4">
            <TextField label="Title" name="n-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Body
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Scope
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="global">Global push</option>
                <option value="users">Specific users</option>
                <option value="banner">Banner</option>
              </select>
            </label>
            {scope === 'banner' ? (
              <TextField label="Banner text" name="banner" value={bannerText} onChange={(e) => setBannerText(e.target.value)} />
            ) : null}
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Schedule
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <Button type="submit" variant="primary">
              Save draft / schedule
            </Button>
          </form>
        </Card>
        <Card className="shadow-lg" padding="p-4 md:p-6">
          <h2 className="text-lg font-semibold dark:text-zinc-50">Banner preview</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 shadow-md dark:border-zinc-700">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 text-center text-sm font-medium text-white">
              {previewBanner}
            </div>
            <div className="relative space-y-2 overflow-hidden bg-white p-4 dark:bg-zinc-900">
              <img
                src="https://picsum.photos/seed/banner-feed-preview/400/200"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-15"
              />
              <div className="relative space-y-2">
                <div className="h-2 w-3/4 rounded-lg bg-gray-200/90 dark:bg-zinc-700/90" />
                <div className="h-2 w-1/2 rounded-lg bg-gray-200/90 dark:bg-zinc-700/90" />
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-lg font-semibold dark:text-zinc-50">Campaigns</h2>
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li
              key={r._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <MediaThumb
                  src={notificationCampaignThumb(r)}
                  className="h-11 w-11 shrink-0 rounded-xl border border-gray-200 dark:border-zinc-600"
                />
                <div className="min-w-0">
                <div className="font-medium dark:text-zinc-100">{r.title}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">
                  {r.scope} · {r.status}
                </div>
                </div>
              </div>
              {r.status !== 'sent' ? (
                <Button
                  type="button"
                  variant="primary"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => sendNow(r._id)}
                >
                  Mark sent
                </Button>
              ) : (
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Sent</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </PageShell>
  );
}
