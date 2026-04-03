/** Parse GET /posts/:postId/comments response into a flat list of comment rows. */

export function extractPostCommentsFromResponse(res) {
  if (!res || typeof res !== 'object') return [];
  const raw = res.data;
  const candidates = [
    raw?.comments,
    Array.isArray(raw?.comments) ? raw.comments : null,
    raw?.data,
    Array.isArray(raw?.data) ? raw.data : null,
    Array.isArray(raw) ? raw : null,
    res.comments,
    Array.isArray(res.comments) ? res.comments : null,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

export function commentRowId(c) {
  if (!c) return '';
  return String(c._id ?? c.id ?? '');
}

export function replyRowId(r) {
  if (!r) return '';
  return String(r._id ?? r.id ?? '');
}

export function commentBody(c) {
  if (!c || typeof c !== 'object') return '—';
  const t = c.text ?? c.content ?? c.body ?? c.message;
  return t != null && String(t).trim() !== '' ? String(t) : '—';
}

export function authorLabel(x) {
  if (!x || typeof x !== 'object') return '—';
  const u = x.author ?? x.user ?? x;
  if (typeof u === 'string') return u;
  return u.username ? `@${u.username}` : u.fullName || u.email || '—';
}

/** Replies may be `replies`, `children`, or nested `reply`. */
export function commentReplies(c) {
  if (!c || typeof c !== 'object') return [];
  const r = c.replies ?? c.children ?? c.reply;
  if (Array.isArray(r)) return r;
  if (r && typeof r === 'object') return [r];
  return [];
}
