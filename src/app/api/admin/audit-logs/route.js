import { NextResponse } from 'next/server';
import { getSession, isSuperAdmin } from '@/lib/auth';
import { clearAdminAuditLogs, getAdminAuditLogs } from '@/lib/audit-log';

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const logs = await getAdminAuditLogs({ limit: searchParams.get('limit') || 100 });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch Audit Logs Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Only the super admin can delete activity logs.' }, { status: 403 });
    }

    const deletedCount = await clearAdminAuditLogs();

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error('Clear Audit Logs Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
