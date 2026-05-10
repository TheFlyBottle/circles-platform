import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getSession, isSuperAdmin } from '@/lib/auth';
import { SUPER_ADMIN_EMAILS, normalizeAdminEmail } from '@/lib/admin-auth';
import { recordAdminAction } from '@/lib/audit-log';

export async function DELETE(_req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Only the super admin can remove admins.' }, { status: 403 });
    }

    const { id } = await params;

    await connectMongo();
    const admin = await Admin.findById(id);
    if (!admin) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });

    const email = normalizeAdminEmail(admin.email);
    if (SUPER_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Super admins cannot be removed.' }, { status: 400 });
    }

    if (email === normalizeAdminEmail(session.email)) {
      return NextResponse.json({ error: 'You cannot remove your own account.' }, { status: 400 });
    }

    const adminName = `${admin.firstName} ${admin.lastName}`.trim();
    await Admin.findByIdAndDelete(id);
    await recordAdminAction(session, {
      action: 'admin.delete',
      resourceType: 'admin',
      resourceId: id,
      resourceLabel: email,
      details: {
        name: adminName,
        position: admin.position || '',
        department: admin.department || ''
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Admin Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
