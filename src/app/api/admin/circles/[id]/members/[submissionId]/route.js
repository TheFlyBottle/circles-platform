import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { recordAdminAction } from '@/lib/audit-log';

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, submissionId } = await params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    await connectMongo();

    const circle = await Circle.findById(id).lean();
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

    const submission = await Submission.findOneAndDelete({ _id: submissionId, circleId: id }).lean();
    if (!submission) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    await recordAdminAction(session, {
      action: 'circle.member_delete',
      resourceType: 'submission',
      resourceId: submission._id,
      resourceLabel: submission.fullName || submission.email,
      details: {
        circleId: String(circle._id),
        circleName: circle.name,
        email: submission.email,
        notified: Boolean(submission.notified)
      }
    });

    return NextResponse.json({ success: true, message: 'Member removed successfully.' });
  } catch (error) {
    console.error('Delete Circle Member Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
