import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    action: String,
    resource: String,
    resourceId: mongoose.Schema.Types.ObjectId,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
