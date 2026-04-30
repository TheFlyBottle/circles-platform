import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { serializeDocs } from '@/lib/serialize';

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectMongo();
    const registrations = await Registration.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, registrations: serializeDocs(registrations) });
  } catch (error) {
    console.error('Fetch Registrations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
