import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const UserActivity = mongoose.model('UserActivity', userActivitySchema);
