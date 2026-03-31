import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: String,
    type: { type: String, enum: ['photo', 'carousel', 'reel'], default: 'photo' },
    status: { type: String, enum: ['live', 'hidden', 'deleted'], default: 'live' },
    isSensitive: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Post = mongoose.model('Post', postSchema);
