import mongoose from 'mongoose';

const notificationCampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    scope: { type: String, enum: ['global', 'users', 'banner'], default: 'global' },
    bannerText: String,
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scheduledAt: Date,
    status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  },
  { timestamps: true }
);

export const NotificationCampaign = mongoose.model('NotificationCampaign', notificationCampaignSchema);
