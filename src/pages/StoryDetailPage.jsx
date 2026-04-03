import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { ContentDetailPageSkeleton } from '../components/ui/Skeleton';
import { contentThumbUrl } from '../lib/placeholders';
import { useToast } from '../context/ToastContext';
import { deriveModerationFlags } from './postsUtils';
import { parseStoryFromGetResponse, storyListPreview, storyRowId } from './storiesUtils';

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

function statusTone(st) {
  const s = String(st || '').toLowerCase();
  if (s === 'deleted') return 'danger';
  if (s === 'hidden' || s === 'removed' || s === 'expired') return 'warning';
  if (s === 'active' || s === 'published') return 'success';
  return 'default';
}

export default function StoryDetailPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    if (!storyId) return;
    setLoading(true);
    setErr('');
    try {
      const res = await AuthService.adminGetStory(storyId);
      const { story: s, error } = parseStoryFromGetResponse(res);
      if (error) {
        setStory(null);
        setErr(error);
        return;
      }
      setStory(s);
    } catch (e) {
      setStory(null);
      setErr(e?.message || 'Failed to load story');
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const id = storyRowId(story);
  const flags = deriveModerationFlags(story || {});
  const mediaUrl =
    story?.mediaUrl ||
    story?.videoUrl ||
    (story?.media &&
    typeof story.media === 'object' &&
    !Array.isArray(story.media) &&
    story.media.url) ||
    (Array.isArray(story?.media) && story.media[0]?.url) ||
    null;

  const doDelete = async () => {
    if (!storyId || !window.confirm('Permanently delete this story?')) return;
    setBusy(true);
    try {
      const res = await AuthService.adminDeleteStory(storyId);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Delete failed');
      }
      toast('Story deleted', 'success');
      navigate('/stories');
    } catch (e) {
      toast(e?.message || 'Could not delete', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading && !story && !err) {
    return (
      <PageShell>
        <ContentDetailPageSkeleton />
      </PageShell>
    );
  }

  if (err && !story) {
    return (
      <PageShell>
        <Link to="/stories" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← Stories
        </Link>
        <p className="mt-4 text-red-600 dark:text-red-400">{err}</p>
      </PageShell>
    );
  }

  const preview = story ? storyListPreview(story) : '—';

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/stories" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← Stories
        </Link>
        <Button variant="danger" type="button" disabled={busy} onClick={doDelete}>
          Delete
        </Button>
      </div>

      <Card className="mt-4 shadow-lg" padding="p-4 md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <MediaThumb
            src={contentThumbUrl(story, 'stories')}
            className="h-48 w-full max-w-sm shrink-0 rounded-2xl border border-gray-200 object-cover dark:border-zinc-700 lg:h-64 lg:w-64"
          />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(story?.status)} className="capitalize">
                {story?.status || '—'}
              </Badge>
              {flags.sensitive ? <Badge tone="warning">Sensitive</Badge> : null}
              {flags.hidden ? <Badge tone="default">Hidden</Badge> : null}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-zinc-200">{preview}</p>
            {mediaUrl ? (
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Open media URL
              </a>
            ) : null}
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              <Row label="Story ID">{id || '—'}</Row>
              <Row label="Author">
                @{story?.author?.username || story?.authorUsername || story?.user?.username || '—'}
              </Row>
              <Row label="Created">{fmtDateTime(story?.createdAt)}</Row>
              <Row label="Expires">{fmtDateTime(story?.expiresAt ?? story?.expiredAt)}</Row>
              <Row label="Updated">{fmtDateTime(story?.updatedAt)}</Row>
            </dl>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
