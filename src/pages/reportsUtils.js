/** Normalize reports API responses (shape varies by backend). */

export function reportRowId(r) {
  if (!r || typeof r !== 'object') return '';
  return String(r._id ?? r.id ?? '');
}

export function extractReportsList(res) {
  if (!res || typeof res !== 'object') return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  const d = res.data;
  if (d && typeof d === 'object') {
    if (Array.isArray(d.reports)) return d.reports;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.list)) return d.list;
    if (Array.isArray(d.data)) return d.data;
  }
  if (Array.isArray(res.reports)) return res.reports;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

export function extractReportsListMeta(res, { requestedPage = 1, requestedLimit = 20 } = {}) {
  const d = res?.data;
  const pag =
    (d && typeof d === 'object' ? d.pagination : null) ??
    res?.pagination ??
    (d && typeof d === 'object' ? d.meta : null) ??
    res?.meta ??
    {};
  const page = Number(pag.page ?? d?.page ?? res?.page ?? requestedPage) || requestedPage;
  const limit = Number(pag.limit ?? pag.perPage ?? d?.limit ?? res?.limit ?? requestedLimit) || requestedLimit;
  const total = pag.total ?? pag.totalCount ?? d?.total ?? res?.total ?? res?.totalCount;
  let pages = pag.pages ?? pag.totalPages ?? res?.totalPages;
  if (pages == null && total != null && Number.isFinite(Number(total)) && limit > 0) {
    pages = Math.max(1, Math.ceil(Number(total) / limit));
  }
  if (pages == null) {
    const list = extractReportsList(res);
    pages = list.length >= limit ? page + 1 : Math.max(1, page);
  }
  return {
    page,
    pages: Math.max(1, Number(pages) || 1),
    limit,
    ...(total != null && total !== '' ? { total: Number(total) } : {}),
  };
}

export function extractStatsPayload(res) {
  if (!res || typeof res !== 'object') return null;
  if (res.success === false) return null;
  const d = res.data;
  if (d && typeof d === 'object' && !Array.isArray(d)) return d;
  return res;
}

function firstStr(...vals) {
  for (const v of vals) {
    if (v != null && v !== '') return String(v);
  }
  return '—';
}

export function reportTargetLabel(r) {
  if (!r || typeof r !== 'object') return '—';
  const tt = r.targetType ?? r.target?.type ?? r.contentType ?? r.type;
  const tid = r.targetId ?? r.target?._id ?? r.target?.id ?? r.postId ?? r.reelId ?? r.userId ?? r.reportedUserId;
  const tail = tid != null && tid !== '' ? String(tid).slice(-8) : '';
  if (tt && tid) return `${String(tt)} · …${tail}`;
  if (tid) return `…${tail}`;
  return firstStr(r.summary, r.title, '—');
}

export function reportCategoryLabel(r) {
  if (!r || typeof r !== 'object') return '—';
  return firstStr(r.category, r.reason, r.reportReason, r.type, '—');
}

export function reportStatusLabel(r) {
  if (!r || typeof r !== 'object') return '—';
  return firstStr(r.status, r.state, 'pending');
}
