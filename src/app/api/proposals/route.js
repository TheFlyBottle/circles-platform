import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Proposal from '@/models/Proposal';

export async function POST(req) {
  try {
    const data = await req.json();

    if (
      !data.fullName || 
      !data.email || 
      !data.telegramId || 
      !data.circleNameFa || 
      !data.circleNameEn || 
      !data.description || 
      data.agreedToTerms !== true || 
      typeof data.previousOrganizer !== 'boolean'
    ) {
      return NextResponse.json({ error: 'Missing required fields or terms not agreed to.' }, { status: 400 });
    }

    await connectMongo();

    const proposal = await Proposal.create(data);

    return NextResponse.json({ success: true, proposalId: proposal._id });
  } catch (error) {
    console.error('Create Proposal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
