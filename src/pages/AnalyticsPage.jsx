import { useEffect, useMemo, useState } from 'react';
import { adminGetAnalyticsBundle } from '../services/adminQueries';
import { useTheme } from '../context/ThemeContext';
import PageShell from '../components/ui/PageShell';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MediaThumb from '../components/ui/MediaThumb';
import { contentThumbUrl } from '../lib/placeholders';
import { EngagementMixChart, RetentionAreaChart } from '../components/analytics/AnalyticsCharts';

function fallbackEngagementSeries() {
  return Array.from({ length: 14 }, (_, i) => ({
    name: `D${i + 1}`,
    dau: Math.round(9200 + Math.sin(i * 0.5) * 700 + i * 55),
    signups: Math.round(52 + (i % 5) * 18 + i * 3),
  }));
}

function fallbackRetentionSeries() {
  return Array.from({ length: 8 }, (_, i) => ({
    name: i === 0 ? 'Week 0' : `Week ${i}`,
    pct: Math.max(14, Math.round(100 * Math.pow(0.81, i) + (i % 3) * 4)),
  }));
}

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [overview, setOverview] = useState(null);
  const [engagementData, setEngagementData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [tags, setTags] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const bundle = await adminGetAnalyticsBundle();
        setOverview(bundle.overview);
        const eng = bundle.engagementSeries?.data;
        const ret = bundle.retentionSeries?.data;
        setEngagementData(Array.isArray(eng) && eng.length > 0 ? eng : fallbackEngagementSeries());
        setRetentionData(Array.isArray(ret) && ret.length > 0 ? ret : fallbackRetentionSeries());
        setPosts(bundle.trendingPosts?.data || []);
        setReels(bundle.trendingReels?.data || []);
        setTags(bundle.hashtags?.data || []);
        setErr('');
      } catch (e) {
        setErr(e.message);
        setEngagementData(fallbackEngagementSeries());
        setRetentionData(fallbackRetentionSeries());
      }
    })();
  }, []);

  const engagementKey = useMemo(() => engagementData.map((d) => d.name).join(','), [engagementData]);
  const retentionKey = useMemo(() => retentionData.map((d) => d.name).join(','), [retentionData]);

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
            <h2 className="font-semibold dark:text-zinc-50">Engagement</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">DAU vs new signups (daily buckets)</p>
          </div>
          <div className="bg-white px-2 pb-2 pt-1 dark:bg-zinc-900">
            <div className="w-full min-w-0" key={engagementKey}>
              <EngagementMixChart data={engagementData} isDark={isDark} />
            </div>
          </div>
        </Card>
        <Card className="shadow-lg" padding="p-0 overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
            <h2 className="font-semibold dark:text-zinc-50">Retention</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">Cohort retention (% active vs week 0)</p>
          </div>
          <div className="bg-white px-2 pb-2 pt-1 dark:bg-zinc-900">
            <div className="w-full min-w-0" key={retentionKey}>
              <RetentionAreaChart data={retentionData} isDark={isDark} />
            </div>
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
