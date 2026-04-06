import { useCallback, useEffect, useState } from 'react';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TextField } from '../components/ui/TextField';
import MediaThumb from '../components/ui/MediaThumb';
import { notificationCampaignThumb } from '../lib/placeholders';
import PaginationBar from '../components/ui/PaginationBar';
import { NotificationListSkeleton, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { confirmDestructive } from '../utils/confirmDestructive';
import { alertErrorMessage, alertSuccessMessage } from '../utils/snackbarUtils';
import {
  extractSettingsNotificationsList,
  extractSettingsNotificationsMeta,
  settingsNotificationRowId,
} from './settingsNotificationsUtils';
import './NotificationsPage.css';

const TYPE_OPTIONS = [{ value: 'all', label: 'All users', hint: 'Broadcast' }];

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function isApiError(res) {
  return res && typeof res === 'object' && res.success === false;
}

function parseUserIds(raw) {
  return String(raw || '')
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [listLoading, setListLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notifyType, setNotifyType] = useState('all');
  const [targetUserIdsRaw, setTargetUserIdsRaw] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const { toast } = useToast();

  const load = useCallback(async (page = 1) => {
    setListLoading(true);
    setErr('');
    try {
      const res = await AuthService.adminListSettingsNotifications({ page, limit: 20 });
      if (isApiError(res)) {
        setErr(res.message || 'Failed to load notifications');
        setRows([]);
        return;
      }
      setRows(extractSettingsNotificationsList(res));
      setMeta(extractSettingsNotificationsMeta(res, { requestedPage: page, requestedLimit: 20 }));
    } catch (e) {
      setErr(e?.message || 'Failed to load notifications');
      setRows([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Add a title', 'error');
      return;
    }
    if (!body.trim()) {
      toast('Add a message body', 'error');
      return;
    }

    const userIds = parseUserIds(targetUserIdsRaw);
    const data = userIds.length > 0 ? { userIds } : {};

    setSaving(true);
    try {
      const res = await AuthService.adminCreateSettingsNotification({
        title: title.trim(),
        body: body.trim(),
        type: notifyType,
        data,
      });
      if (isApiError(res)) {
        throw new Error(res.message || 'Could not create');
      }
      setTitle('');
      setBody('');
      setTargetUserIdsRaw('');
      await load(meta.page);
      toast('Notification created', 'success');
      setErr('');
    } catch (e2) {
      setErr(e2?.message || 'Could not create');
      toast(e2?.message || 'Could not create', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!id) return;
    const ok = await confirmDestructive({
      title: 'Delete notification?',
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      const res = await AuthService.adminDeleteSettingsNotification(id);
      if (isApiError(res)) {
        throw new Error(res.message || 'Delete failed');
      }
      alertSuccessMessage('Notification deleted successfully');
      await load(meta.page);
      setErr('');
    } catch (e2) {
      alertErrorMessage(e2?.message || 'Could not delete');
    } finally {
      setDeletingId('');
    }
  };

  const inputClass =
    'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500';

  return (
    <PageShell>
      <PageHeader
        title="Notifications"
        description="Create admin notifications (title, body, audience). List is paginated; you can delete entries."
      />
      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {err}
        </div>
      ) : null}

      <div >
        <Card className="shadow-lg lg:col-span-7" padding="p-0">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50">New notification</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">POST payload: title, body, type, data.</p>
          </div>
          <form onSubmit={create} className="space-y-5 px-5 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Audience</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNotifyType(opt.value)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${notifyType === opt.value
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
              <TextField label="Title" name="n-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Body
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={4}
                  placeholder="Short, clear message"
                  className={`${inputClass} resize-y placeholder:text-gray-400 dark:placeholder:text-zinc-600`}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Target user IDs (optional)
                <textarea
                  name="target-users"
                  value={targetUserIdsRaw}
                  onChange={(e) => setTargetUserIdsRaw(e.target.value)}
                  rows={2}
                  placeholder="Leave empty for all users. Otherwise one ID per line or comma-separated — sent in data.userIds"
                  className={`${inputClass} font-mono text-xs placeholder:font-sans`}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5 dark:border-zinc-800">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Sending…' : 'Create'}
              </Button>
            </div>
          </form>
        </Card>

      </div>

      <Card className="shadow-lg" padding="p-0">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50">Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {listLoading ? (
                <Skeleton className="inline-block h-4 w-40 max-w-full rounded align-middle" />
              ) : (
                `${rows.length} on this page`
              )}
              {meta.total != null ? ` · ${meta.total} total` : null}
            </p>
          </div>
        </div>
        {listLoading && rows.length === 0 ? (
          <NotificationListSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {rows.map((r) => {
              const id = settingsNotificationRowId(r);
              const typeLabel = r.type != null ? String(r.type) : '—';
              return (
                <li
                  key={id || JSON.stringify(r).slice(0, 48)}
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 gap-4">
                    <MediaThumb
                      src={notificationCampaignThumb(r)}
                      className="h-12 w-12 shrink-0 rounded-2xl border border-gray-200 shadow-sm dark:border-zinc-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-zinc-100">{r.title ?? '—'}</p>
                      {r.body ? (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-zinc-400">{r.body}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone="info" className="capitalize">
                          {typeLabel}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-zinc-500">{fmtDateTime(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 sm:pl-4">
                    {id ? (
                      <Button
                        type="button"
                        variant="danger"
                        className="w-full sm:w-auto"
                        disabled={deletingId === id}
                        onClick={() => remove(id)}
                      >
                        {deletingId === id ? '…' : 'Delete'}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t border-gray-100 px-2 py-3 dark:border-zinc-800">
          <PaginationBar page={meta.page} pages={meta.pages} onPageChange={load} disabled={listLoading} />
        </div>
      </Card>
    </PageShell>
  );
}
