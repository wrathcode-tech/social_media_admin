/** Shared helpers for admin posts API responses (list + detail). */

export function postRowId(p) {
  if (!p) return '';
  return String(p._id ?? p.id ?? '');
}

export function normalizePostRow(p) {
  if (!p || typeof p !== 'object') return null;
  const id = p._id ?? p.id;
  let status = p.status;
  if (!status) {
    if (p.isDeleted || p.deletedAt) status = 'deleted';
    else if (p.isHidden === true || p.hidden === true) status = 'hidden';
    else if (p.isActive === false) status = 'inactive';
    else status = 'active';
  }
  return { ...p, _id: id, id, status };
}

export function deriveModerationFlags(post) {
  if (!post || typeof post !== 'object') {
    return { hidden: false, sensitive: false, restricted: false };
  }
  const st = String(post.status || '').toLowerCase();
  return {
    hidden:
      post.isHidden === true ||
      post.hidden === true ||
      post.moderation?.hidden === true ||
      st === 'hidden' ||
      st === 'removed',
    sensitive:
      post.isSensitive === true ||
      post.sensitive === true ||
      post.moderation?.sensitive === true,
    restricted:
      post.isRestricted === true ||
      post.restricted === true ||
      post.moderation?.restricted === true,
  };
}

export function extractPostsArray(res) {
  if (!res || typeof res !== 'object') return [];
  const raw = res.data;
  const candidates = [
    raw?.posts,
    res.posts,
    Array.isArray(raw) ? raw : null,
    raw?.data,
    Array.isArray(raw?.data) ? raw.data : null,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

export function normalizePostsListResponse(res, { requestedPage = 1, requestedLimit = 15 } = {}) {
  const raw = res?.data;
  const list = extractPostsArray(res).map(normalizePostRow).filter(Boolean);

  const pag =
    (raw && typeof raw === 'object' ? raw.pagination : null) ??
    res?.pagination ??
    (raw && typeof raw === 'object' ? raw.meta : null) ??
    res?.meta ??
    {};
  const page = Number(
    pag.page ?? raw?.page ?? res?.page ?? requestedPage
  ) || requestedPage;
  /** API often returns `count` = items in this page, `total` = full list count (top-level or in data). */
  const limit = Number(
    pag.limit ?? pag.perPage ?? raw?.limit ?? res?.count ?? requestedLimit
  ) || requestedLimit;
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

/** Preview line for post table/cards when caption is empty (matches list API shape). */
export function postListPreview(row) {
  if (!row || typeof row !== 'object') return '—';
  const t = row.caption || row.text || row.content || row.description;
  if (t) return t;
  const bits = [];
  if (row.likesCount != null && row.likesCount !== '') bits.push(`${row.likesCount} likes`);
  if (row.commentsCount != null && row.commentsCount !== '') bits.push(`${row.commentsCount} comments`);
  const media = row.media;
  if (Array.isArray(media) && media.length > 0) {
    const types = [...new Set(media.map((m) => m?.type).filter(Boolean))];
    if (types.length) bits.push(types.map((x) => String(x)).join(' · '));
    else bits.push(`${media.length} media`);
  }
  if (bits.length) return bits.join(' · ');
  return row.mediaUrl || row.videoUrl || '—';
}

/** Client-only filter for posts list (caption, author, id). */
export function filterPostsClientSide(rows, query) {
  if (!Array.isArray(rows)) return [];
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const preview = postListPreview(row);
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

export function parsePostFromGetResponse(res) {
  if (res && typeof res === 'object' && res.success === false) {
    return { error: res.message || 'Failed to load post', post: null };
  }
  const raw = res?.data;
  if (!raw || typeof raw !== 'object') return { error: 'Invalid response', post: null };
  const p = raw.post ?? (raw._id || raw.id ? raw : null) ?? (typeof raw.data === 'object' ? raw.data : null);
  const post = normalizePostRow(p);
  if (!post) return { error: 'Post not found', post: null };
  return { post };
}
