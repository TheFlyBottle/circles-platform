import { auth } from '@/auth';

export async function getSession() {
  const session = await auth();
  if (!session?.user?.email) return null;

  return {
    adminId: session.user.email,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role || 'admin',
    forcePasswordChange: Boolean(session.user.forcePasswordChange)
  };
}

export function isSuperAdmin(session) {
  return session?.role === 'super_admin' || session?.email === 'diba.makki@theflybottle.org';
}
