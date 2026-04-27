import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import { serializeDoc, serializeDocs } from '@/lib/serialize';

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectMongo();
    const circles = await Circle.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, circles: serializeDocs(circles) });
  } catch (error) {
    console.error('Fetch Circles Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { name, slug, status, capacity } = data;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }

    await connectMongo();
    const existingCircle = await Circle.findOne({ slug });
    if (existingCircle) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
    }

    const newCircle = await Circle.create({
      name,
      slug,
      status: status || 'draft',
      capacity: capacity ? parseInt(capacity) : 0,
      telegramLink: ''
    });

    return NextResponse.json({ success: true, circle: serializeDoc(newCircle) });
  } catch (error) {
    console.error('Create Circle Error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
