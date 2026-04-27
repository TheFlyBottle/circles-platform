import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Admin registration is disabled. Use one of the allowed admin accounts.' },
    { status: 403 }
  );
}
