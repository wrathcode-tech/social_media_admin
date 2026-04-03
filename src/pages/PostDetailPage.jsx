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
import { deriveModerationFlags, parsePostFromGetResponse, postListPreview, postRowId } from './postsUtils';

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

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [moderateOpen, setModerateOpen] = useState(false);
  const [moderateDraft, setModerateDraft] = useState({ hidden: false, sensitive: false, restricted: false });
  const [moderateSaving, setModerateSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setErr('');
    try {
      const res = await AuthService.adminGetPost(postId);
      const { post: p, error } = parsePostFromGetResponse(res);
      if (error) {
        setPost(null);
        setErr(error);
        return;
      }
      setPost(p);
    } catch (e) {
      setPost(null);
      setErr(e?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const id = postRowId(post);
  const flags = deriveModerationFlags(post || {});

  const openModerate = () => {
    setModerateDraft(deriveModerationFlags(post || {}));
    setModerateOpen(true);
  };

  const submitModerate = async (e) => {
    e.preventDefault();
    if (!postId) return;
    setModerateSaving(true);
    try {
      const res = await AuthService.adminModeratePost(postId, {
        hidden: moderateDraft.hidden,
        sensitive: moderateDraft.sensitive,
        restricted: moderateDraft.restricted,
      });
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Moderate failed');
      }
      setModerateOpen(false);
      toast('Post updated', 'success');
      await refresh();
    } catch (e2) {
      toast(e2?.message || 'Could not moderate post', 'error');
    } finally {
      setModerateSaving(false);
    }
  };

  const doRestore = async () => {
    if (!postId) return;
    setBusy(true);
    try {
      const res = await AuthService.adminRestorePost(postId);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Restore failed');
      }
      toast('Post restored', 'success');
      await refresh();
    } catch (e) {
      toast(e?.message || 'Could not restore', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!postId || !window.confirm('Permanently delete this post?')) return;
    setBusy(true);
    try {
      const res = await AuthService.adminDeletePost(postId);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Delete failed');
      }
      toast('Post deleted', 'success');
      navigate('/posts');
    } catch (e) {
      toast(e?.message || 'Could not delete', 'error');
    } finally {
      setBusy(false);
    }
  };

  const canRestore = () => {
    if (!post) return false;
    const st = String(post.status || '').toLowerCase();
    return st === 'deleted' || st === 'hidden' || post.isDeleted === true || post.deletedAt;
  };

  const statusTone = (st) => {
    const s = String(st || '').toLowerCase();
    if (s === 'deleted') return 'danger';
    if (s === 'hidden' || s === 'removed') return 'warning';
    if (s === 'active' || s === 'published') return 'success';
    return 'default';
  };

  if (loading && !post && !err) {
    return (
      <PageShell>
        <ContentDetailPageSkeleton />
      </PageShell>
    );
  }

  if (err && !post) {
    return (
      <PageShell>
        <Link to="/posts" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← Posts
        </Link>
        <p className="mt-4 text-red-600 dark:text-red-400">{err}</p>
      </PageShell>
    );
  }

  const preview = post ? postListPreview(post) : '—';

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/posts" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← Posts
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
            src={contentThumbUrl(post, 'posts')}
            className="h-48 w-full max-w-sm shrink-0 rounded-2xl border border-gray-200 object-cover dark:border-zinc-700 lg:h-64 lg:w-64"
          />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(post?.status)} className="capitalize">
                {post?.status || '—'}
              </Badge>
              {flags.sensitive ? <Badge tone="warning">Sensitive</Badge> : null}
              {flags.restricted ? <Badge tone="info">Restricted</Badge> : null}
              {flags.hidden ? <Badge tone="default">Hidden</Badge> : null}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-zinc-200">{preview}</p>
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              <Row label="Post ID">{id || '—'}</Row>
              <Row label="Author">
                @{post?.author?.username || post?.authorUsername || post?.user?.username || '—'}
              </Row>
              <Row label="Created">{fmtDateTime(post?.createdAt)}</Row>
              <Row label="Updated">{fmtDateTime(post?.updatedAt)}</Row>
            </dl>
          </div>
        </div>
      </Card>

      <Modal
        open={moderateOpen}
        onClose={() => !moderateSaving && setModerateOpen(false)}
        title="Moderate post"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" disabled={moderateSaving} onClick={() => setModerateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="moderate-post-detail-form" disabled={moderateSaving}>
              {moderateSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="moderate-post-detail-form" className="space-y-3" onSubmit={submitModerate}>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Updates moderation flags via <span className="font-medium">PUT …/moderate</span>.
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
