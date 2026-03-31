/** Seed shapes mirror admin HTTP responses (Mongo-style _id strings). */

export const IDS = {
  u1: '507f1f77bcf86cd799439001',
  u2: '507f1f77bcf86cd799439002',
  u3: '507f1f77bcf86cd799439003',
  u4: '507f1f77bcf86cd799439004',
  u5: '507f1f77bcf86cd799439005',
  u6: '507f1f77bcf86cd799439006',
  u7: '507f1f77bcf86cd799439007',
  u8: '507f1f77bcf86cd799439008',
  u9: '507f1f77bcf86cd799439009',
  u10: '507f1f77bcf86cd79943900a',
  u11: '507f1f77bcf86cd79943900b',
  u12: '507f1f77bcf86cd79943900c',
};

const day = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

function growthPoints(len, base = 120) {
  return Array.from({ length: len }, (_, i) => ({
    date: day(len - 1 - i),
    newSignups: Math.round(base + Math.sin(i * 0.7) * 40 + i * 3),
  }));
}

export function buildStaticSeed() {
  const users = [
    {
      _id: IDS.u1,
      username: 'priya_lens',
      email: 'priya@email.com',
      followersCount: 12400,
      followingCount: 890,
      status: 'active',
      createdAt: day(400),
    },
    {
      _id: IDS.u2,
      username: 'gtbs_official',
      email: 'team@gtbs.in',
      followersCount: 210000,
      followingCount: 120,
      status: 'active',
      createdAt: day(800),
    },
    {
      _id: IDS.u3,
      username: 'flicksy_creator',
      email: 'creator@flicksy.app',
      followersCount: 5600,
      followingCount: 412,
      status: 'active',
      createdAt: day(60),
    },
    {
      _id: IDS.u4,
      username: 'spam_bot_x',
      email: 'x@temp.mail',
      followersCount: 12,
      followingCount: 0,
      status: 'blocked',
      createdAt: day(5),
    },
    {
      _id: IDS.u5,
      username: 'mumbai_vibes',
      email: 'vibes@email.com',
      followersCount: 89000,
      followingCount: 340,
      status: 'active',
      createdAt: day(200),
    },
    {
      _id: IDS.u6,
      username: 'riya_sharma',
      email: 'riya.s@gmail.com',
      followersCount: 45000,
      followingCount: 900,
      status: 'active',
      createdAt: day(300),
    },
    {
      _id: IDS.u7,
      username: 'delhi_stories',
      email: 'stories@outlook.com',
      followersCount: 12000,
      followingCount: 450,
      status: 'active',
      createdAt: day(150),
    },
    {
      _id: IDS.u8,
      username: 'tech_talks_in',
      email: 'tech@gtbs.io',
      followersCount: 7800,
      followingCount: 200,
      status: 'active',
      createdAt: day(80),
    },
    {
      _id: IDS.u9,
      username: 'unknown_44',
      email: 'u44@proton.me',
      followersCount: 890,
      followingCount: 120,
      status: 'active',
      createdAt: day(30),
    },
    {
      _id: IDS.u10,
      username: 'foodie_circle',
      email: 'food@email.com',
      followersCount: 156000,
      followingCount: 400,
      status: 'active',
      createdAt: day(500),
    },
    {
      _id: IDS.u11,
      username: 'travel_diary',
      email: 'travel@email.com',
      followersCount: 23400,
      followingCount: 600,
      status: 'active',
      createdAt: day(220),
    },
    {
      _id: IDS.u12,
      username: 'music_lab',
      email: 'music@email.com',
      followersCount: 6700,
      followingCount: 310,
      status: 'active',
      createdAt: day(90),
    },
  ];

  users.forEach((u) => {
    u.avatarUrl = `https://picsum.photos/seed/u${String(u.username).replace(/\W/g, '')}/128/128`;
  });

  const titleCase = (s) =>
    s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

  users.forEach((u, idx) => {
    const isU7 = u._id === IDS.u7;
    const isU4 = u._id === IDS.u4;
    Object.assign(u, {
      displayName: titleCase(u.username.replace(/_/g, ' ')),
      phone: `+91 98765${String(100000 + idx * 1111).slice(0, 5)}`,
      bio: isU7
        ? 'Delhi-based storyteller · Travel & street culture · Collabs: stories@outlook.com'
        : `Creator on Flicksy — ${u.username}.`,
      website: isU7 ? 'https://delhistories.example.com' : '',
      country: 'IN',
      city: isU7 ? 'New Delhi' : ['Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai'][idx % 5],
      language: idx % 2 === 0 ? 'hi' : 'en',
      gender: ['female', 'male', 'unspecified'][idx % 3],
      birthDate: day(365 * (22 + (idx % 12))),
      coverUrl: `https://picsum.photos/seed/cover${String(u.username).replace(/\W/g, '')}/1200/380`,
      emailVerified: !isU4,
      phoneVerified: !isU4 && idx % 5 !== 0,
      twoFactorEnabled: u._id === IDS.u2 || isU7,
      isPrivateAccount: u._id === IDS.u9,
      lastActiveAt: day(idx % 4),
      updatedAt: day(1),
      postsCount: 24 + idx * 11,
      reelsCount: 60 + idx * 6,
      storiesCount: 15 + idx * 2,
      likesReceivedCount: Math.min(9999999, (u.followersCount || 0) * 2 + idx * 500),
      reportsAgainstCount: isU4 ? 18 : idx % 6,
      strikesCount: isU4 ? 2 : 0,
      riskScore: isU4 ? 85 : Math.min(40, 5 + idx * 3),
      creatorProgram: (u.followersCount || 0) >= 5000,
      walletBalance: (u.followersCount || 0) >= 5000 ? Math.round(5000 + idx * 813.25) : 0,
      walletCurrency: 'INR',
      signupSource: ['organic', 'invite', 'google', 'phone_otp'][idx % 4],
      deviceLast: 'Flicksy 3.2.1 · Android 14',
      ipCountry: 'IN',
      referralCode: `${u.username.slice(0, 4).toUpperCase()}${String(idx).padStart(4, '0')}`,
      adminNotes: isU7
        ? 'VIP creator — priority support; brand deals pipeline.'
        : isU4
          ? 'Automated spam signals; monitoring.'
          : '',
    });
  });

  const author = (id) => {
    const u = users.find((x) => x._id === id);
    return { _id: id, username: u?.username, email: u?.email, avatarUrl: u?.avatarUrl };
  };

  const posts = [
    {
      _id: '607f1f77bcf86cd799439101',
      author: author(IDS.u1),
      caption: 'Sunset at Marine Drive #GTBS #Flicksy',
      type: 'photo',
      status: 'live',
      isSensitive: false,
      likesCount: 3421,
      commentsCount: 89,
      createdAt: day(1),
    },
    {
      _id: '607f1f77bcf86cd799439102',
      author: author(IDS.u2),
      caption: 'New app update rolling out this week.',
      type: 'carousel',
      status: 'live',
      isSensitive: false,
      likesCount: 12000,
      commentsCount: 450,
      createdAt: day(2),
    },
    {
      _id: '607f1f77bcf86cd799439103',
      author: author(IDS.u4),
      caption: 'Click here for free followers!!!',
      type: 'photo',
      status: 'live',
      isSensitive: false,
      likesCount: 3,
      commentsCount: 0,
      createdAt: day(0),
    },
    {
      _id: '607f1f77bcf86cd799439104',
      author: author(IDS.u5),
      caption: 'Street food tour — Andheri edition',
      type: 'reel',
      status: 'hidden',
      isSensitive: false,
      likesCount: 8900,
      commentsCount: 201,
      createdAt: day(3),
    },
    {
      _id: '607f1f77bcf86cd799439105',
      author: author(IDS.u6),
      caption: 'OOTD — spring palette',
      type: 'photo',
      status: 'live',
      isSensitive: true,
      likesCount: 12000,
      commentsCount: 312,
      createdAt: day(1),
    },
    {
      _id: '607f1f77bcf86cd799439106',
      author: author(IDS.u10),
      caption: 'Best biryani in town (honest ranking)',
      type: 'reel',
      status: 'live',
      isSensitive: false,
      likesCount: 45000,
      commentsCount: 890,
      createdAt: day(4),
    },
  ];

  posts.forEach((p) => {
    p.mediaUrl = `https://picsum.photos/seed/p${String(p._id).replace(/\W/g, '').slice(-12)}/600/600`;
  });

  const reels = [
    {
      _id: '707f1f77bcf86cd799439201',
      author: author(IDS.u5),
      caption: 'Metro reel transition',
      videoUrl: 'https://example.com/v1.mp4',
      status: 'live',
      isSensitive: false,
      viewsCount: 890000,
      createdAt: day(1),
    },
    {
      _id: '707f1f77bcf86cd799439202',
      author: author(IDS.u1),
      caption: 'Golden hour portrait',
      videoUrl: 'https://example.com/v2.mp4',
      status: 'live',
      isSensitive: false,
      viewsCount: 120000,
      createdAt: day(2),
    },
    {
      _id: '707f1f77bcf86cd799439203',
      author: author(IDS.u6),
      caption: 'Dance challenge',
      videoUrl: 'https://example.com/v3.mp4',
      status: 'live',
      isSensitive: false,
      viewsCount: 560000,
      createdAt: day(0),
    },
    {
      _id: '707f1f77bcf86cd799439204',
      author: author(IDS.u4),
      caption: 'Promo — DM for deals',
      videoUrl: 'https://example.com/v4.mp4',
      status: 'live',
      isSensitive: true,
      viewsCount: 400,
      createdAt: day(5),
    },
  ];

  reels.forEach((r) => {
    r.coverUrl = `https://picsum.photos/seed/r${String(r._id).replace(/\W/g, '').slice(-12)}/360/480`;
  });

  const stories = [
    {
      _id: '807f1f77bcf86cd799439301',
      author: author(IDS.u2),
      mediaUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
      text: 'Launch day 🚀',
      status: 'live',
      createdAt: day(0),
    },
    {
      _id: '807f1f77bcf86cd799439302',
      author: author(IDS.u5),
      mediaUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      text: 'Food walk',
      status: 'live',
      createdAt: day(0),
    },
    {
      _id: '807f1f77bcf86cd799439303',
      author: author(IDS.u7),
      mediaUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
      text: '',
      status: 'hidden',
      createdAt: day(1),
    },
  ];

  const comments = [
    {
      _id: '907f1f77bcf86cd799439401',
      author: author(IDS.u8),
      post: '607f1f77bcf86cd799439101',
      text: 'Beautiful shot!',
      status: 'live',
      createdAt: day(0),
    },
    {
      _id: '907f1f77bcf86cd799439402',
      author: author(IDS.u4),
      post: '607f1f77bcf86cd799439102',
      text: 'Free crypto here click my profile',
      status: 'live',
      createdAt: day(0),
    },
    {
      _id: '907f1f77bcf86cd799439403',
      author: author(IDS.u6),
      post: '607f1f77bcf86cd799439104',
      text: 'Love this series, more please',
      status: 'live',
      createdAt: day(2),
    },
    {
      _id: '907f1f77bcf86cd799439404',
      author: author(IDS.u9),
      post: '607f1f77bcf86cd799439105',
      text: 'Where is this from?',
      status: 'live',
      createdAt: day(1),
    },
  ];

  const reports = [
    {
      _id: 'a07f1f77bcf86cd799439501',
      targetType: 'post',
      targetId: '607f1f77bcf86cd799439103',
      reporter: author(IDS.u8),
      category: 'spam',
      status: 'pending',
      actionTaken: undefined,
      createdAt: day(0),
    },
    {
      _id: 'a07f1f77bcf86cd799439502',
      targetType: 'user',
      targetId: IDS.u4,
      reporter: author(IDS.u10),
      category: 'harassment',
      status: 'pending',
      createdAt: day(1),
    },
    {
      _id: 'a07f1f77bcf86cd799439503',
      targetType: 'comment',
      targetId: '907f1f77bcf86cd799439402',
      reporter: author(IDS.u2),
      category: 'spam',
      status: 'reviewing',
      createdAt: day(1),
    },
    {
      _id: 'a07f1f77bcf86cd799439504',
      targetType: 'reel',
      targetId: '707f1f77bcf86cd799439204',
      reporter: author(IDS.u6),
      category: 'fake',
      status: 'pending',
      createdAt: day(2),
    },
    {
      _id: 'a07f1f77bcf86cd799439505',
      targetType: 'story',
      targetId: '807f1f77bcf86cd799439303',
      reporter: author(IDS.u1),
      category: 'other',
      status: 'resolved',
      actionTaken: 'warn',
      createdAt: day(10),
    },
    {
      _id: 'a07f1f77bcf86cd799439506',
      targetType: 'post',
      targetId: '607f1f77bcf86cd799439106',
      reporter: author(IDS.u11),
      category: 'other',
      status: 'pending',
      createdAt: day(0),
    },
  ];

  const notifications = [
    {
      _id: 'b07f1f77bcf86cd799439601',
      title: 'Weekly recap',
      body: 'See what you missed on Flicksy.',
      scope: 'global',
      status: 'sent',
      bannerText: '',
      createdAt: day(7),
    },
    {
      _id: 'b07f1f77bcf86cd799439602',
      title: 'Creator fund',
      body: 'Applications open for March batch.',
      scope: 'users',
      status: 'draft',
      bannerText: '',
      createdAt: day(2),
    },
    {
      _id: 'b07f1f77bcf86cd799439603',
      title: 'Maintenance',
      body: '',
      scope: 'banner',
      status: 'scheduled',
      bannerText: 'Brief downtime tonight 2–3 AM IST',
      createdAt: day(1),
    },
  ];

  const ads = [
    {
      _id: 'c07f1f77bcf86cd799439701',
      title: 'GTBS Pro — try free',
      placement: 'feed',
      status: 'approved',
      imageUrl: 'https://picsum.photos/seed/adgtbspro/320/200',
      linkUrl: 'https://gtbs.in',
      createdAt: day(14),
    },
    {
      _id: 'c07f1f77bcf86cd799439702',
      title: 'Summer sale',
      placement: 'reels',
      status: 'pending',
      imageUrl: 'https://picsum.photos/seed/adsummer/320/200',
      linkUrl: 'https://example.com/sale',
      createdAt: day(1),
    },
    {
      _id: 'c07f1f77bcf86cd799439703',
      title: 'Brand story takeover',
      placement: 'story',
      status: 'approved',
      imageUrl: 'https://picsum.photos/seed/adbrand/320/200',
      linkUrl: 'https://example.com/brand',
      createdAt: day(30),
    },
  ];

  const payouts = [
    {
      _id: 'd07f1f77bcf86cd799439801',
      creator: author(IDS.u5),
      amount: 12500,
      currency: 'INR',
      status: 'pending',
      createdAt: day(1),
    },
    {
      _id: 'd07f1f77bcf86cd799439802',
      creator: author(IDS.u1),
      amount: 4200,
      currency: 'INR',
      status: 'approved',
      createdAt: day(5),
    },
    {
      _id: 'd07f1f77bcf86cd799439803',
      creator: author(IDS.u6),
      amount: 8900,
      currency: 'INR',
      status: 'rejected',
      createdAt: day(20),
    },
  ];

  const transactions = [
    { _id: 'e07f1f77bcf86cd799439901', type: 'payout', amount: 4200, currency: 'INR', reference: 'payout_inr_8821', createdAt: day(5) },
    { _id: 'e07f1f77bcf86cd799439902', type: 'fee', amount: 120, currency: 'INR', reference: 'fee_992', createdAt: day(4) },
    { _id: 'e07f1f77bcf86cd799439903', type: 'adjustment', amount: -50, currency: 'INR', reference: 'adj_chargeback', createdAt: day(10) },
  ];

  const admins = [{ _id: 'f07f1f77bcf86cd799439a01', email: 'admin@gtbs.in', role: 'super_admin', createdAt: day(400) }];

  const settingsApp = {
    appName: 'GTBS Flicksy',
    maintenanceMode: false,
    twoFactorRequired: false,
  };

  const adminLogs = [
    {
      _id: '107f1f77bcf86cd799439b01',
      action: 'user.block',
      actorAdmin: { email: 'admin@gtbs.in' },
      createdAt: day(0),
    },
    {
      _id: '107f1f77bcf86cd799439b02',
      action: 'post.hide',
      actorAdmin: { email: 'admin@gtbs.in' },
      createdAt: day(1),
    },
    {
      _id: '107f1f77bcf86cd799439b03',
      action: 'report.action',
      actorAdmin: { email: 'admin@gtbs.in' },
      createdAt: day(2),
    },
  ];

  const userLogs = [
    {
      _id: '117f1f77bcf86cd799439c01',
      action: 'login',
      user: { username: 'priya_lens' },
      createdAt: day(0),
    },
    {
      _id: '117f1f77bcf86cd799439c02',
      action: 'post.create',
      user: { username: 'mumbai_vibes' },
      createdAt: day(0),
    },
    {
      _id: '117f1f77bcf86cd799439c03',
      action: 'comment.create',
      user: { username: 'riya_sharma' },
      createdAt: day(1),
    },
  ];

  const deletedLogs = [
    {
      _id: '127f1f77bcf86cd799439d01',
      contentType: 'post',
      contentId: '607f1f77bcf86cd799439099',
      deletedBy: { email: 'admin@gtbs.in' },
      createdAt: day(3),
    },
    {
      _id: '127f1f77bcf86cd799439d02',
      contentType: 'comment',
      contentId: '907f1f77bcf86cd799439499',
      deletedBy: { email: 'admin@gtbs.in' },
      createdAt: day(7),
    },
  ];

  const loginHistoryByUser = {};
  users.forEach((u) => {
    loginHistoryByUser[u._id] = [
      { _id: `${u._id}l1`, success: true, ip: '103.21.45.12', createdAt: day(0) },
      { _id: `${u._id}l2`, success: true, ip: '103.21.45.18', createdAt: day(1) },
      { _id: `${u._id}l3`, success: false, ip: '185.220.101.1', createdAt: day(2) },
    ];
  });

  const activityByUser = {};
  users.forEach((u) => {
    activityByUser[u._id] = [
      { _id: `${u._id}a1`, action: 'session.start', createdAt: day(0) },
      { _id: `${u._id}a2`, action: 'feed.scroll', createdAt: day(0) },
      { _id: `${u._id}a3`, action: 'reel.view', createdAt: day(1) },
    ];
  });

  const growthWeeklyPoints = growthPoints(14, 100);
  const analyticsEngagementSeries = growthWeeklyPoints.map((p, i) => ({
    name: new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    dau: Math.round(11800 + Math.sin(i * 0.45) * 900 + i * 40),
    signups: p.newSignups,
  }));
  const analyticsRetentionSeries = Array.from({ length: 8 }, (_, i) => ({
    name: i === 0 ? 'Week 0' : `Week ${i}`,
    pct: Math.max(14, Math.round(100 * Math.pow(0.81, i) + (i % 3) * 4)),
  }));

  return {
    summary: {
      totalUsers: 48291,
      activeUsers: 12840,
      newSignups: 342,
      totalPosts: 1892044,
      totalComments: 5120933,
      totalReels: 402881,
      reportsPending: reports.filter((r) => r.status === 'pending').length,
    },
    growth: {
      daily: growthPoints(7, 80),
      weekly: growthWeeklyPoints,
      monthly: growthPoints(30, 90),
    },
    analyticsEngagementSeries,
    analyticsRetentionSeries,
    users,
    posts,
    reels,
    stories,
    comments,
    reports,
    notifications,
    ads,
    payouts,
    transactions,
    admins,
    settingsApp,
    adminLogs,
    userLogs,
    deletedLogs,
    loginHistoryByUser,
    activityByUser,
    analyticsOverview: { dau: 12840, mau: 402100, serverCpuPct: 34 },
    trendingPosts: posts
      .filter((p) => p.status === 'live')
      .map((p) => ({
        _id: p._id,
        author: p.author,
        likesCount: p.likesCount,
        mediaUrl: p.mediaUrl,
        thumbnailUrl: p.thumbnailUrl,
      }))
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, 5),
    trendingReels: reels
      .filter((r) => r.status === 'live')
      .map((r) => ({
        _id: r._id,
        author: r.author,
        viewsCount: r.viewsCount,
        coverUrl: r.coverUrl,
        thumbnailUrl: r.coverUrl,
      }))
      .sort((a, b) => b.viewsCount - a.viewsCount)
      .slice(0, 5),
    hashtags: [
      { tag: 'flicksy', count: 128400 },
      { tag: 'gtbs', count: 89200 },
      { tag: 'reels', count: 67100 },
      { tag: 'foodie', count: 44500 },
      { tag: 'travel', count: 33200 },
    ],
  };
}
