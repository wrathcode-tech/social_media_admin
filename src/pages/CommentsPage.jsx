import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthService from '../api/services/AuthService';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PaginationBar from '../components/ui/PaginationBar';
import { CommentBrowseListSkeleton, CommentThreadSkeleton } from '../components/ui/Skeleton';
import MediaThumb from '../components/ui/MediaThumb';
import { contentThumbUrl, userAvatarUrl } from '../lib/placeholders';
import { useToast } from '../context/ToastContext';
import { normalizePostsListResponse, postListPreview, postListStatsLine, postRowId } from './postsUtils';
import { normalizeReelsListResponse, reelListPreview, reelRowId } from './reelsUtils';
import {
  authorLabel,
  commentBody,
  commentReplies,
  commentRowId,
  extractPostCommentsFromResponse,
  replyRowId,
} from './postCommentsUtils';

function fmtDateTime(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

/** Legacy ?postId= → post; else ?kind=post|reel&id= */
function readSelection(searchParams) {
  const legacy = searchParams.get('postId')?.trim();
  if (legacy) return { kind: 'post', id: legacy };
  const id = searchParams.get('id')?.trim() || '';
  const kind = searchParams.get('kind') === 'reel' ? 'reel' : 'post';
  return { kind, id };
}

export default function CommentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { kind: urlKind, id: urlId } = readSelection(searchParams);

  const [browseKind, setBrowseKind] = useState('posts');
  const [browseRows, setBrowseRows] = useState([]);
  const [browseMeta, setBrowseMeta] = useState({ page: 1, pages: 1 });
  const [browseLoading, setBrowseLoading] = useState(false);

  const [draftKind, setDraftKind] = useState(urlKind);
  const [draftId, setDraftId] = useState(urlId);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [err, setErr] = useState('');
  const [deletingKey, setDeletingKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const { kind, id } = readSelection(searchParams);
    setDraftKind(kind);
    setDraftId(id);
  }, [searchParams]);

  const loadBrowseList = useCallback(
    async (page = 1) => {
      setBrowseLoading(true);
      try {
        if (browseKind === 'posts') {
          const res = await AuthService.adminListPosts({ page, limit: 10 });
          if (res && typeof res === 'object' && res.success === false) {
            setBrowseRows([]);
            return;
          }
          const { list, meta } = normalizePostsListResponse(res, { requestedPage: page, requestedLimit: 10 });
          setBrowseRows(list);
          setBrowseMeta(meta);
        } else {
          const res = await AuthService.adminListReels({ page, limit: 10 });
          if (res && typeof res === 'object' && res.success === false) {
            setBrowseRows([]);
            return;
          }
          const { list, meta } = normalizeReelsListResponse(res, { requestedPage: page, requestedLimit: 10 });
          setBrowseRows(list);
          setBrowseMeta(meta);
        }
      } catch {
        setBrowseRows([]);
      } finally {
        setBrowseLoading(false);
      }
    },
    [browseKind]
  );

  useEffect(() => {
    loadBrowseList(1);
  }, [loadBrowseList]);

  const fetchComments = useCallback(async (id, kind) => {
    const cid = String(id ?? '').trim();
    if (!cid) {
      setComments([]);
      setErr('');
      return;
    }
    setCommentsLoading(true);
    setErr('');
    try {
      const res =
        kind === 'reel'
          ? await AuthService.adminListReelComments(cid)
          : await AuthService.adminListPostComments(cid);
      if (res && typeof res === 'object' && res.success === false) {
        setComments([]);
        setErr(res.message || 'Failed to load comments');
        return;
      }
      setComments(extractPostCommentsFromResponse(res));
    } catch (e) {
      setComments([]);
      setErr(e?.message || 'Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    const { kind, id } = readSelection(searchParams);
    if (id) fetchComments(id, kind);
    else {
      setComments([]);
      setErr('');
    }
  }, [searchParams, fetchComments]);

  const selectContent = (kind, id) => {
    const i = String(id ?? '').trim();
    if (!i) return;
    setSearchParams({ kind, id: i });
  };

  const applyManual = (e) => {
    e?.preventDefault?.();
    const i = draftId.trim();
    if (!i) {
      toast('Enter a post or reel ID', 'error');
      return;
    }
    setSearchParams({ kind: draftKind, id: i });
  };

  const clearSelection = () => {
    setSearchParams({});
  };

  const deleteComment = async (commentId) => {
    if (!urlId || !commentId) return;
    if (!window.confirm('Delete this comment?')) return;
    const key = `c:${commentId}`;
    setDeletingKey(key);
    try {
      const res =
        urlKind === 'reel'
          ? await AuthService.adminDeleteReelComment(urlId, commentId)
          : await AuthService.adminDeletePostComment(urlId, commentId);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Delete failed');
      }
      toast('Comment deleted', 'success');
      await fetchComments(urlId, urlKind);
    } catch (e2) {
      toast(e2?.message || 'Could not delete comment', 'error');
    } finally {
      setDeletingKey('');
    }
  };

  const deleteReply = async (commentId, replyId) => {
    if (!urlId || !commentId || !replyId) return;
    if (!window.confirm('Delete this reply?')) return;
    const key = `r:${commentId}:${replyId}`;
    setDeletingKey(key);
    try {
      const res =
        urlKind === 'reel'
          ? await AuthService.adminDeleteReelCommentReply(urlId, commentId, replyId)
          : await AuthService.adminDeletePostCommentReply(urlId, commentId, replyId);
      if (res && typeof res === 'object' && res.success === false) {
        throw new Error(res.message || 'Delete failed');
      }
      toast('Reply deleted', 'success');
      await fetchComments(urlId, urlKind);
    } catch (e2) {
      toast(e2?.message || 'Could not delete reply', 'error');
    } finally {
      setDeletingKey('');
    }
  };

  const openDetailPath = urlKind === 'reel' ? `/reels/${urlId}` : `/posts/${urlId}`;
  const contentLabel = urlKind === 'reel' ? 'Reel' : 'Post';

  return (
    <PageShell>
      <PageHeader
        title="Comments"
        description="Browse posts or reels, pick one to load its comments, or enter an ID manually. Deletes use the matching post/reel comment APIs."
      />

      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Browse</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
          List alag–alag: neeche filter se Posts ya Reels chuno, phir row par Comments.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBrowseKind('posts')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              browseKind === 'posts'
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Posts list
          </button>
          <button
            type="button"
            onClick={() => setBrowseKind('reels')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              browseKind === 'reels'
                ? 'bg-violet-600 text-white dark:bg-violet-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Reels list
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {browseLoading ? (
            <CommentBrowseListSkeleton rows={6} />
          ) : browseRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-zinc-400">No items on this page.</p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-zinc-800 dark:border-zinc-700">
              {browseRows.map((row, idx) => {
                const isPost = browseKind === 'posts';
                const rid = isPost ? postRowId(row) : reelRowId(row);
                const prev = isPost ? postListPreview(row) : reelListPreview(row);
                const seg = isPost ? 'posts' : 'reels';
                const selected = urlId === rid && (isPost ? urlKind === 'post' : urlKind === 'reel');
                return (
                  <li
                    key={rid || idx}
                    className={`flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
                      selected ? 'bg-blue-50/80 dark:bg-blue-950/30' : 'bg-white dark:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 gap-3">
                      <MediaThumb
                        src={contentThumbUrl(row, seg)}
                        className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-700"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={isPost ? 'info' : 'purple'} className="text-[10px] uppercase">
                            {isPost ? 'Post' : 'Reel'}
                          </Badge>
                          <MediaThumb
                            src={userAvatarUrl(row.author || {})}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-full border border-gray-200 dark:border-zinc-600"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                            @{row.author?.username || row.authorUsername || row.user?.username || '—'}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-700 dark:text-zinc-300">{prev}</p>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-zinc-500">
                          {postListStatsLine(row) || '—'}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-gray-400 dark:text-zinc-500">{rid}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      className="shrink-0 text-sm"
                      onClick={() => selectContent(isPost ? 'post' : 'reel', rid)}
                    >
                      Comments
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="mt-4">
          <PaginationBar
            page={browseMeta.page}
            pages={browseMeta.pages}
            onPageChange={loadBrowseList}
            disabled={browseLoading}
          />
        </div>
      </Card>

      <Card className="shadow-lg" padding="p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Manual ID</h2>
        <form className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" onSubmit={applyManual}>
          <fieldset className="flex gap-4 text-sm font-medium text-gray-700 dark:text-zinc-300">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="draftKind"
                checked={draftKind === 'post'}
                onChange={() => setDraftKind('post')}
                className="text-blue-600"
              />
              Post
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="draftKind"
                checked={draftKind === 'reel'}
                onChange={() => setDraftKind('reel')}
                className="text-violet-600"
              />
              Reel
            </label>
          </fieldset>
          <label className="min-w-[12rem] flex-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
            ID
            <input
              value={draftId}
              onChange={(e) => setDraftId(e.target.value)}
              placeholder="ObjectId"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" type="submit" disabled={commentsLoading}>
              Load comments
            </Button>
            {urlId ? (
              <Button variant="secondary" type="button" onClick={clearSelection}>
                Clear
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      {urlId ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-sm text-gray-800 dark:text-zinc-200">
            <span className="font-semibold">{contentLabel}</span>{' '}
            <span className="font-mono text-xs text-gray-600 dark:text-zinc-400">{urlId}</span>
          </p>
          <Button as={Link} to={openDetailPath} variant="secondary" className="text-sm">
            Open {contentLabel.toLowerCase()}
          </Button>
        </div>
      ) : null}

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {err}
        </div>
      ) : null}

      {!urlId ? (
        <Card className="shadow-md" padding="p-8">
          <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
            List se item chunein ya upar manual ID daalen.
          </p>
        </Card>
      ) : commentsLoading ? (
        <CommentThreadSkeleton cards={5} />
      ) : comments.length === 0 ? (
        <Card className="shadow-md" padding="p-8">
          <p className="text-center text-sm text-gray-500 dark:text-zinc-400">Is {contentLabel.toLowerCase()} par koi comment nahi.</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {comments.map((c, idx) => {
            const cid = commentRowId(c);
            const replies = commentReplies(c);
            return (
              <li key={cid || `comment-${idx}`}>
                <Card className="shadow-md" padding="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{authorLabel(c)}</p>
                      <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-zinc-300">{commentBody(c)}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500">
                        {fmtDateTime(c.createdAt ?? c.created_at)} ·{' '}
                        <span className="font-mono text-[11px]">{cid || '—'}</span>
                      </p>
                    </div>
                    {cid ? (
                      <Button
                        variant="danger"
                        type="button"
                        className="shrink-0 text-sm"
                        disabled={deletingKey === `c:${cid}`}
                        onClick={() => deleteComment(cid)}
                      >
                        {deletingKey === `c:${cid}` ? '…' : 'Delete comment'}
                      </Button>
                    ) : null}
                  </div>
                  {replies.length > 0 ? (
                    <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
                      {replies.map((r, ridx) => {
                        const rid = replyRowId(r);
                        return (
                          <li
                            key={rid || ridx}
                            className="flex flex-col gap-2 rounded-xl bg-gray-50/90 px-3 py-3 sm:flex-row sm:items-start sm:justify-between dark:bg-zinc-900/50"
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">
                                Reply
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{authorLabel(r)}</p>
                              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-zinc-300">{commentBody(r)}</p>
                              <p className="text-xs text-gray-500 dark:text-zinc-500">
                                {fmtDateTime(r.createdAt ?? r.created_at)} ·{' '}
                                <span className="font-mono text-[11px]">{rid || '—'}</span>
                              </p>
                            </div>
                            {rid && cid ? (
                              <Button
                                variant="danger"
                                type="button"
                                className="shrink-0 text-sm"
                                disabled={deletingKey === `r:${cid}:${rid}`}
                                onClick={() => deleteReply(cid, rid)}
                              >
                                {deletingKey === `r:${cid}:${rid}` ? '…' : 'Delete reply'}
                              </Button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
