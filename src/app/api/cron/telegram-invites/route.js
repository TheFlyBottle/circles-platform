import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { sendTelegramInviteEmail } from '@/lib/email';

// This endpoint conventionally would be hit by a cron service (like Vercel Cron or GitHub Actions)
// A secure authentication mechanism (e.g. CRON_SECRET) should be checked in production to prevent abuse.
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    // If you add CRON_SECRET to .env.local, you can secure this endpoint
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    // Find all circles that are active or closed currently having a valid Telegram Link
    const circlesWithTelegram = await Circle.find({
      telegramLink: { $exists: true, $ne: '' }
    }).lean();

    let totalSent = 0;

    for (const circle of circlesWithTelegram) {
      if (circle.telegramLink && circle.telegramLink.length > 5) {
        // Find unnotified submissions for this circle
        const pendingSubmissions = await Submission.find({
          circleId: circle._id,
          notified: false
        });

        for (const sub of pendingSubmissions) {
          const sent = await sendTelegramInviteEmail(
            sub.email, 
            sub.fullName, 
            circle.titleFa || circle.titleEn || circle.name,
            circle.telegramLink
          );
          
          if (sent) {
            sub.notified = true;
            await sub.save();
            totalSent++;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cron executed successfully. Sent ${totalSent} new Telegram invitations.` 
    });

  } catch (error) {
    console.error('Cron Execution Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
