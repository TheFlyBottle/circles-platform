import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import { serializeDocs } from '@/lib/serialize';

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectMongo();
    const proposals = await Proposal.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, proposals: serializeDocs(proposals) });
  } catch (error) {
    console.error('Fetch Proposals Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
