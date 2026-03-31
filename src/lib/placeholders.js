/** Stable dummy media URLs when real assets are missing (Picsum seeds). */

function seedKey(s) {
  const t = String(s ?? 'x').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  return t || 'placeholder';
}

export function userAvatarUrl(u) {
  if (u?.avatarUrl) return u.avatarUrl;
  if (u?.profileImageUrl) return u.profileImageUrl;
  return `https://picsum.photos/seed/u${seedKey(u?.username || u?.email || u?._id)}/128/128`;
}

/** Row: post / reel / story / comment from admin lists */
export function contentThumbUrl(row, segment) {
  if (row?.mediaUrl) return row.mediaUrl;
  if (row?.thumbnailUrl) return row.thumbnailUrl;
  if (row?.coverUrl) return row.coverUrl;
  if (row?.imageUrl) return row.imageUrl;
  const id = seedKey(row?._id);
  if (segment === 'reels') return `https://picsum.photos/seed/reel${id}/120/160`;
  if (segment === 'stories') return `https://picsum.photos/seed/story${id}/120/200`;
  if (segment === 'comments') {
    const a = row?.author;
    if (a && typeof a === 'object' && a.avatarUrl) return a.avatarUrl;
    return `https://picsum.photos/seed/cmt${seedKey(a?._id || a?.username || row._id)}/96/96`;
  }
  return `https://picsum.photos/seed/post${id}/120/120`;
}

export function adCreativeUrl(ad) {
  const raw = ad?.imageUrl?.trim?.();
  if (raw) return raw;
  return `https://picsum.photos/seed/ad${seedKey(ad?._id || ad?.title)}/320/180`;
}

export function notificationCampaignThumb(r) {
  return `https://picsum.photos/seed/nc${seedKey(r?._id || r?.title)}/96/96`;
}
