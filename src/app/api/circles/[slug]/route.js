import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { serializeDoc } from '@/lib/serialize';

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    await connectMongo();
    
    const circle = await Circle.findOne({ slug }).lean();

    if (!circle || circle.status === 'draft') {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    const currentRegistrations = await Submission.countDocuments({ circleId: circle._id });
    
    return NextResponse.json({ success: true, circle: { ...serializeDoc(circle), currentRegistrations } });
  } catch (error) {
    console.error('Fetch Circle Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
