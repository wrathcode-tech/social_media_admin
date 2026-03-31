import { Router } from 'express';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Story } from '../models/Story.js';
import { Reel } from '../models/Reel.js';
import { DeletedContentLog } from '../models/DeletedContentLog.js';
import { protect, requirePerm, logAdminAction } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, meta } from '../utils/pagination.js';

const router = Router();
router.use(protect, requirePerm('content.mod'));

function dateFilter(q) {
  const f = {};
  if (q.from) f.$gte = new Date(q.from);
  if (q.to) f.$lte = new Date(q.to);
  return Object.keys(f).length ? { createdAt: f } : {};
}

router.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filter = { ...dateFilter(req.query) };
    if (req.query.user) filter.author = req.query.user;
    if (req.query.status) filter.status = req.query.status;
    const [total, data] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter).populate('author', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    res.json({ data, meta: meta(total, page, limit) });
  })
);

router.patch('/posts/:id/hide', asyncHandler(async (req, res) => {
  const p = await Post.findByIdAndUpdate(req.params.id, { status: 'hidden' }, { new: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  await logAdminAction(req, 'post.hide', 'Post', p._id);
  res.json(p);
}));

router.patch('/posts/:id/sensitive', asyncHandler(async (req, res) => {
  const p = await Post.findByIdAndUpdate(req.params.id, { isSensitive: !!req.body.isSensitive }, { new: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  await logAdminAction(req, 'post.sensitive', 'Post', p._id, { isSensitive: p.isSensitive });
  res.json(p);
}));

router.delete('/posts/:id', asyncHandler(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await DeletedContentLog.create({
    contentType: 'post',
    contentId: p._id,
    snapshot: p.toObject(),
    deletedBy: req.admin._id,
    reason: req.body.reason || '',
  });
  p.status = 'deleted';
  await p.save();
  await logAdminAction(req, 'post.delete', 'Post', p._id);
  res.json({ ok: true });
}));

router.get(
  '/comments',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filter = { ...dateFilter(req.query) };
    if (req.query.user) filter.author = req.query.user;
    const [total, data] = await Promise.all([
      Comment.countDocuments(filter),
      Comment.find(filter).populate('author', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    res.json({ data, meta: meta(total, page, limit) });
  })
);

router.delete('/comments/:id', asyncHandler(async (req, res) => {
  await Comment.findByIdAndUpdate(req.params.id, { status: 'deleted' });
  await logAdminAction(req, 'comment.delete', 'Comment', req.params.id);
  res.json({ ok: true });
}));

router.get(
  '/stories',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filter = { ...dateFilter(req.query) };
    if (req.query.user) filter.author = req.query.user;
    const [total, data] = await Promise.all([
      Story.countDocuments(filter),
      Story.find(filter).populate('author', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    res.json({ data, meta: meta(total, page, limit) });
  })
);

router.patch('/stories/:id/hide', asyncHandler(async (req, res) => {
  const s = await Story.findByIdAndUpdate(req.params.id, { status: 'hidden' }, { new: true });
  if (!s) return res.status(404).json({ error: 'Not found' });
  await logAdminAction(req, 'story.hide', 'Story', s._id);
  res.json(s);
}));

router.delete('/stories/:id', asyncHandler(async (req, res) => {
  await Story.findByIdAndUpdate(req.params.id, { status: 'deleted' });
  await logAdminAction(req, 'story.delete', 'Story', req.params.id);
  res.json({ ok: true });
}));

router.get(
  '/reels',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filter = { ...dateFilter(req.query) };
    if (req.query.user) filter.author = req.query.user;
    const [total, data] = await Promise.all([
      Reel.countDocuments(filter),
      Reel.find(filter).populate('author', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);
    res.json({ data, meta: meta(total, page, limit) });
  })
);

router.patch('/reels/:id/hide', asyncHandler(async (req, res) => {
  const r = await Reel.findByIdAndUpdate(req.params.id, { status: 'hidden' }, { new: true });
  if (!r) return res.status(404).json({ error: 'Not found' });
  await logAdminAction(req, 'reel.hide', 'Reel', r._id);
  res.json(r);
}));

router.patch('/reels/:id/sensitive', asyncHandler(async (req, res) => {
  const r = await Reel.findByIdAndUpdate(req.params.id, { isSensitive: !!req.body.isSensitive }, { new: true });
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
}));

router.delete('/reels/:id', asyncHandler(async (req, res) => {
  await Reel.findByIdAndUpdate(req.params.id, { status: 'deleted' });
  await logAdminAction(req, 'reel.delete', 'Reel', req.params.id);
  res.json({ ok: true });
}));

export default router;
