import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import Circle from '@/models/Circle';
import { serializeDoc } from '@/lib/serialize';

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectMongo();
    
    const proposal = await Proposal.findById(id).lean();
    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });

    return NextResponse.json({ success: true, proposal: serializeDoc(proposal) });
  } catch (error) {
    console.error('Fetch Proposal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();
    
    if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectMongo();
    
    const proposal = await Proposal.findById(id);
    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });

    if (proposal.status === 'approved' && status === 'approved') {
       return NextResponse.json({ error: 'Proposal is already approved.' }, { status: 400 });
    }

    proposal.status = status;
    await proposal.save();

    if (status === 'approved') {
      const baseSlug = proposal.circleNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let finalSlug = baseSlug;
      let counter = 1;
      
      while (await Circle.exists({ slug: finalSlug })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      await Circle.create({
        name: proposal.circleNameEn,
        slug: finalSlug,
        status: 'active',
        capacity: 0,
        telegramLink: ''
      });
    }

    return NextResponse.json({ success: true, proposal: serializeDoc(proposal.toObject()) });
  } catch (error) {
    console.error('Update Proposal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
