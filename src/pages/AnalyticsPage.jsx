import { useEffect, useState } from 'react';
import { adminGetAnalyticsBundle } from '../services/adminQueries';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { contentThumbUrl } from '../lib/placeholders';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [tags, setTags] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const bundle = await adminGetAnalyticsBundle();
        setOverview(bundle.overview);
        setPosts(bundle.trendingPosts?.data || []);
        setReels(bundle.trendingReels?.data || []);
        setTags(bundle.hashtags?.data || []);
        setErr('');
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <PageShell>
      <PageHeader title="Analytics" description="Overview, trending content, and hashtags." />
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{err}</div> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-lg">
          <div className="text-sm text-gray-500 dark:text-zinc-400">DAU</div>
          <div className="mt-1 text-3xl font-bold tabular-nums dark:text-zinc-50">{overview?.dau ?? '—'}</div>
        </Card>
        <Card className="shadow-lg">
          <div className="text-sm text-gray-500 dark:text-zinc-400">MAU</div>
          <div className="mt-1 text-3xl font-bold tabular-nums dark:text-zinc-50">{overview?.mau ?? '—'}</div>
        </Card>
        <Card className="shadow-lg">
          <div className="text-sm text-gray-500 dark:text-zinc-400">Server CPU %</div>
          <div className="mt-1 text-3xl font-bold tabular-nums dark:text-zinc-50">{overview?.serverCpuPct ?? '—'}</div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold dark:text-zinc-50">Trending posts</h2>
          <ul className="mt-4 space-y-3">
            {posts.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MediaThumb
                    src={contentThumbUrl(p, 'posts')}
                    className="h-11 w-11 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
                  />
                  <span className="truncate font-medium dark:text-zinc-100">@{p.author?.username}</span>
                </div>
                <span className="shrink-0 tabular-nums text-gray-500 dark:text-zinc-400">{p.likesCount} likes</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold dark:text-zinc-50">Trending reels</h2>
          <ul className="mt-4 space-y-3">
            {reels.map((r) => (
              <li
                key={r._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MediaThumb
                    src={contentThumbUrl(r, 'reels')}
                    className="h-11 w-11 shrink-0 rounded-lg border border-gray-200 dark:border-zinc-600"
                  />
                  <span className="truncate font-medium dark:text-zinc-100">@{r.author?.username}</span>
                </div>
                <span className="shrink-0 tabular-nums text-gray-500 dark:text-zinc-400">{r.viewsCount} views</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="shadow-lg">
        <h2 className="text-lg font-semibold dark:text-zinc-50">Hashtags</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((h) => (
            <Badge key={h.tag} tone="info" className="px-3 py-1 text-sm">
              #{h.tag} · {h.count}
            </Badge>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
