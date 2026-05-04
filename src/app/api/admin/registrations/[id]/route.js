import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { serializeDoc } from '@/lib/serialize';
import { recordAdminAction } from '@/lib/audit-log';
import { sendCircleSetupFormEmail } from '@/lib/email';

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
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

    let setupFormEmailSent = false;

    if (status === 'approved') {
      if (!registration.setupSubmittedAt) {
        registration.setupToken = crypto.randomBytes(32).toString('hex');
        registration.setupEmailSentAt = new Date();
        await registration.save();

        const setupUrl = new URL(`/registration/setup/${registration._id}`, new URL(req.url).origin);
        setupUrl.searchParams.set('token', registration.setupToken);
        setupFormEmailSent = await sendCircleSetupFormEmail(
          registration.email,
          registration.fullName,
          registration.circleNameEn || registration.circleNameFa,
          setupUrl.toString()
        );

        if (!setupFormEmailSent) {
          return NextResponse.json({ error: 'Registration approved, but the setup form email could not be sent.' }, { status: 500 });
        }
      } else {
        await registration.save();
      }
    } else {
      await registration.save();
    }

    await recordAdminAction(session, {
      action: 'registration.status_update',
      resourceType: 'registration',
      resourceId: registration._id,
      resourceLabel: registration.circleNameEn,
      details: {
        previousStatus,
        status,
        applicant: registration.email,
        setupFormEmailSent
      }
    });

    return NextResponse.json({ success: true, registration: serializeDoc(registration.toObject()) });
  } catch (error) {
    console.error('Update Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    await connectMongo();

    const registration = await Registration.findByIdAndDelete(id).lean();
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

    await recordAdminAction(session, {
      action: 'registration.delete',
      resourceType: 'registration',
      resourceId: registration._id,
      resourceLabel: registration.circleNameEn,
      details: {
        applicant: registration.email,
        status: registration.status,
        circleNameFa: registration.circleNameFa
      }
    });

    return NextResponse.json({ success: true, message: 'Registration deleted successfully.' });
  } catch (error) {
    console.error('Delete Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
