import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { sendNewCircleRegistrationNotification } from '@/lib/email';

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

    const registration = await Registration.create(data);
    const notificationSent = await sendNewCircleRegistrationNotification(registration);

    if (!notificationSent) {
      console.warn('New circle registration was created, but the admin notification email was not sent.', {
        registrationId: registration._id
      });
    }

    return NextResponse.json({ success: true, registrationId: registration._id });
  } catch (error) {
    console.error('Create Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
