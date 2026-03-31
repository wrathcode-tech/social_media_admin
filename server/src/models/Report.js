import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ['post', 'user', 'comment', 'reel', 'story'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, enum: ['spam', 'nude', 'harassment', 'fake', 'other'], default: 'other' },
    status: { type: String, enum: ['pending', 'reviewing', 'resolved'], default: 'pending' },
    actionTaken: String,
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
