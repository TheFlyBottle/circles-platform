import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { serializeDoc } from '@/lib/serialize';

export async function GET() {
  try {
    await connectMongo();
    
    const circles = await Circle.find({})
      .sort({ createdAt: -1 })
      .lean();

    const circlesWithCounts = await Promise.all(
      circles.map(async (circle) => {
        const count = await Submission.countDocuments({ circleId: circle._id });
        return {
          ...serializeDoc(circle),
          currentRegistrations: count
        };
      })
    );

    return NextResponse.json({ success: true, circles: circlesWithCounts });
  } catch (error) {
    console.error('Fetch Public Circles Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
