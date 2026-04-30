import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { changeAdminPassword } from '@/lib/admin-auth';

export async function PATCH(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    await changeAdminPassword(session.email, currentPassword, newPassword);

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change Admin Password Error:', error);

    const message = error.message || 'Internal Server Error';
    const status = message.includes('required') || message.includes('incorrect') || message.includes('at least') || message.includes('not found') ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
