import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDb } from './config/db.js';
import { requestLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import contentRoutes from './routes/content.js';
import reportRoutes from './routes/reports.js';
import notificationRoutes from './routes/notifications.js';
import adRoutes from './routes/ads.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import financeRoutes from './routes/finance.js';
import logRoutes from './routes/logs.js';
import quickRoutes from './routes/quickActions.js';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social_admin';

app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/svc/health', (req, res) => res.json({ ok: true }));

app.use('/svc', requestLimiter);

app.use('/svc/admin/auth', authRoutes);
app.use('/svc/admin/dashboard', dashboardRoutes);
app.use('/svc/admin/users', userRoutes);
app.use('/svc/admin/content', contentRoutes);
app.use('/svc/admin/reports', reportRoutes);
app.use('/svc/admin/notifications', notificationRoutes);
app.use('/svc/admin/ads', adRoutes);
app.use('/svc/admin/analytics', analyticsRoutes);
app.use('/svc/admin/settings', settingsRoutes);
app.use('/svc/admin/finance', financeRoutes);
app.use('/svc/admin/logs', logRoutes);
app.use('/svc/admin/quick', quickRoutes);

app.use(notFound);
app.use(errorHandler);

connectDb(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Admin API http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
