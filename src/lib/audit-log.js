import connectMongo from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { serializeDocs } from '@/lib/serialize';
import { sendAuditLogDigestEmail } from '@/lib/email';

export const AUDIT_LOG_LIMIT = 50;

async function sendDigestIfLimitReached() {
  const unemailedLogs = await AuditLog.find({ emailedAt: { $exists: false } })
    .sort({ createdAt: 1 })
    .limit(AUDIT_LOG_LIMIT)
    .lean();

  if (unemailedLogs.length < AUDIT_LOG_LIMIT) return;

  const sent = await sendAuditLogDigestEmail(serializeDocs(unemailedLogs));
  if (!sent) return;

  await AuditLog.updateMany(
    { _id: { $in: unemailedLogs.map((log) => log._id) } },
    { $set: { emailedAt: new Date() } }
  );
}

async function pruneAuditLogsToLimit() {
  const logsToKeep = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(AUDIT_LOG_LIMIT)
    .select('_id')
    .lean();

  const keepIds = logsToKeep.map((log) => log._id);
  if (keepIds.length < AUDIT_LOG_LIMIT) return;

  await AuditLog.deleteMany({
    _id: { $nin: keepIds },
    emailedAt: { $exists: true }
  });
}

export async function recordAdminAction(session, action) {
  if (!session?.email || !action?.action || !action?.resourceType) return null;

  try {
    await connectMongo();

    const log = await AuditLog.create({
      actorEmail: session.email,
      actorName: session.name || session.email,
      action: action.action,
      resourceType: action.resourceType,
      resourceId: action.resourceId ? String(action.resourceId) : undefined,
      resourceLabel: action.resourceLabel || '',
      details: action.details || {}
    });

    await sendDigestIfLimitReached();
    await pruneAuditLogsToLimit();

    return log;
  } catch (error) {
    console.error('Audit Log Error:', error);
    return null;
  }
}

export async function getAdminAuditLogs({ limit = AUDIT_LOG_LIMIT } = {}) {
  await connectMongo();

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || AUDIT_LOG_LIMIT, 1), AUDIT_LOG_LIMIT);
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(safeLimit).lean();

  return serializeDocs(logs);
}

export async function deleteAdminAuditLog(id) {
  await connectMongo();

  const deleted = await AuditLog.findByIdAndDelete(id).lean();
  return deleted ? serializeDocs([deleted])[0] : null;
}

export async function clearAdminAuditLogs() {
  await connectMongo();

  const result = await AuditLog.deleteMany({});
  return result.deletedCount || 0;
}
