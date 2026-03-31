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
        const { overview, trendingPosts, trendingReels, hashtags } = await adminGetAnalyticsBundle();
        setOverview(overview);
        setPosts(trendingPosts.data || []);
        setReels(trendingReels.data || []);
        setTags(hashtags.data || []);
        setErr('');
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <PageShell>
      <PageHeader title="Analytics" description="Growth, engagement, infra." />
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
        <Card className="shadow-lg" padding="p-0 overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="font-semibold dark:text-zinc-50">Engagement (placeholder)</h2>
          </div>
          <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950">
            <img
              src="https://picsum.photos/seed/engagement-chart/800/400"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25 dark:opacity-20"
            />
            <p className="relative text-sm font-medium text-gray-600 dark:text-zinc-400">Chart area</p>
          </div>
        </Card>
        <Card className="shadow-lg" padding="p-0 overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="font-semibold dark:text-zinc-50">Retention (placeholder)</h2>
          </div>
          <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-zinc-900 dark:to-blue-950/30">
            <img
              src="https://picsum.photos/seed/retention-chart/800/400"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25 dark:opacity-20"
            />
            <p className="relative text-sm font-medium text-gray-600 dark:text-zinc-400">Cohort chart</p>
          </div>
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
