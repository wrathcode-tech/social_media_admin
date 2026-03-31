import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: String,
    videoUrl: String,
    status: { type: String, enum: ['live', 'hidden', 'deleted'], default: 'live' },
    isSensitive: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Reel = mongoose.model('Reel', reelSchema);
