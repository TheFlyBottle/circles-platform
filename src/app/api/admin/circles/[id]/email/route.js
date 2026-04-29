import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { sendCustomEmail } from '@/lib/email';

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

    const chunkSize = 50;
    let failedChunks = 0;

    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      const success = await sendCustomEmail(chunk, subject, message, circle.name);
      if (!success) {
         failedChunks++;
         console.warn(`Failed to send email chunk starting at index ${i}`);
      }
    }

    if (failedChunks > 0 && failedChunks === Math.ceil(emails.length / chunkSize)) {
        return NextResponse.json({ error: 'Failed to send emails. Check your Resend API configuration.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error) {
    console.error('Send Custom Email Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
