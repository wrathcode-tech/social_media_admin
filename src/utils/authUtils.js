/** sessionStorage key used by betting auth flows (AuthService / apiCall). */
const USER_STORAGE_KEY = 'user';

/**
 * Parsed `user` object for demo guards and 401 handling.
 * @returns {Record<string, unknown> | null}
 */
export function getStoredUserForGuard() {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && typeof u === 'object' ? u : null;
  } catch {
    return null;
  }
}

export function isDemoUser(user) {
  if (!user || typeof user !== 'object') return false;
  return user.isDemo === true || user.is_demo === true || user.demo === true;
}

/** Demo users: allow safe URLs; wallet/sportsbook POSTs stay blocked in apiCall guard. */
export function isDemoMutationUrlAllowed(url) {
  if (!url || typeof url !== 'string') return true;
  const u = url.toLowerCase();
  const allowed = [
    'refresh-token',
    'refresh_token',
    '/auth/logout',
    'logout',
    'demo-login',
    '/auth/me',
    '/auth/login',
    '/auth/register',
    '/auth/send-otp',
    '/auth/profile',
    '/games/providers',
    '/games/categories',
    '/games/featured',
    '/games/popular',
    '/games/landing',
    '/games/launch',
    '/search/trending',
    '/search?',
    '/user/platform-configuration',
    '/user/transaction-limits',
    '/user/deposit-accounts',
    '/user/notifications',
    '/support/tickets',
    '/referral',
    '/bank-accounts',
  ];
  return allowed.some((s) => u.includes(s));
}
