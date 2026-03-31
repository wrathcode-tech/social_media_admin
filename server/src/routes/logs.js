import { Router } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { UserActivity } from '../models/UserActivity.js';
import { DeletedContentLog } from '../models/DeletedContentLog.js';
import { protect, requirePerm } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect, requirePerm('logs.read'));

router.get('/admin', asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '40'), 10) || 40);
  const data = await AuditLog.find().populate('actorAdmin', 'email').sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '40'), 10) || 40);
  const data = await UserActivity.find().populate('user', 'username').sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data });
}));

router.get('/deleted-content', asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '40'), 10) || 40);
  const data = await DeletedContentLog.find().populate('deletedBy', 'email').sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data });
}));

export default router;
