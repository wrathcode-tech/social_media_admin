import { Router } from 'express';
import { AppSettings } from '../models/AppSettings.js';
import { Admin } from '../models/Admin.js';
import { protect, requirePerm } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

router.get(
  '/app',
  requirePerm('settings.read'),
  asyncHandler(async (req, res) => {
    const rows = await AppSettings.find().lean();
    const obj = {};
    rows.forEach((r) => {
      obj[r.key] = r.value;
    });
    res.json(obj);
  })
);

router.put(
  '/app/:key',
  requirePerm('settings.read'),
  asyncHandler(async (req, res) => {
    await AppSettings.findOneAndUpdate({ key: req.params.key }, { value: req.body.value }, { upsert: true, new: true });
    res.json({ ok: true });
  })
);

router.get(
  '/admins',
  requirePerm('settings.read'),
  asyncHandler(async (req, res) => {
    const data = await Admin.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json({ data });
  })
);

export default router;
