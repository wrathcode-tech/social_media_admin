import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { ContentDetailPageSkeleton } from '../components/ui/Skeleton';
import { contentThumbUrl } from '../lib/placeholders';
import { useToast } from '../context/ToastContext';
import { confirmDestructive } from '../utils/confirmDestructive';
import { deriveModerationFlags, parseReelFromGetResponse, reelListPreview, reelRowId } from './reelsUtils';

function fmtDateTime(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

function Row({ label, children }) {
  return (
    <>
      <dt className="text-gray-500 dark:text-zinc-400">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-gray-900 dark:text-zinc-100">{children}</dd>
    </>
  );
}

export default function ReelDetailPage() {
  const { reelId } = useParams();
  const navigate = useNavigate();
  const [reel, setReel] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [moderateOpen, setModerateOpen] = useState(false);
  const [moderateDraft, setModerateDraft] = useState({ hidden: false, sensitive: false, restricted: false });
  const [moderateSaving, setModerateSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    if (!reelId) return;
    setLoading(true);
    setErr('');
    try {
      const res = await AuthService.adminGetReel(reelId);
      const { reel: r, error } = parseReelFromGetResponse(res);
      if (error) {
        setReel(null);
        setErr(error);
        return;
      }
      setReel(r);
    } catch (e) {
      setReel(null);
      setErr(e?.message || 'Failed to load reel');
    } finally {
      setLoading(false);
    }
  }, [reelId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const id = reelRowId(reel);
  const flags = deriveModerationFlags(reel || {});

  const openModerate = () => {
    setModerateDraft(deriveModerationFlags(reel || {}));
    setModerateOpen(true);
  };

  const submitModerate = async (e) => {
    e.preventDefault();
    if (!reelId) return;
    const ok = await confirmDestructive({
      title: 'Apply moderation changes?',
      text: 'Updates hidden, sensitive, and restricted settings for this reel.',
      confirmButtonText: 'Save changes',
      confirmButtonColor: '#2563eb',
      icon: 'question',
    });
    if (!ok) return;
    setModerateSaving(true);
    try {
      const res = await AuthService.adminModerateReel(reelId, {
        hidden: moderateDraft.hidden,
        sensitive: moderateDraft.sensitive,
        restricted: moderateDraft.restricted,
      });
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Moderate failed');
      }
      setModerateOpen(false);
      toast('Reel updated', 'success');
      await refresh();
    } catch (e2) {
      toast(e2?.message || 'Could not moderate reel', 'error');
    } finally {
      setModerateSaving(false);
    }
  };

  const doRestore = async () => {
    if (!reelId) return;
    setBusy(true);
    try {
      const res = await AuthService.adminRestoreReel(reelId);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Restore failed');
      }
      toast('Reel restored', 'success');
      await refresh();
    } catch (e) {
      toast(e?.message || 'Could not restore', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!reelId) return;
    const ok = await confirmDestructive({
      title: 'Permanently delete this reel?',
      text: 'This cannot be undone.',
      confirmButtonText: 'Yes, delete',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await AuthService.adminDeleteReel(reelId);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Delete failed');
      }
      toast('Reel deleted', 'success');
      navigate('/reels');
    } catch (e) {
      toast(e?.message || 'Could not delete', 'error');
    } finally {
      setBusy(false);
    }
  };

  const canRestore = () => {
    if (!reel) return false;
    const st = String(reel.status || '').toLowerCase();
    return st === 'deleted' || st === 'hidden' || reel.isDeleted === true || reel.deletedAt;
  };

  const statusTone = (st) => {
    const s = String(st || '').toLowerCase();
    if (s === 'deleted') return 'danger';
    if (s === 'hidden' || s === 'removed') return 'warning';
    if (s === 'active' || s === 'published') return 'success';
    return 'default';
  };

  if (loading && !reel && !err) {
    return (
      <PageShell>
        <ContentDetailPageSkeleton />
      </PageShell>
    );
  }

  if (err && !reel) {
    return (
      <PageShell>
        <Link to="/reels" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← Reels
        </Link>
        <p className="mt-4 text-red-600 dark:text-red-400">{err}</p>
      </PageShell>
    );
  }

  const preview = reel ? reelListPreview(reel) : '—';
  const videoUrl = reel?.videoUrl || (Array.isArray(reel?.media) && reel.media[0]?.url) || null;

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/reels" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← Reels
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" disabled={busy} onClick={openModerate}>
            Moderate
          </Button>
          {canRestore() ? (
            <Button
              variant="primary"
              type="button"
              className="bg-green-600 hover:bg-green-700"
              disabled={busy}
              onClick={doRestore}
            >
              Restore
            </Button>
          ) : null}
          <Button variant="danger" type="button" disabled={busy} onClick={doDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card className="mt-4 shadow-lg" padding="p-4 md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <MediaThumb
            src={contentThumbUrl(reel, 'reels')}
            className="h-48 w-full max-w-sm shrink-0 rounded-2xl border border-gray-200 object-cover dark:border-zinc-700 lg:h-64 lg:w-64"
          />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(reel?.status)} className="capitalize">
                {reel?.status || '—'}
              </Badge>
              {flags.sensitive ? <Badge tone="warning">Sensitive</Badge> : null}
              {flags.restricted ? <Badge tone="info">Restricted</Badge> : null}
              {flags.hidden ? <Badge tone="default">Hidden</Badge> : null}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-zinc-200">{preview}</p>
            {videoUrl ? (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Open video URL
              </a>
            ) : null}
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              <Row label="Reel ID">{id || '—'}</Row>
              <Row label="Author">
                @{reel?.author?.username || reel?.authorUsername || reel?.user?.username || '—'}
              </Row>
              <Row label="Created">{fmtDateTime(reel?.createdAt)}</Row>
              <Row label="Updated">{fmtDateTime(reel?.updatedAt)}</Row>
            </dl>
          </div>
        </div>
      </Card>

      <Modal
        open={moderateOpen}
        onClose={() => !moderateSaving && setModerateOpen(false)}
        title="Moderate reel"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" disabled={moderateSaving} onClick={() => setModerateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="moderate-reel-detail-form" disabled={moderateSaving}>
              {moderateSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="moderate-reel-detail-form" className="space-y-3" onSubmit={submitModerate}>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Updates moderation flags via <span className="font-medium">PUT …/reels/:id/moderate</span>.
          </p>
          {[
            ['hidden', 'Hidden'],
            ['sensitive', 'Sensitive'],
            ['restricted', 'Restricted'],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
                checked={moderateDraft[key]}
                onChange={(e) => setModerateDraft((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{label}</span>
            </label>
          ))}
        </form>
      </Modal>
    </PageShell>
  );
}
