import { Router } from 'express';
import { Advertisement } from '../models/Advertisement.js';
import { protect, requirePerm, logAdminAction } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect, requirePerm('ads.mod'));

router.get('/', asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '40'), 10) || 40);
  const data = await Advertisement.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data });
}));

router.post('/', asyncHandler(async (req, res) => {
  const a = await Advertisement.create(req.body);
  await logAdminAction(req, 'ad.create', 'Advertisement', a._id);
  res.status(201).json(a);
}));

router.patch('/:id/approve', asyncHandler(async (req, res) => {
  const a = await Advertisement.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!a) return res.status(404).json({ error: 'Not found' });
  await logAdminAction(req, 'ad.approve', 'Advertisement', a._id);
  res.json(a);
}));

export default router;
