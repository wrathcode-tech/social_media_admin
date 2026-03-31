import { Router } from 'express';
import { User } from '../models/User.js';
import { LoginHistory } from '../models/LoginHistory.js';
import { UserActivity } from '../models/UserActivity.js';
import { protect, requirePerm, logAdminAction } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, meta } from '../utils/pagination.js';

const router = Router();
router.use(protect);

router.get(
  '/',
  requirePerm('users.read'),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const q = (req.query.search || '').trim();
    const st = (req.query.status || '').trim();
    const filter =
      st === 'active' || st === 'blocked' ? { status: st } : { status: { $ne: 'deleted' } };
    if (q) {
      filter.$or = [{ username: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
    }
    const [total, items] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash').lean(),
    ]);
    res.json({ data: items, meta: meta(total, page, limit) });
  })
);

router.get(
  '/:id',
  requirePerm('users.read'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash').lean();
    if (!user || user.status === 'deleted') return res.status(404).json({ error: 'Not found' });
    res.json(user);
  })
);

router.patch('/:id/block', requirePerm('users.mod'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.status = 'blocked';
  await user.save();
  await logAdminAction(req, 'user.block', 'User', user._id);
  const safe = await User.findById(user._id).select('-passwordHash').lean();
  res.json(safe);
}));

router.patch('/:id/unblock', requirePerm('users.mod'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.status = 'active';
  await user.save();
  await logAdminAction(req, 'user.unblock', 'User', user._id);
  const safe = await User.findById(user._id).select('-passwordHash').lean();
  res.json(safe);
}));

router.delete('/:id', requirePerm('users.mod'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.status = 'deleted';
  await user.save();
  await logAdminAction(req, 'user.delete', 'User', user._id);
  res.json({ ok: true });
}));

router.get(
  '/:id/login-history',
  requirePerm('users.read'),
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, parseInt(String(req.query.limit || '20'), 10) || 20);
    const data = await LoginHistory.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ data });
  })
);

router.get(
  '/:id/activity',
  requirePerm('users.read'),
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, parseInt(String(req.query.limit || '20'), 10) || 20);
    const data = await UserActivity.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ data });
  })
);

export default router;
