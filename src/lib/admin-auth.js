import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/mongodb';
import Admin from '@/models/Admin';

export const SUPER_ADMIN_EMAIL = 'diba.makki@theflybottle.org';
const BOOTSTRAP_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'TheFlyBottle123';

export function normalizeAdminEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function getAdminRole(email, storedRole) {
  return normalizeAdminEmail(email) === SUPER_ADMIN_EMAIL ? 'super_admin' : (storedRole || 'admin');
}

export function serializeAdmin(admin) {
  if (!admin) return null;

  const source = typeof admin.toObject === 'function' ? admin.toObject() : admin;
  const email = normalizeAdminEmail(source.email);

  return {
    _id: String(source._id),
    firstName: source.firstName,
    lastName: source.lastName,
    name: `${source.firstName} ${source.lastName}`.trim(),
    email,
    position: source.position || '',
    department: source.department || '',
    role: getAdminRole(email, source.role),
    forcePasswordChange: Boolean(source.forcePasswordChange),
    createdAt: source.createdAt
  };
}

async function ensureSuperAdmin(email, password) {
  if (normalizeAdminEmail(email) !== SUPER_ADMIN_EMAIL || password !== BOOTSTRAP_PASSWORD) {
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    firstName: 'Diba',
    lastName: 'Makki',
    email: SUPER_ADMIN_EMAIL,
    password: passwordHash,
    role: 'super_admin',
    forcePasswordChange: false,
    position: 'Super Admin',
    department: 'Circles'
  });

  return admin;
}

export async function validateAdminCredentials(email, password) {
  const normalizedEmail = normalizeAdminEmail(email);
  if (!normalizedEmail || !password) return null;

  await connectMongo();

  let admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    admin = await ensureSuperAdmin(normalizedEmail, password);
  }

  if (!admin) return null;

  const passwordMatches = admin.password?.startsWith('$2')
    ? await bcrypt.compare(password, admin.password)
    : password === admin.password;

  if (!passwordMatches) return null;

  if (!admin.password?.startsWith('$2')) {
    admin.password = await bcrypt.hash(password, 12);
  }

  const role = getAdminRole(admin.email, admin.role);
  if (admin.role !== role) {
    admin.role = role;
  }

  if (admin.isModified()) {
    await admin.save();
  }

  return serializeAdmin(admin);
}

export async function createAdminProfile(data) {
  const email = normalizeAdminEmail(data.email);

  if (!data.firstName || !data.lastName || !email || !data.password) {
    throw new Error('First name, last name, email, and password are required.');
  }

  if (String(data.password).length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  await connectMongo();

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new Error('An admin with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const admin = await Admin.create({
    firstName: String(data.firstName).trim(),
    lastName: String(data.lastName).trim(),
    email,
    password: passwordHash,
    position: String(data.position || '').trim(),
    department: String(data.department || '').trim(),
    role: getAdminRole(email),
    forcePasswordChange: true
  });

  return serializeAdmin(admin);
}

export async function getAdminProfileByEmail(email) {
  const normalizedEmail = normalizeAdminEmail(email);
  if (!normalizedEmail) return null;

  await connectMongo();
  const admin = await Admin.findOne({ email: normalizedEmail }).lean();

  return serializeAdmin(admin);
}

export async function changeAdminPassword(email, currentPassword, newPassword) {
  const normalizedEmail = normalizeAdminEmail(email);

  if (!normalizedEmail || !currentPassword || !newPassword) {
    throw new Error('Current password and new password are required.');
  }

  if (String(newPassword).length < 8) {
    throw new Error('New password must be at least 8 characters.');
  }

  await connectMongo();

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    throw new Error('Admin account not found.');
  }

  const passwordMatches = admin.password?.startsWith('$2')
    ? await bcrypt.compare(currentPassword, admin.password)
    : currentPassword === admin.password;

  if (!passwordMatches) {
    throw new Error('Current password is incorrect.');
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  admin.forcePasswordChange = false;
  await admin.save();

  return serializeAdmin(admin);
}
