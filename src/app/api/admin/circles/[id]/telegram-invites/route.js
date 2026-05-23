import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { recordAdminAction } from '@/lib/audit-log';
import { sendTelegramInvitesToSubmissions } from '@/lib/telegram-invites';

const RESEND_MODES = ['pending', 'all', 'selected'];

export async function POST(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    const body = await req.json();
    const mode = RESEND_MODES.includes(body.mode) ? body.mode : 'pending';
    const submissionIds = Array.isArray(body.submissionIds) ? body.submissionIds : [];

    if (mode === 'selected' && submissionIds.length === 0) {
      return NextResponse.json({ error: 'Select at least one member to resend.' }, { status: 400 });
    }

    const invalidSubmissionId = submissionIds.find((submissionId) => !mongoose.Types.ObjectId.isValid(submissionId));
    if (invalidSubmissionId) {
      return NextResponse.json({ error: 'Invalid member selected.' }, { status: 400 });
    }

    await connectMongo();

    const circle = await Circle.findById(id);
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    if (!circle.telegramLink) {
      return NextResponse.json({ error: 'Add a Telegram link before sending invites.' }, { status: 400 });
    }

    const query = { circleId: id };
    if (mode === 'pending') {
      query.notified = false;
    } else if (mode === 'selected') {
      query._id = { $in: submissionIds };
    }

    const submissions = await Submission.find(query).sort({ createdAt: 1 });
    if (submissions.length === 0) {
      return NextResponse.json({ error: 'No matching members found to resend.' }, { status: 400 });
    }

    const result = await sendTelegramInvitesToSubmissions(submissions, circle, circle.telegramLink);

    await recordAdminAction(session, {
      action: 'circle.telegram_invites_resend',
      resourceType: 'circle',
      resourceId: circle._id,
      resourceLabel: circle.name,
      details: {
        mode,
        requestedSubmissionCount: mode === 'selected' ? submissionIds.length : undefined,
        attempted: result.attempted,
        sent: result.sent,
        failed: result.failed,
        failedEmails: result.failedEmails
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Resend Telegram Invites Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
