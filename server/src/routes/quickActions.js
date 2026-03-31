import { Router } from 'express';
import { User } from '../models/User.js';
import { NotificationCampaign } from '../models/NotificationCampaign.js';
import { protect, requirePerm, logAdminAction } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

router.post(
  '/ban-user',
  requirePerm('users.mod'),
  asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.status = 'blocked';
    await u.save();
    await logAdminAction(req, 'quick.ban', 'User', u._id);
    res.json({ ok: true });
  })
);

router.post(
  '/notify',
  requirePerm('notifications.mod'),
  asyncHandler(async (req, res) => {
    const c = await NotificationCampaign.create({
      title: req.body.title || 'Admin notice',
      body: req.body.body || '',
      scope: 'global',
      status: 'sent',
    });
    await logAdminAction(req, 'quick.notify', 'NotificationCampaign', c._id);
    res.json(c);
  })
);

export default router;
