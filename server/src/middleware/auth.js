import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { AuditLog } from '../models/AuditLog.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure';

export async function protect(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.sub);
    if (!admin) {
      res.status(401);
      return next(new Error('Admin not found'));
    }
    const whitelist = (process.env.ADMIN_IP_WHITELIST || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (whitelist.length) {
      const ip = req.ip || req.connection?.remoteAddress || '';
      if (!whitelist.includes(ip)) {
        res.status(403);
        return next(new Error('IP not allowed'));
      }
    }
    req.admin = admin;
    next();
  } catch (e) {
    res.status(401);
    next(new Error('Invalid token'));
  }
}

/** Single role: only super_admin may access protected admin routes. */
export function requirePerm(_perm) {
  return (req, res, next) => {
    const a = req.admin;
    if (!a) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    if (a.role !== 'super_admin') {
      res.status(403);
      return next(new Error('Forbidden'));
    }
    next();
  };
}

export function signToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: admin.role }, JWT_SECRET, { expiresIn: '12h' });
}

export async function logAdminAction(req, action, resource, resourceId, meta) {
  try {
    await AuditLog.create({
      actorAdmin: req.admin?._id,
      action,
      resource,
      resourceId,
      meta,
    });
  } catch (e) {
    console.error('audit log', e);
  }
}
