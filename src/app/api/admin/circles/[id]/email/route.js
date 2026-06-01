import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { sendCustomEmail } from '@/lib/email';
import { recordAdminAction } from '@/lib/audit-log';

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    await connectMongo();
    
    const circle = await Circle.findById(id);
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

    const submissions = await Submission.find({ circleId: id });
    const emails = submissions.map(sub => sub.email).filter(email => email);

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No members found to email.' }, { status: 400 });
    }

    const result = await sendCustomEmail(emails, subject, message, circle.name);

    if (result.failed > 0 && result.failed === result.attempted) {
      return NextResponse.json({ error: 'Failed to send emails. Check your Resend API configuration.' }, { status: 500 });
    }

    await recordAdminAction(session, {
      action: 'circle.email_members',
      resourceType: 'circle',
      resourceId: circle._id,
      resourceLabel: circle.name,
      details: {
        subject,
        recipientCount: result.attempted,
        sent: result.sent,
        failed: result.failed,
        failedEmails: result.failedEmails
      }
    });

    return NextResponse.json({
      success: result.failed === 0,
      count: result.sent,
      attempted: result.attempted,
      failed: result.failed,
      failedEmails: result.failedEmails
    });
  } catch (error) {
    console.error('Send Custom Email Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
