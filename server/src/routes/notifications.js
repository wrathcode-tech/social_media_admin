import { Router } from 'express';
import { NotificationCampaign } from '../models/NotificationCampaign.js';
import { protect, requirePerm, logAdminAction } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect, requirePerm('notifications.mod'));

router.get('/', asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '30'), 10) || 30);
  const data = await NotificationCampaign.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data });
}));

router.post('/', asyncHandler(async (req, res) => {
  const c = await NotificationCampaign.create(req.body);
  await logAdminAction(req, 'notification.create', 'NotificationCampaign', c._id);
  res.status(201).json(c);
}));

router.post('/:id/send', asyncHandler(async (req, res) => {
  const c = await NotificationCampaign.findByIdAndUpdate(req.params.id, { status: 'sent' }, { new: true });
  if (!c) return res.status(404).json({ error: 'Not found' });
  await logAdminAction(req, 'notification.send', 'NotificationCampaign', c._id);
  res.json(c);
}));

export default router;
