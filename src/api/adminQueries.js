import { getJson, patchJson, postJson } from './apiClient';

export async function adminPostUserAdCredit(userId, { amount, note = '' } = {}) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) throw new Error('Enter a valid amount greater than zero');
  return postJson(`/admin/users/${userId}/ad-credit`, { amount: n, note: note.trim() || undefined });
}

export async function adminGetAnalyticsBundle() {
  const [overview, trendingPosts, trendingReels, hashtags] = await Promise.all([
    getJson('/admin/analytics/overview'),
    getJson('/admin/analytics/trending/posts'),
    getJson('/admin/analytics/trending/reels'),
    getJson('/admin/analytics/trending/hashtags'),
  ]);
  return { overview, trendingPosts, trendingReels, hashtags };
}

export async function adminGetFinancePayouts(limit = 30) {
  return getJson(`/admin/finance/payouts?limit=${limit}`);
}

export async function adminGetFinanceTransactions(limit = 30) {
  return getJson(`/admin/finance/transactions?limit=${limit}`);
}

export async function adminPatchPayout(id, body) {
  return patchJson(`/admin/finance/payouts/${id}`, body);
}

export async function adminGetAdPaymentRequests({ status = '', limit = 80 } = {}) {
  const q = new URLSearchParams({ limit: String(limit) });
  if (status) q.set('status', status);
  return getJson(`/admin/finance/ad-payment-requests?${q}`);
}

export async function adminPatchAdPaymentRequest(id, body) {
  return patchJson(`/admin/finance/ad-payment-requests/${id}`, body);
}

export async function adminGetLogs(tab, limit = 40) {
  let path = '/admin/logs/admin';
  if (tab === 'users') path = '/admin/logs/users';
  if (tab === 'deleted') path = '/admin/logs/deleted-content';
  return getJson(`${path}?limit=${limit}`);
}

export async function adminGetAds(limit = 40) {
  return getJson(`/admin/ads?limit=${limit}`);
}

export async function adminPostAd(body) {
  return postJson('/admin/ads', body);
}

export async function adminPatchAdApprove(id) {
  return patchJson(`/admin/ads/${id}/approve`, {});
}
