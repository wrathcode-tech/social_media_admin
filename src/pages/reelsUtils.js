/** Admin reels list/detail — same moderation shape as posts (isHidden, etc.). */

import { normalizePostRow, postListPreview } from './postsUtils';

export { deriveModerationFlags } from './postsUtils';

export function reelRowId(p) {
  if (!p) return '';
  return String(p._id ?? p.id ?? '');
}

export function extractReelsArray(res) {
  if (!res || typeof res !== 'object') return [];
  const raw = res.data;
  const candidates = [
    raw?.reels,
    res.reels,
    Array.isArray(raw) ? raw : null,
    raw?.data,
    Array.isArray(raw?.data) ? raw.data : null,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

export function normalizeReelsListResponse(res, { requestedPage = 1, requestedLimit = 15 } = {}) {
  const raw = res?.data;
  const list = extractReelsArray(res).map(normalizePostRow).filter(Boolean);

  const pag =
    (raw && typeof raw === 'object' ? raw.pagination : null) ??
    res?.pagination ??
    (raw && typeof raw === 'object' ? raw.meta : null) ??
    res?.meta ??
    {};
  const page = Number(pag.page ?? raw?.page ?? res?.page ?? requestedPage) || requestedPage;
  const limit =
    Number(pag.limit ?? pag.perPage ?? raw?.limit ?? res?.count ?? requestedLimit) || requestedLimit;
  const total =
    pag.total ??
    pag.totalCount ??
    raw?.total ??
    raw?.totalCount ??
    res?.total ??
    res?.totalCount;

  let pages = pag.pages ?? pag.totalPages ?? res?.totalPages;
  if (pages == null && total != null && Number.isFinite(Number(total)) && limit > 0) {
    pages = Math.max(1, Math.ceil(Number(total) / limit));
  }
  if (pages == null) {
    pages = list.length >= limit ? page + 1 : Math.max(1, page);
  }

  return {
    list,
    meta: {
      page,
      pages: Math.max(1, Number(pages) || 1),
      limit,
      ...(total != null && total !== '' ? { total: Number(total) } : {}),
    },
  };
}

export function reelListPreview(row) {
  if (!row || typeof row !== 'object') return '—';
  const t = row.caption || row.text || row.content || row.description || row.title;
  if (t) return t;
  const pv = postListPreview(row);
  if (pv && pv !== '—') return pv;
  if (row.videoUrl) return 'Video';
  if (row.audioUrl || row.musicTitle) return row.musicTitle || 'Audio';
  return '—';
}

export function filterReelsClientSide(rows, query) {
  if (!Array.isArray(rows)) return [];
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const preview = reelListPreview(row);
    const uname =
      row?.author?.username != null
        ? String(row.author.username).toLowerCase()
        : String(row.authorUsername || row.user?.username || '').toLowerCase();
    const full =
      row?.author?.fullName != null ? String(row.author.fullName).toLowerCase() : '';
    const id = String(row?._id ?? row?.id ?? '');
    const blob = [preview, uname, full, id].join(' ').toLowerCase();
    return blob.includes(q);
  });
}

export function parseReelFromGetResponse(res) {
  if (res && typeof res === 'object' && res.success === false) {
    return { error: res.message || 'Failed to load reel', reel: null };
  }
  const raw = res?.data;
  if (!raw || typeof raw !== 'object') return { error: 'Invalid response', reel: null };
  const p = raw.reel ?? (raw._id || raw.id ? raw : null) ?? (typeof raw.data === 'object' ? raw.data : null);
  const reel = normalizePostRow(p);
  if (!reel) return { error: 'Reel not found', reel: null };
  return { reel };
}
