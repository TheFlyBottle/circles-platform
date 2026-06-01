import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import { serializeDoc, serializeDocs } from '@/lib/serialize';
import { recordAdminAction } from '@/lib/audit-log';

const CIRCLE_STATUSES = ['active', 'closed', 'archived'];

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
    const { name, titleFa, slug, status, capacity } = data;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedSlug = typeof slug === 'string' ? slug.trim() : '';
    const trimmedTitleFa = typeof titleFa === 'string' ? titleFa.trim() : '';

    if (!trimmedName || !trimmedSlug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }

    if (status && !CIRCLE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid circle status.' }, { status: 400 });
    }

    await connectMongo();
    const existingCircle = await Circle.findOne({ slug: trimmedSlug });
    if (existingCircle) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
    }

    const newCircle = await Circle.create({
      name: trimmedName,
      titleFa: trimmedTitleFa,
      slug: trimmedSlug,
      status: status || 'active',
      capacity: capacity ? parseInt(capacity) : 0,
      telegramLink: ''
    });
    await recordAdminAction(session, {
      action: 'circle.create',
      resourceType: 'circle',
      resourceId: newCircle._id,
      resourceLabel: newCircle.name,
      details: {
        slug: newCircle.slug,
        titleFa: newCircle.titleFa,
        status: newCircle.status,
        capacity: newCircle.capacity
      }
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
