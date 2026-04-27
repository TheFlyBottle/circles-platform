import { cookies } from 'next/headers';

export const ADMIN_USERS = [
  { email: 'diba.makki@theflybottle.org', name: 'Diba Makki' },
  { email: 'shadi.seyedi@theflybottle.org', name: 'Shadi Seyedi' },
  { email: 'pouya@theflybottle.org', name: 'Pouya' },
];

const ADMIN_PASSWORD = 'TheFlyBottle123';

export function validateAdminLogin(email, password) {
  const normalizedEmail = email?.toLowerCase();
  const admin = ADMIN_USERS.find((user) => user.email === normalizedEmail);

  if (!admin || password !== ADMIN_PASSWORD) {
    return null;
  }

  return admin;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_token')?.value;
  if (!session) return null;

  const admin = ADMIN_USERS.find((user) => session === `static-admin:${user.email}`);
  if (!admin) return null;

  return {
    adminId: admin.email,
    email: admin.email,
    name: admin.name,
  };
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}
