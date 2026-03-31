import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    text: String,
    status: { type: String, enum: ['live', 'hidden', 'deleted'], default: 'live' },
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
