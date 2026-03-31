import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: String,
    text: String,
    status: { type: String, enum: ['live', 'hidden', 'deleted'], default: 'live' },
  },
  { timestamps: true }
);

export const Story = mongoose.model('Story', storySchema);
