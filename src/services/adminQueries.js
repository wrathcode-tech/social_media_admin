import { deleteJson, getJson, patchJson, postJson, putJson } from './httpClient';
import { getStaticRuntime } from '../data/adminStaticRuntime.js';
import { isAdminStaticDataMode } from '../lib/adminDataMode.js';

function meta(total, page, limit) {
  return { total, page, pages: Math.max(1, Math.ceil(total / limit)), limit };
}

function paginate(arr, page, limit) {
  const total = arr.length;
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), meta: meta(total, page, limit) };
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function adminGetDashboardSummary() {
  if (isAdminStaticDataMode()) {
    const s = getStaticRuntime().summary;
    return { ...s, reportsPending: getStaticRuntime().reports.filter((r) => r.status === 'pending').length };
  }
  return getJson('/admin/dashboard/summary');
}

export async function adminGetDashboardGrowth(range) {
  if (isAdminStaticDataMode()) {
    const g = getStaticRuntime().growth;
    if (range === 'daily') return { points: g.daily };
    if (range === 'monthly') return { points: g.monthly };
    return { points: g.weekly };
  }
  return getJson(`/admin/dashboard/growth?range=${encodeURIComponent(range || 'weekly')}`);
}

export async function adminGetReportsQueue({ limit = 6, status = 'pending' } = {}) {
  if (isAdminStaticDataMode()) {
    let list = getStaticRuntime().reports;
    if (status) list = list.filter((r) => r.status === status);
    return { data: list.slice(0, limit) };
  }
  const q = new URLSearchParams({ limit: String(limit) });
  if (status) q.set('status', status);
  return getJson(`/admin/reports?${q}`);
}

export async function adminGetUsers({ page = 1, limit = 10, search = '', status = '' } = {}) {
  if (isAdminStaticDataMode()) {
    let list = getStaticRuntime().users.filter((u) => u.status !== 'deleted');
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (status === 'active' || status === 'blocked') list = list.filter((u) => u.status === status);
    return paginate(list, page, limit);
  }
  const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
  if (status) params.set('status', status);
  return getJson(`/admin/users?${params}`);
}

export async function adminGetUser(userId) {
  if (isAdminStaticDataMode()) {
    const u = getStaticRuntime().users.find((x) => x._id === userId);
    if (!u || u.status === 'deleted') throw new Error('Not found');
    return { ...u };
  }
  return getJson(`/admin/users/${userId}`);
}

export async function adminPatchUserBlock(userId) {
  if (isAdminStaticDataMode()) {
    const u = getStaticRuntime().users.find((x) => x._id === userId);
    if (!u) throw new Error('Not found');
    u.status = 'blocked';
    return { ...u };
  }
  return patchJson(`/admin/users/${userId}/block`, {});
}

export async function adminPatchUserUnblock(userId) {
  if (isAdminStaticDataMode()) {
    const u = getStaticRuntime().users.find((x) => x._id === userId);
    if (!u) throw new Error('Not found');
    u.status = 'active';
    return { ...u };
  }
  return patchJson(`/admin/users/${userId}/unblock`, {});
}

export async function adminDeleteUser(userId) {
  if (isAdminStaticDataMode()) {
    const u = getStaticRuntime().users.find((x) => x._id === userId);
    if (!u) throw new Error('Not found');
    u.status = 'deleted';
    return { ok: true };
  }
  return deleteJson(`/admin/users/${userId}`);
}

export async function adminGetUserLoginHistory(userId, limit = 20) {
  if (isAdminStaticDataMode()) {
    const rows = getStaticRuntime().loginHistoryByUser[userId] || [];
    return { data: rows.slice(0, limit) };
  }
  return getJson(`/admin/users/${userId}/login-history?limit=${limit}`);
}

export async function adminGetUserActivity(userId, limit = 20) {
  if (isAdminStaticDataMode()) {
    const rows = getStaticRuntime().activityByUser[userId] || [];
    return { data: rows.slice(0, limit) };
  }
  return getJson(`/admin/users/${userId}/activity?limit=${limit}`);
}

function filterContentRows(rows, { userFilter, dateFrom, dateTo }) {
  let list = [...rows];
  if (userFilter) {
    list = list.filter((row) => {
      const aid = typeof row.author === 'object' && row.author?._id ? row.author._id : row.author;
      return String(aid) === String(userFilter);
    });
  }
  const from = parseDate(dateFrom);
  const to = parseDate(dateTo);
  if (from) list = list.filter((r) => new Date(r.createdAt) >= from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    list = list.filter((r) => new Date(r.createdAt) <= end);
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function adminGetContent(segment, { page = 1, limit = 15, userFilter = '', dateFrom = '', dateTo = '' } = {}) {
  if (isAdminStaticDataMode()) {
    const key = segment === 'posts' ? 'posts' : segment === 'reels' ? 'reels' : segment === 'stories' ? 'stories' : 'comments';
    const raw = getStaticRuntime()[key].filter((r) => r.status !== 'deleted');
    const filtered = filterContentRows(raw, { userFilter, dateFrom, dateTo });
    return paginate(filtered, page, limit);
  }
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (userFilter) q.set('user', userFilter);
  if (dateFrom) q.set('from', dateFrom);
  if (dateTo) q.set('to', dateTo);
  return getJson(`/admin/content/${segment}?${q}`);
}

export async function adminPatchContentHide(segment, id) {
  if (isAdminStaticDataMode()) {
    const row = findContentRow(segment, id);
    if (!row) throw new Error('Not found');
    row.status = 'hidden';
    return { ...row };
  }
  return patchJson(`/admin/content/${segment}/${id}/hide`, {});
}

export async function adminPatchContentSensitive(segment, id, isSensitive) {
  if (isAdminStaticDataMode()) {
    const row = findContentRow(segment, id);
    if (!row) throw new Error('Not found');
    row.isSensitive = !!isSensitive;
    return { ...row };
  }
  return patchJson(`/admin/content/${segment}/${id}/sensitive`, { isSensitive });
}

export async function adminDeleteContent(segment, id) {
  if (isAdminStaticDataMode()) {
    const rt = getStaticRuntime();
    const key = segment === 'posts' ? 'posts' : segment === 'reels' ? 'reels' : segment === 'stories' ? 'stories' : 'comments';
    const idx = rt[key].findIndex((r) => r._id === id);
    if (idx === -1) throw new Error('Not found');
    rt[key][idx] = { ...rt[key][idx], status: 'deleted' };
    return { ok: true };
  }
  return deleteJson(`/admin/content/${segment}/${id}`);
}

function findContentRow(segment, id) {
  const rt = getStaticRuntime();
  const key = segment === 'posts' ? 'posts' : segment === 'reels' ? 'reels' : segment === 'stories' ? 'stories' : 'comments';
  return rt[key].find((r) => r._id === id);
}

export async function adminGetReportsList({ page = 1, limit = 20, category = '', status = '' } = {}) {
  if (isAdminStaticDataMode()) {
    let list = [...getStaticRuntime().reports];
    if (category) list = list.filter((r) => r.category === category);
    if (status) list = list.filter((r) => r.status === status);
    return paginate(list, page, limit);
  }
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) q.set('category', category);
  if (status) q.set('status', status);
  return getJson(`/admin/reports?${q}`);
}

export async function adminPatchReportAction(id, body) {
  if (isAdminStaticDataMode()) {
    const r = getStaticRuntime().reports.find((x) => x._id === id);
    if (!r) throw new Error('Not found');
    r.actionTaken = body.actionTaken || r.actionTaken;
    r.status = body.status || 'resolved';
    return { ...r };
  }
  return patchJson(`/admin/reports/${id}/action`, body);
}

export async function adminGetNotifications(limit = 30) {
  if (isAdminStaticDataMode()) {
    return { data: getStaticRuntime().notifications.slice(0, limit) };
  }
  return getJson(`/admin/notifications?limit=${limit}`);
}

export async function adminPostNotification(body) {
  if (isAdminStaticDataMode()) {
    const rt = getStaticRuntime();
    const row = {
      _id: `b${Date.now().toString(16)}`,
      title: body.title,
      body: body.body,
      scope: body.scope || 'global',
      status: body.status || 'draft',
      bannerText: body.bannerText || '',
      createdAt: new Date().toISOString(),
    };
    rt.notifications.unshift(row);
    return row;
  }
  return postJson('/admin/notifications', body);
}

export async function adminPostNotificationSend(id) {
  if (isAdminStaticDataMode()) {
    const r = getStaticRuntime().notifications.find((x) => x._id === id);
    if (!r) throw new Error('Not found');
    r.status = 'sent';
    return { ...r };
  }
  return postJson(`/admin/notifications/${id}/send`, {});
}

export async function adminGetAds(limit = 40) {
  if (isAdminStaticDataMode()) {
    return { data: getStaticRuntime().ads.slice(0, limit) };
  }
  return getJson(`/admin/ads?limit=${limit}`);
}

export async function adminPostAd(body) {
  if (isAdminStaticDataMode()) {
    const rt = getStaticRuntime();
    const row = {
      _id: `c${Date.now().toString(16)}`,
      title: body.title,
      placement: body.placement || 'feed',
      status: body.status || 'pending',
      imageUrl: body.imageUrl || '',
      linkUrl: body.linkUrl || '',
      createdAt: new Date().toISOString(),
    };
    rt.ads.unshift(row);
    return row;
  }
  return postJson('/admin/ads', body);
}

export async function adminPatchAdApprove(id) {
  if (isAdminStaticDataMode()) {
    const a = getStaticRuntime().ads.find((x) => x._id === id);
    if (!a) throw new Error('Not found');
    a.status = 'approved';
    return { ...a };
  }
  return patchJson(`/admin/ads/${id}/approve`, {});
}

export async function adminGetAnalyticsBundle() {
  if (isAdminStaticDataMode()) {
    const rt = getStaticRuntime();
    return {
      overview: rt.analyticsOverview,
      trendingPosts: { data: rt.trendingPosts },
      trendingReels: { data: rt.trendingReels },
      hashtags: { data: rt.hashtags },
    };
  }
  const [overview, trendingPosts, trendingReels, hashtags] = await Promise.all([
    getJson('/admin/analytics/overview'),
    getJson('/admin/analytics/trending/posts'),
    getJson('/admin/analytics/trending/reels'),
    getJson('/admin/analytics/trending/hashtags'),
  ]);
  return { overview, trendingPosts, trendingReels, hashtags };
}

export async function adminGetSettingsApp() {
  if (isAdminStaticDataMode()) {
    return { ...getStaticRuntime().settingsApp };
  }
  return getJson('/admin/settings/app');
}

export async function adminGetSettingsAdmins() {
  if (isAdminStaticDataMode()) {
    return { data: [...getStaticRuntime().admins] };
  }
  return getJson('/admin/settings/admins');
}

export async function adminPutSettingsAppKey(key, value) {
  if (isAdminStaticDataMode()) {
    getStaticRuntime().settingsApp[key] = value;
    return { ok: true };
  }
  return putJson(`/admin/settings/app/${encodeURIComponent(key)}`, { value });
}

export async function adminGetFinancePayouts(limit = 30) {
  if (isAdminStaticDataMode()) {
    return { data: getStaticRuntime().payouts.slice(0, limit) };
  }
  return getJson(`/admin/finance/payouts?limit=${limit}`);
}

export async function adminGetFinanceTransactions(limit = 30) {
  if (isAdminStaticDataMode()) {
    return { data: getStaticRuntime().transactions.slice(0, limit) };
  }
  return getJson(`/admin/finance/transactions?limit=${limit}`);
}

export async function adminPatchPayout(id, body) {
  if (isAdminStaticDataMode()) {
    const p = getStaticRuntime().payouts.find((x) => x._id === id);
    if (!p) throw new Error('Not found');
    p.status = body.status;
    return { ...p };
  }
  return patchJson(`/admin/finance/payouts/${id}`, body);
}

export async function adminGetLogs(tab, limit = 40) {
  if (isAdminStaticDataMode()) {
    const rt = getStaticRuntime();
    if (tab === 'users') return { data: [...rt.userLogs].slice(0, limit) };
    if (tab === 'deleted') return { data: [...rt.deletedLogs].slice(0, limit) };
    return { data: [...rt.adminLogs].slice(0, limit) };
  }
  let path = '/admin/logs/admin';
  if (tab === 'users') path = '/admin/logs/users';
  if (tab === 'deleted') path = '/admin/logs/deleted-content';
  return getJson(`${path}?limit=${limit}`);
}
