import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    type: String,
    amount: Number,
    currency: { type: String, default: 'USD' },
    reference: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
