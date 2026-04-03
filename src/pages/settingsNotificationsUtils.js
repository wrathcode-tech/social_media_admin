/** Normalize GET /settings/notifications responses. */

export function settingsNotificationRowId(row) {
  if (!row || typeof row !== 'object') return '';
  return String(row._id ?? row.id ?? '');
}

export function extractSettingsNotificationsList(res) {
  if (!res || typeof res !== 'object') return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  const d = res.data;
  if (d && typeof d === 'object') {
    if (Array.isArray(d.notifications)) return d.notifications;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.list)) return d.list;
  }
  if (Array.isArray(res.notifications)) return res.notifications;
  return [];
}

export function extractSettingsNotificationsMeta(res, { requestedPage = 1, requestedLimit = 20 } = {}) {
  const d = res?.data;
  const pag =
    (d && typeof d === 'object' ? d.pagination : null) ??
    res?.pagination ??
    (d && typeof d === 'object' ? d.meta : null) ??
    res?.meta ??
    {};
  const page = Number(pag.page ?? d?.page ?? res?.page ?? requestedPage) || requestedPage;
  const limit = Number(pag.limit ?? d?.limit ?? res?.limit ?? requestedLimit) || requestedLimit;
  const total = pag.total ?? pag.totalCount ?? d?.total ?? res?.total ?? res?.totalCount;
  let pages = pag.pages ?? pag.totalPages ?? res?.totalPages;
  if (pages == null && total != null && Number.isFinite(Number(total)) && limit > 0) {
    pages = Math.max(1, Math.ceil(Number(total) / limit));
  }
  if (pages == null) {
    const list = extractSettingsNotificationsList(res);
    pages = list.length >= limit ? page + 1 : Math.max(1, page);
  }
  return {
    page,
    pages: Math.max(1, Number(pages) || 1),
    limit,
    ...(total != null && total !== '' ? { total: Number(total) } : {}),
  };
}
