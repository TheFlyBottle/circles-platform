import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getSession, isSuperAdmin } from '@/lib/auth';
import { createAdminProfile, getAdminProfileByEmail, serializeAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectMongo();
    const admins = await Admin.find().sort({ createdAt: -1 }).lean();
    const currentAdmin = await getAdminProfileByEmail(session.email);

    return NextResponse.json({
      success: true,
      currentAdmin: currentAdmin || session,
      canRemoveAdmins: isSuperAdmin(session),
      admins: admins.map(serializeAdmin)
    });
  } catch (error) {
    console.error('Fetch Admins Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const admin = await createAdminProfile(data);

    return NextResponse.json({ success: true, admin }, { status: 201 });
  } catch (error) {
    console.error('Create Admin Error:', error);
    const message = error.message || 'Internal Server Error';
    const status = message.includes('required') || message.includes('email') || message.includes('Password') || message.includes('already exists') ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
