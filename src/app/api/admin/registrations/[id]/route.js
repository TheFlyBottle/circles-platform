import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Circle from '@/models/Circle';
import { serializeDoc } from '@/lib/serialize';
import { recordAdminAction } from '@/lib/audit-log';

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectMongo();
    
    const registration = await Registration.findById(id).lean();
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

    return NextResponse.json({ success: true, registration: serializeDoc(registration) });
  } catch (error) {
    console.error('Fetch Registration Error:', error);
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
    
    const registration = await Registration.findById(id);
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    const previousStatus = registration.status;

    if (registration.status === 'approved' && status === 'approved') {
       return NextResponse.json({ error: 'Registration is already approved.' }, { status: 400 });
    }

    registration.status = status;
    await registration.save();

    if (status === 'approved') {
      const baseSlug = registration.circleNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let finalSlug = baseSlug;
      let counter = 1;
      
      while (await Circle.exists({ slug: finalSlug })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const circle = await Circle.create({
        name: registration.circleNameEn,
        slug: finalSlug,
        status: 'active',
        capacity: 0,
        telegramLink: ''
      });
      await recordAdminAction(session, {
        action: 'circle.create_from_registration',
        resourceType: 'circle',
        resourceId: circle._id,
        resourceLabel: circle.name,
        details: {
          registrationId: String(registration._id),
          slug: circle.slug
        }
      });
    }
    await recordAdminAction(session, {
      action: 'registration.status_update',
      resourceType: 'registration',
      resourceId: registration._id,
      resourceLabel: registration.circleNameEn,
      details: {
        previousStatus,
        status,
        applicant: registration.email
      }
    });

    return NextResponse.json({ success: true, registration: serializeDoc(registration.toObject()) });
  } catch (error) {
    console.error('Update Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
