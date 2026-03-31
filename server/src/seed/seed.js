import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Story } from '../models/Story.js';
import { Reel } from '../models/Reel.js';
import { Report } from '../models/Report.js';
import { NotificationCampaign } from '../models/NotificationCampaign.js';
import { Advertisement } from '../models/Advertisement.js';
import { PayoutRequest } from '../models/PayoutRequest.js';
import { Transaction } from '../models/Transaction.js';
import { AppSettings } from '../models/AppSettings.js';
import { AnalyticsDaily } from '../models/AnalyticsDaily.js';
import { LoginHistory } from '../models/LoginHistory.js';
import { UserActivity } from '../models/UserActivity.js';
import { AuditLog } from '../models/AuditLog.js';
import { DeletedContentLog } from '../models/DeletedContentLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social_admin';

async function run() {
  await connectDb(MONGODB_URI);
  await Promise.all([
    Admin.deleteMany({}),
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Story.deleteMany({}),
    Reel.deleteMany({}),
    Report.deleteMany({}),
    NotificationCampaign.deleteMany({}),
    Advertisement.deleteMany({}),
    PayoutRequest.deleteMany({}),
    Transaction.deleteMany({}),
    AppSettings.deleteMany({}),
    AnalyticsDaily.deleteMany({}),
    LoginHistory.deleteMany({}),
    UserActivity.deleteMany({}),
    AuditLog.deleteMany({}),
    DeletedContentLog.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await Admin.create({
    email: 'admin@gtbs.in',
    passwordHash,
    name: 'Super Admin',
    role: 'super_admin',
  });

  const users = await User.create([
    {
      username: 'creator1',
      email: 'c1@test.com',
      followersCount: 1200,
      followingCount: 80,
      displayName: 'Creator One',
      phone: '+91 9876500001',
      bio: 'Demo creator account',
      country: 'IN',
      city: 'Mumbai',
      language: 'en',
      emailVerified: true,
      phoneVerified: true,
      postsCount: 42,
      reelsCount: 18,
      storiesCount: 9,
      likesReceivedCount: 15000,
      creatorProgram: true,
      walletBalance: 4200.5,
      signupSource: 'organic',
      deviceLast: 'Flicksy 3.2.0 · iOS 17',
      referralCode: 'CREA0001',
      lastActiveAt: new Date(),
    },
    {
      username: 'creator2',
      email: 'c2@test.com',
      followersCount: 8900,
      followingCount: 120,
      displayName: 'Creator Two',
      country: 'IN',
      city: 'Bengaluru',
      emailVerified: true,
      postsCount: 120,
      reelsCount: 64,
      storiesCount: 22,
      likesReceivedCount: 89000,
      creatorProgram: true,
      walletBalance: 12800,
      twoFactorEnabled: true,
      signupSource: 'google',
      lastActiveAt: new Date(),
    },
    {
      username: 'badactor',
      email: 'bad@test.com',
      status: 'blocked',
      followersCount: 3,
      followingCount: 10,
      displayName: 'Bad Actor',
      emailVerified: false,
      reportsAgainstCount: 24,
      strikesCount: 3,
      riskScore: 92,
      postsCount: 2,
      reelsCount: 0,
      storiesCount: 0,
      signupSource: 'phone_otp',
      adminNotes: 'Spam pattern — account blocked after automated review.',
      lastActiveAt: new Date(Date.now() - 86400000 * 14),
    },
  ]);

  const posts = await Post.create([
    { author: users[0]._id, caption: 'Sunset vibes #demo', type: 'photo', likesCount: 400, commentsCount: 12 },
    { author: users[1]._id, caption: 'Product launch #launch', type: 'carousel', likesCount: 1200, commentsCount: 44, status: 'live' },
  ]);

  await Comment.create({ author: users[0]._id, post: posts[0]._id, text: 'Great shot!' });
  await Story.create({ author: users[0]._id, text: 'Behind the scenes', mediaUrl: 'https://example.com/s1.jpg' });
  await Reel.create({ author: users[1]._id, caption: 'Dance trend', videoUrl: 'https://example.com/r1.mp4', viewsCount: 50000 });

  await Report.create({
    targetType: 'post',
    targetId: posts[0]._id,
    reporter: users[1]._id,
    category: 'spam',
    status: 'pending',
  });

  await NotificationCampaign.create({
    title: 'Welcome',
    body: 'Thanks for joining',
    scope: 'global',
    status: 'draft',
  });

  await Advertisement.create({
    title: 'Sponsored',
    placement: 'feed',
    status: 'pending',
  });

  await PayoutRequest.create({ creator: users[0]._id, amount: 250, currency: 'USD', status: 'pending' });
  await Transaction.create({ type: 'fee', amount: 2.5, currency: 'USD', reference: 'TX-001' });

  await AppSettings.create([
    { key: 'appName', value: 'GTBS Flicksy' },
    { key: 'maintenanceMode', value: false },
    { key: 'twoFactorRequired', value: false },
  ]);

  for (let i = 44; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(12, 0, 0, 0);
    const wave = Math.round(42 + Math.sin(i * 0.35) * 28 + (i % 7) * 9 + (i % 3) * 5);
    await AnalyticsDaily.create({
      date: d,
      dau: 820 + (i % 14) * 45 + Math.round(Math.sin(i * 0.2) * 120),
      mau: 11800 + i * 95 + (i % 5) * 200,
      newSignups: Math.max(12, wave),
      serverCpuPct: 18 + ((i * 7) % 22),
    });
  }

  await LoginHistory.create({ user: users[0]._id, ip: '127.0.0.1', success: true });
  await UserActivity.create({ user: users[0]._id, action: 'login' });
  await AuditLog.create({ actorAdmin: admin._id, action: 'seed', resource: 'system' });

  console.log('Seed OK. Admin: admin@gtbs.in / Admin123!');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
