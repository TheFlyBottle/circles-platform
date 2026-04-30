import { NextResponse } from 'next/server';
import { getSession, isSuperAdmin } from '@/lib/auth';
import { deleteAdminAuditLog } from '@/lib/audit-log';

export async function DELETE(_req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Only the super admin can delete activity logs.' }, { status: 403 });
    }

    const { id } = await params;
    const deletedLog = await deleteAdminAuditLog(id);

    if (!deletedLog) {
      return NextResponse.json({ error: 'Activity log not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedLog });
  } catch (error) {
    console.error('Delete Audit Log Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
