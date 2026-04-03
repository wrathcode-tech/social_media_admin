/** Admin stories list/detail — same row shape as posts where applicable. */

import { normalizePostRow, postListPreview } from './postsUtils';

export function storyRowId(s) {
  if (!s) return '';
  return String(s._id ?? s.id ?? '');
}

export function extractStoriesArray(res) {
  if (!res || typeof res !== 'object') return [];
  const raw = res.data;
  const candidates = [
    raw?.stories,
    res.stories,
    Array.isArray(raw) ? raw : null,
    raw?.data,
    Array.isArray(raw?.data) ? raw.data : null,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

export function normalizeStoriesListResponse(res, { requestedPage = 1, requestedLimit = 15 } = {}) {
  const raw = res?.data;
  const list = extractStoriesArray(res).map(normalizePostRow).filter(Boolean);

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

export function storyListPreview(row) {
  if (!row || typeof row !== 'object') return '—';
  const t = row.caption || row.text || row.content || row.description || row.title;
  if (t) return t;
  const bits = [];
  if (row.viewersCount != null && row.viewersCount !== '') bits.push(`${row.viewersCount} views`);
  const m = row.media;
  if (m && typeof m === 'object' && !Array.isArray(m) && m.type) {
    bits.push(String(m.type));
  } else if (Array.isArray(m) && m.length > 0) {
    const types = [...new Set(m.map((x) => x?.type).filter(Boolean))];
    if (types.length) bits.push(types.join(' · '));
  }
  if (bits.length) return bits.join(' · ');
  const pv = postListPreview(row);
  if (pv && pv !== '—') return pv;
  return '—';
}

export function filterStoriesClientSide(rows, query) {
  if (!Array.isArray(rows)) return [];
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const preview = storyListPreview(row);
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

export function parseStoryFromGetResponse(res) {
  if (res && typeof res === 'object' && res.success === false) {
    return { error: res.message || 'Failed to load story', story: null };
  }
  const raw = res?.data;
  if (!raw || typeof raw !== 'object') return { error: 'Invalid response', story: null };
  const p =
    raw.story ?? (raw._id || raw.id ? raw : null) ?? (typeof raw.data === 'object' ? raw.data : null);
  const story = normalizePostRow(p);
  if (!story) return { error: 'Story not found', story: null };
  return { story };
}
