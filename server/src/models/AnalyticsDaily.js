import mongoose from 'mongoose';

const analyticsDailySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    dau: Number,
    mau: Number,
    newSignups: Number,
    serverCpuPct: Number,
  },
  { timestamps: true }
);

analyticsDailySchema.index({ date: 1 }, { unique: true });

export const AnalyticsDaily = mongoose.model('AnalyticsDaily', analyticsDailySchema);
