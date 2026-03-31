import mongoose from 'mongoose';

const deletedContentLogSchema = new mongoose.Schema(
  {
    contentType: String,
    contentId: mongoose.Schema.Types.ObjectId,
    snapshot: mongoose.Schema.Types.Mixed,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reason: String,
  },
  { timestamps: true }
);

export const DeletedContentLog = mongoose.model('DeletedContentLog', deletedContentLogSchema);
