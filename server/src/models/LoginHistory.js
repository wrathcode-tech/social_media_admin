import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: String,
    userAgent: String,
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
