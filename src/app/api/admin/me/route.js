import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAdminProfileByEmail } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = await getAdminProfileByEmail(session.email);

    return NextResponse.json({ success: true, admin: admin || session });
  } catch (error) {
    console.error('Fetch Current Admin Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
