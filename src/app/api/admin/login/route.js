import { AuthError } from 'next-auth';
import { NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { getAdminProfileByEmail } from '@/lib/admin-auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const redirectUrl = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    const resultUrl = new URL(redirectUrl, req.url);
    if (resultUrl.searchParams.has('error')) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const admin = await getAdminProfileByEmail(email);

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      forcePasswordChange: Boolean(admin?.forcePasswordChange)
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
