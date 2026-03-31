import { Router } from 'express';
import { PayoutRequest } from '../models/PayoutRequest.js';
import { Transaction } from '../models/Transaction.js';
import { protect, requirePerm } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect, requirePerm('finance.mod'));

router.get('/payouts', asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '30'), 10) || 30);
  const data = await PayoutRequest.find().populate('creator', 'username email').sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data });
}));

router.patch('/payouts/:id', asyncHandler(async (req, res) => {
  const p = await PayoutRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
}));

router.get('/transactions', asyncHandler(async (req, res) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '30'), 10) || 30);
  const data = await Transaction.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data });
}));

export default router;
