import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  actorEmail: { type: String, required: true },
  actorName: { type: String },
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  resourceLabel: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  emailedAt: { type: Date },
}, { timestamps: true });

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorEmail: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ emailedAt: 1, createdAt: 1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
