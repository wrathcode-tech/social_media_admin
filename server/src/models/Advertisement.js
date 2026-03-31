import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    placement: { type: String, enum: ['feed', 'story', 'reels'], required: true },
    imageUrl: String,
    linkUrl: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export const Advertisement = mongoose.model('Advertisement', advertisementSchema);
