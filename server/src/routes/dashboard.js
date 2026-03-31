import { Router } from 'express';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Reel } from '../models/Reel.js';
import { Report } from '../models/Report.js';
import { AnalyticsDaily } from '../models/AnalyticsDaily.js';
import { protect, requirePerm } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect, requirePerm('analytics.read'));

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalUsers, activeUsers, newSignups, totalPosts, totalComments, totalReels, reportsPending] =
      await Promise.all([
        User.countDocuments({ status: { $ne: 'deleted' } }),
        User.countDocuments({ status: 'active', updatedAt: { $gte: dayAgo } }),
        User.countDocuments({ createdAt: { $gte: dayAgo } }),
        Post.countDocuments({ status: { $ne: 'deleted' } }),
        Comment.countDocuments({ status: { $ne: 'deleted' } }),
        Reel.countDocuments({ status: { $ne: 'deleted' } }),
        Report.countDocuments({ status: 'pending' }),
      ]);
    res.json({ totalUsers, activeUsers, newSignups, totalPosts, totalComments, totalReels, reportsPending });
  })
);

router.get(
  '/growth',
  asyncHandler(async (req, res) => {
    const rangeDays = req.query.range === 'daily' ? 7 : req.query.range === 'monthly' ? 30 : 14;
    const start = new Date();
    start.setDate(start.getDate() - rangeDays);
    start.setHours(0, 0, 0, 0);
    const rows = await AnalyticsDaily.find({ date: { $gte: start } }).sort({ date: 1 }).lean();
    const points = rows.map((r) => ({ date: r.date, newSignups: r.newSignups ?? 0 }));
    res.json({ points, rangeDays });
  })
);

export default router;
