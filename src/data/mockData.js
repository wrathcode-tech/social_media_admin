export const stats = {
  totalUsers: 48291,
  activeToday: 12840,
  posts24h: 9342,
  openReports: 127,
  growthPct: 12.4,
};

export const dashboardInsights = {
  verifiedCreators: 842,
  avgSessionMin: 18.4,
  reportsResolved7d: 94,
  contentRemovals24h: 23,
  newSignups7d: 2104,
};

export const moderationQueue = [
  { id: 'mq1', type: 'Post', ref: 'p3', user: 'spam_bot_x', reason: 'Spam', waiting: '12m' },
  { id: 'mq2', type: 'Reel', ref: 'p4', user: 'mumbai_vibes', reason: 'Policy review', waiting: '28m' },
  { id: 'mq3', type: 'Profile', ref: '@unknown_44', user: 'unknown_44', reason: 'Impersonation', waiting: '1h' },
  { id: 'mq4', type: 'Comment', ref: 'c8821', user: 'user_8821', reason: 'Harassment', waiting: '2h' },
];

export const recentActivity = [
  { id: 1, type: 'report', text: 'Post flagged for spam — @riya_sharma', time: '2 min' },
  { id: 2, type: 'user', text: 'New verified creator — @gtbs_official', time: '14 min' },
  { id: 3, type: 'post', text: 'Trending reel removed — policy', time: '1 hr' },
  { id: 4, type: 'user', text: 'Account suspended — repeated violations', time: '2 hr' },
  { id: 5, type: 'report', text: 'Bulk reports on hashtag #deal', time: '3 hr' },
  { id: 6, type: 'post', text: 'AI label applied — synthetic media', time: '5 hr' },
];

export const users = [
  { id: 'u1', username: 'priya_lens', email: 'priya@email.com', followers: 12400, posts: 890, status: 'active', joined: '2024-06-12', lastActive: '12 min', country: 'IN' },
  { id: 'u2', username: 'gtbs_official', email: 'team@gtbs.in', followers: 210000, posts: 3420, status: 'verified', joined: '2023-01-08', lastActive: 'now', country: 'IN' },
  { id: 'u3', username: 'flicksy_creator', email: 'creator@flicksy.app', followers: 5600, posts: 412, status: 'active', joined: '2025-02-01', lastActive: '3 hr', country: 'US' },
  { id: 'u4', username: 'spam_bot_x', email: 'x@temp.mail', followers: 12, posts: 900, status: 'suspended', joined: '2025-03-20', lastActive: '1 day', country: 'RU' },
  { id: 'u5', username: 'mumbai_vibes', email: 'vibes@email.com', followers: 89000, posts: 1200, status: 'active', joined: '2024-11-03', lastActive: '45 min', country: 'IN' },
  { id: 'u6', username: 'riya_sharma', email: 'riya.s@gmail.com', followers: 45000, posts: 620, status: 'verified', joined: '2024-03-18', lastActive: '2 hr', country: 'IN' },
  { id: 'u7', username: 'delhi_stories', email: 'stories@outlook.com', followers: 12000, posts: 340, status: 'active', joined: '2024-08-22', lastActive: '6 hr', country: 'IN' },
  { id: 'u8', username: 'tech_talks_in', email: 'tech@gtbs.io', followers: 7800, posts: 210, status: 'active', joined: '2025-01-14', lastActive: '1 hr', country: 'IN' },
  { id: 'u9', username: 'unknown_44', email: 'u44@proton.me', followers: 890, posts: 56, status: 'active', joined: '2025-03-01', lastActive: '30 min', country: 'AE' },
  { id: 'u10', username: 'foodie_circle', email: 'food@email.com', followers: 156000, posts: 2100, status: 'verified', joined: '2023-11-02', lastActive: '20 min', country: 'IN' },
  { id: 'u11', username: 'travel_diary', email: 'travel@email.com', followers: 23400, posts: 780, status: 'active', joined: '2024-05-09', lastActive: '4 hr', country: 'GB' },
  { id: 'u12', username: 'mod_support', email: 'mods@flicksy.app', followers: 1200, posts: 45, status: 'active', joined: '2023-06-01', lastActive: 'now', country: 'IN' },
  { id: 'u13', username: 'ban_temp_01', email: 'temp@mail.com', followers: 3, posts: 120, status: 'suspended', joined: '2025-03-28', lastActive: '2 day', country: 'NG' },
  { id: 'u14', username: 'music_lab', email: 'music@email.com', followers: 6700, posts: 190, status: 'active', joined: '2024-12-01', lastActive: '8 hr', country: 'DE' },
];

export function getUserById(id) {
  return users.find((u) => u.id === id) ?? null;
}

export const posts = [
  { id: 'p1', user: 'priya_lens', caption: 'Sunset at Marine Drive 🌅 #GTBS #Flicksy', likes: 3421, comments: 89, status: 'live', type: 'reel' },
  { id: 'p2', user: 'gtbs_official', caption: 'New update rolling out...', likes: 12000, comments: 450, status: 'live', type: 'carousel' },
  { id: 'p3', user: 'spam_bot_x', caption: 'Click here!!!', likes: 3, comments: 0, status: 'flagged', type: 'photo' },
  { id: 'p4', user: 'mumbai_vibes', caption: 'Street food tour', likes: 8900, comments: 201, status: 'review', type: 'reel' },
  { id: 'p5', user: 'flicksy_creator', caption: 'Tutorial: filters', likes: 560, comments: 34, status: 'live', type: 'reel' },
  { id: 'p6', user: 'riya_sharma', caption: 'OOTD ✨', likes: 12000, comments: 312, status: 'live', type: 'photo' },
  { id: 'p7', user: 'foodie_circle', caption: 'Best biryani in town', likes: 45000, comments: 890, status: 'live', type: 'reel' },
  { id: 'p8', user: 'unknown_44', caption: 'Limited offer DM', likes: 12, comments: 2, status: 'flagged', type: 'carousel' },
  { id: 'p9', user: 'delhi_stories', caption: 'Winter fog timelapse', likes: 5600, comments: 78, status: 'live', type: 'reel' },
  { id: 'p10', user: 'tech_talks_in', caption: 'Flicksy tips thread', likes: 890, comments: 45, status: 'review', type: 'photo' },
  { id: 'p11', user: 'travel_diary', caption: 'Airport hacks', likes: 3400, comments: 120, status: 'live', type: 'reel' },
  { id: 'p12', user: 'music_lab', caption: 'Sample pack drop', likes: 2100, comments: 56, status: 'live', type: 'carousel' },
];

export const reports = [
  { id: 'r1', target: 'Post p3', reporter: 'user_8821', reason: 'Spam / misleading', priority: 'high', status: 'open', date: '2026-03-31' },
  { id: 'r2', target: 'User @unknown_44', reporter: 'priya_lens', reason: 'Harassment', priority: 'high', status: 'open', date: '2026-03-30' },
  { id: 'r3', target: 'Comment on p4', reporter: 'mod_auto', reason: 'Hate speech (AI)', priority: 'medium', status: 'in_review', date: '2026-03-30' },
  { id: 'r4', target: 'Post p2', reporter: 'user_991', reason: 'Copyright', priority: 'low', status: 'resolved', date: '2026-03-28' },
  { id: 'r5', target: 'Post p8', reporter: 'mod_support', reason: 'Scam / fraud', priority: 'high', status: 'open', date: '2026-03-31' },
  { id: 'r6', target: 'Reel p7', reporter: 'user_4412', reason: 'Nudity (false positive?)', priority: 'medium', status: 'in_review', date: '2026-03-29' },
  { id: 'r7', target: 'User @spam_bot_x', reporter: 'foodie_circle', reason: 'Spam comments', priority: 'high', status: 'open', date: '2026-03-29' },
  { id: 'r8', target: 'Story s882', reporter: 'user_221', reason: 'Self-harm', priority: 'high', status: 'in_review', date: '2026-03-29' },
  { id: 'r9', target: 'Post p10', reporter: 'mod_auto', reason: 'Misinformation', priority: 'low', status: 'open', date: '2026-03-28' },
  { id: 'r10', target: 'Comment c991', reporter: 'riya_sharma', reason: 'Bullying', priority: 'medium', status: 'resolved', date: '2026-03-27' },
  { id: 'r11', target: 'Live L44', reporter: 'user_778', reason: 'Copyright audio', priority: 'low', status: 'resolved', date: '2026-03-26' },
  { id: 'r12', target: 'Post p1', reporter: 'user_003', reason: 'Spam hashtag', priority: 'low', status: 'open', date: '2026-03-25' },
];
