import mongoose from 'mongoose';

const payoutRequestSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  },
  { timestamps: true }
);

export const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);
