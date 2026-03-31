/** Single source for sidebar + command palette (labels + search keywords). */
export const adminNavSections = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', end: true, keywords: 'home overview stats' },
      { to: '/analytics', label: 'Analytics', keywords: 'metrics dau mau trending' },
    ],
  },
  {
    title: 'Community',
    items: [
      { to: '/users', label: 'Users', keywords: 'accounts members creators' },
      { to: '/posts', label: 'Posts', keywords: 'feed photos' },
      { to: '/reels', label: 'Reels', keywords: 'video short' },
      { to: '/stories', label: 'Stories', keywords: '24h ephemeral' },
      { to: '/comments', label: 'Comments', keywords: 'replies moderation' },
    ],
  },
  {
    title: 'Trust & safety',
    items: [
      { to: '/reports', label: 'Reports', keywords: 'abuse spam moderation queue' },
      { to: '/logs', label: 'Logs', keywords: 'audit activity admin' },
    ],
  },
  {
    title: 'Growth & revenue',
    items: [
      { to: '/notifications', label: 'Notifications', keywords: 'push campaigns' },
      { to: '/ads', label: 'Ads', keywords: 'advertising placements' },
      { to: '/finance', label: 'Finance', keywords: 'payouts transactions' },
    ],
  },
  {
    title: 'System',
    items: [{ to: '/settings', label: 'Settings', keywords: 'admins config security' }],
  },
];

export function flattenNavItems() {
  const out = [];
  adminNavSections.forEach((sec) => {
    sec.items.forEach((item) => {
      out.push({ ...item, section: sec.title });
    });
  });
  return out;
}
