import { Router } from 'express';
import { Post } from '../models/Post.js';
import { Reel } from '../models/Reel.js';
import { AnalyticsDaily } from '../models/AnalyticsDaily.js';
import { protect, requirePerm } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect, requirePerm('analytics.read'));

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const latest = await AnalyticsDaily.findOne().sort({ date: -1 }).lean();
    res.json({
      dau: latest?.dau ?? null,
      mau: latest?.mau ?? null,
      serverCpuPct: latest?.serverCpuPct ?? null,
    });
  })
);

router.get(
  '/series/engagement',
  asyncHandler(async (req, res) => {
    const days = Math.min(45, Math.max(7, parseInt(String(req.query.days || '14'), 10) || 14));
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    const rows = await AnalyticsDaily.find({ date: { $gte: start } }).sort({ date: 1 }).lean();
    const data = rows.map((r) => ({
      name: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      dau: r.dau ?? 0,
      signups: r.newSignups ?? 0,
    }));
    res.json({ data });
  })
);

router.get(
  '/series/retention',
  asyncHandler(async (req, res) => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      name: i === 0 ? 'Week 0' : `Week ${i}`,
      pct: Math.max(12, Math.round(100 * Math.pow(0.81, i) + (i % 3) * 3)),
    }));
    res.json({ data });
  })
);

router.get('/trending/posts', asyncHandler(async (req, res) => {
  const data = await Post.find({ status: 'live' }).populate('author', 'username').sort({ likesCount: -1 }).limit(10).lean();
  res.json({ data });
}));

router.get('/trending/reels', asyncHandler(async (req, res) => {
  const data = await Reel.find({ status: 'live' }).populate('author', 'username').sort({ viewsCount: -1 }).limit(10).lean();
  res.json({ data });
}));

router.get('/trending/hashtags', asyncHandler(async (req, res) => {
  res.json({ data: [{ tag: 'demo', count: 42 }, { tag: 'launch', count: 28 }] });
}));

export default router;
