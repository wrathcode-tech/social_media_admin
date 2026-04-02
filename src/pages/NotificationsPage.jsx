import { useEffect, useState } from 'react';
import { adminGetNotifications, adminPostNotification, adminPostNotificationSend } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TextField } from '../components/ui/TextField';
import MediaThumb from '../components/ui/MediaThumb';
import { notificationCampaignThumb } from '../lib/placeholders';
import { useToast } from '../context/ToastContext';
import './NotificationsPage.css';

const SCOPE_OPTIONS = [
  { value: 'global', label: 'Global', hint: 'Everyone' },
  { value: 'users', label: 'Targeted', hint: 'By user ID' },
  { value: 'banner', label: 'Banner', hint: 'Strip in app' },
];

function fmtSchedule(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString();
}

function parseUserIds(raw) {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function statusTone(s) {
  if (s === 'sent') return 'success';
  if (s === 'scheduled') return 'info';
  return 'warning';
}

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState('global');
  const [scheduledAt, setScheduledAt] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [targetUserIdsRaw, setTargetUserIdsRaw] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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
    if (scope === 'banner') {
      if (!bannerText.trim()) {
        toast('Add banner text for banner campaigns', 'error');
        return;
      }
    } else if (!body.trim()) {
      toast('Add a message body for push', 'error');
      return;
    }
    if (!title.trim()) {
      toast('Add a title', 'error');
      return;
    }
    const targetUserIds = scope === 'users' ? parseUserIds(targetUserIdsRaw) : [];
    if (scope === 'users' && targetUserIds.length === 0) {
      toast('Add at least one user ID', 'error');
      return;
    }

    setSaving(true);
    try {
      await adminPostNotification({
        title: title.trim(),
        body: scope === 'banner' ? '' : body.trim(),
        scope,
        bannerText: scope === 'banner' ? bannerText.trim() : '',
        scheduledAt: scheduledAt || undefined,
        status: scheduledAt ? 'scheduled' : 'draft',
        targetUserIds,
      });
      setTitle('');
      setBody('');
      setBannerText('');
      setTargetUserIdsRaw('');
      setScheduledAt('');
      await load();
      toast(scheduledAt ? 'Scheduled' : 'Draft saved', 'success');
      setErr('');
    } catch (e) {
      setErr(e.message);
      toast(e.message || 'Could not save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sendNow = async (id) => {
    try {
      await adminPostNotificationSend(id);
      await load();
      toast('Sent', 'success');
      setErr('');
    } catch (e) {
      setErr(e.message);
      toast(e.message || 'Failed', 'error');
    }
  };

  const previewTitle =
    scope === 'banner' ? bannerText.trim() || 'Banner text…' : title.trim() || 'Title';
  const pushBodyPreview = body.trim() || 'Message body appears here.';

  const inputClass =
    'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500';

  return (
    <PageShell>
      <PageHeader
        title="Notifications"
        description="Compose pushes and in-app banners. Preview updates as you type."
      />
      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {err}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <Card className="shadow-lg lg:col-span-7" padding="p-0">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50">New campaign</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">Content, audience, then schedule if needed.</p>
          </div>
          <form onSubmit={create} className="space-y-6 px-5 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Channel</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScope(opt.value)}
                    className={`rounded-xl border-2 px-2 py-2.5 text-left transition-all ${
                      scope === opt.value
                        ? 'border-blue-600 bg-blue-50/80 shadow-sm dark:border-blue-500 dark:bg-blue-950/30'
                        : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-600'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">{opt.label}</span>
                    <span className="mt-0.5 block text-[11px] text-gray-500 dark:text-zinc-500">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Content</p>
              <TextField label="Title" name="n-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                {scope === 'banner' ? 'Body (optional)' : 'Body'}
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required={scope !== 'banner'}
                  rows={4}
                  placeholder={scope === 'banner' ? 'Optional — banner uses strip below' : 'Short, clear message'}
                  className={`${inputClass} resize-y placeholder:text-gray-400 dark:placeholder:text-zinc-600`}
                />
              </label>
              {scope === 'banner' ? (
                <TextField
                  label="Banner strip"
                  name="banner"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  required
                />
              ) : null}
            </div>

            {scope === 'users' ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Audience</p>
                <label className="mt-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  User IDs
                  <textarea
                    name="target-users"
                    value={targetUserIdsRaw}
                    onChange={(e) => setTargetUserIdsRaw(e.target.value)}
                    rows={2}
                    placeholder="507f1f77… , 507f1f78…"
                    className={`${inputClass} font-mono text-xs placeholder:font-sans`}
                  />
                </label>
              </div>
            ) : null}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Timing</p>
              <label className="mt-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Schedule
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputClass} />
                <span className="mt-1 block text-xs text-gray-500 dark:text-zinc-500">Empty = save as draft</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5 dark:border-zinc-800">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving…' : scheduledAt ? 'Schedule' : 'Save draft'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="lg:col-span-5">
          <Card className="shadow-lg ring-1 ring-gray-900/5 dark:ring-white/5" padding="p-0">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50">Live preview</h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                {scope === 'banner' ? 'How the strip sits on the feed' : 'Lock screen style'}
              </p>
            </div>
            <div className="p-5">
              {scope === 'banner' ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-inner dark:border-zinc-700 dark:bg-zinc-950">
                  <div className="flex h-9 items-center justify-center border-b border-gray-100 bg-gray-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
                    <div className="h-1 w-10 rounded-full bg-gray-300/90 dark:bg-zinc-600" />
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-center text-sm font-medium leading-snug text-white">
                    {previewTitle}
                  </div>
                  <div className="space-y-2.5 bg-gradient-to-b from-gray-50 to-white p-3 dark:from-zinc-900 dark:to-zinc-950">
                    <div className="h-16 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-zinc-900 dark:ring-zinc-800" />
                    <div className="h-16 rounded-xl bg-white/80 shadow-sm ring-1 ring-gray-100/80 dark:bg-zinc-900/60 dark:ring-zinc-800/80" />
                  </div>
                </div>
              ) : (
                <div
                  className="notifications-lockPreviewBg relative overflow-hidden rounded-2xl shadow-inner"
                >
                  <div className="relative px-4 pt-6 text-center">
                    <p className="text-[13px] font-medium text-white/45">
                      {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="mt-0.5 text-3xl font-light tracking-tight text-white/90">9:41</p>
                  </div>
                  <div className="relative mt-10 px-3 pb-6">
                    <div className="rounded-2xl border border-white/10 bg-white/95 p-3.5 shadow-xl backdrop-blur-sm dark:bg-zinc-900/95">
                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-[10px] font-bold text-white shadow-md">
                          GF
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Flicksy</p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-zinc-50">{previewTitle}</p>
                          <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-gray-600 dark:text-zinc-400">{pushBodyPreview}</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-center text-[11px] text-white/35">
                      {scope === 'users' ? 'Targeted recipients only' : 'Broadcast to opted-in devices'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="shadow-lg" padding="p-0">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50">Campaigns</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">{rows.length} total</p>
          </div>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">No campaigns yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {rows.map((r) => {
              const when = fmtSchedule(r.scheduledAt);
              const userCount = Array.isArray(r.targetUserIds) ? r.targetUserIds.length : 0;
              const scopeLabel = r.scope === 'users' ? 'Targeted' : r.scope === 'banner' ? 'Banner' : 'Global';
              return (
                <li key={r._id} className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <MediaThumb
                      src={notificationCampaignThumb(r)}
                      className="h-12 w-12 shrink-0 rounded-2xl border border-gray-200 shadow-sm dark:border-zinc-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-zinc-100">{r.title}</p>
                      {r.body ? (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-zinc-400">{r.body}</p>
                      ) : r.scope === 'banner' && r.bannerText ? (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-zinc-400">{r.bannerText}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone="purple">{scopeLabel}</Badge>
                        <Badge tone={statusTone(r.status)} className="capitalize">
                          {r.status}
                        </Badge>
                        {when && r.status !== 'sent' ? (
                          <span className="text-xs text-gray-500 dark:text-zinc-500">{when}</span>
                        ) : null}
                        {r.scope === 'users' && userCount > 0 ? (
                          <span className="text-xs text-gray-500 dark:text-zinc-500">{userCount} users</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 sm:pl-4">
                    {r.status !== 'sent' ? (
                      <Button
                        type="button"
                        variant="primary"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                        onClick={() => sendNow(r._id)}
                      >
                        Send now
                      </Button>
                    ) : (
                      <span className="flex w-full items-center justify-center rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 sm:w-auto">
                        Sent
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}
