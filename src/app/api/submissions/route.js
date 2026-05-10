import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Registration from '@/models/Registration';
import Submission from '@/models/Submission';
import { sendConfirmationEmail, sendTelegramInviteEmail } from '@/lib/email';

async function getApplicantCircleName(circle) {
  if (circle.titleFa || circle.titleEn) {
    return circle.titleFa || circle.titleEn;
  }

  const registration = await Registration.findOne({ circleId: circle._id })
    .select('circleNameFa circleNameEn')
    .lean();

  return registration?.circleNameFa || registration?.circleNameEn || circle.name;
}

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.interestedSubjects || data.interestedSubjects.length === 0) {
      return NextResponse.json({ error: 'Please select at least one interested subject.' }, { status: 400 });
    }
    if (!data.agreedToCodeOfConduct) {
        return NextResponse.json({ error: 'You must agree to the code of conduct.' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(data.circleId)) {
      return NextResponse.json({ error: 'Circle does not exist.' }, { status: 400 });
    }

    await connectMongo();

    const circle = await Circle.findById(data.circleId);
    
    if (!circle) return NextResponse.json({ error: 'Circle does not exist.' }, { status: 400 });
    if (circle.status === 'archived') {
      return NextResponse.json({ error: 'Circle does not exist.' }, { status: 400 });
    }

    if (circle.capacity > 0) {
        const count = await Submission.countDocuments({ circleId: circle._id });
        if (count >= circle.capacity) {
            return NextResponse.json({ error: 'Registration capacity has been reached.' }, { status: 400 });
        }
    }

    const submission = new Submission({
      ...data,
      notified: false,
    });

    const circleName = await getApplicantCircleName(circle);

    await submission.save();

    const confirmationSent = await sendConfirmationEmail(data.email, data.fullName, circleName);
    if (!confirmationSent) {
      console.warn('Circle signup was saved, but the confirmation email was not sent.', {
        submissionId: submission._id,
        email: data.email,
        circleName
      });
    }

    // If a telegram link already exists, send it after the confirmation email.
    if (circle.telegramLink) {
        await sendTelegramInviteEmail(data.email, data.fullName, circleName, circle.telegramLink);
        submission.notified = true;
        await submission.save();
    }
    
    // Auto-close circle if capacity is reached
    if (circle.capacity > 0) {
        const newCount = await Submission.countDocuments({ circleId: circle._id });
        if (newCount >= circle.capacity) {
            circle.status = 'closed';
            await circle.save();
        }
    }

    return NextResponse.json({ success: true, message: 'Registration received successfully.' });

  } catch (error) {
    console.error('Create Submission Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
