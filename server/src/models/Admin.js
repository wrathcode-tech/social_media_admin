import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: String,
    role: { type: String, enum: ['super_admin'], default: 'super_admin' },
    permissions: [String],
    twoFactorEnabled: { type: Boolean, default: false },
    allowedIps: [String],
  },
  { timestamps: true }
);

export const Admin = mongoose.model('Admin', adminSchema);
