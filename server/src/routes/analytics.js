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
