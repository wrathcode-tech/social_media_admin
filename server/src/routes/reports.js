import { Router } from 'express';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { protect, requirePerm, logAdminAction } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, meta } from '../utils/pagination.js';

const router = Router();
router.use(protect, requirePerm('reports.mod'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.targetType) filter.targetType = req.query.targetType;
    const [total, data] = await Promise.all([
      Report.countDocuments(filter),
      Report.find(filter).populate('reporter', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    res.json({ data, meta: meta(total, page, limit) });
  })
);

router.patch('/:id/action', asyncHandler(async (req, res) => {
  const { actionTaken, status } = req.body;
  const allowed = ['warn', 'suspend', 'ban', 'remove', 'none'];
  if (actionTaken && !allowed.includes(actionTaken)) return res.status(400).json({ error: 'Invalid action' });
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Not found' });
  if (actionTaken === 'suspend' || actionTaken === 'ban') {
    if (report.targetType === 'user') {
      const u = await User.findById(report.targetId);
      if (u) {
        u.status = actionTaken === 'ban' ? 'deleted' : 'blocked';
        await u.save();
      }
    }
  }
  report.actionTaken = actionTaken || report.actionTaken;
  report.status = status || 'resolved';
  await report.save();
  await logAdminAction(req, 'report.action', 'Report', report._id, { actionTaken });
  res.json(report);
}));

export default router;
