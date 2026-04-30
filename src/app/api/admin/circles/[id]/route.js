import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Submission from '@/models/Submission';
import { serializeDoc, serializeDocs } from '@/lib/serialize';
import { sendTelegramInviteEmail } from '@/lib/email';
import { recordAdminAction } from '@/lib/audit-log';

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    await connectMongo();
    
    const circle = await Circle.findById(id).lean();
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

    const submissions = await Submission.find({ circleId: id }).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, circle: serializeDoc(circle), submissions: serializeDocs(submissions) });
  } catch (error) {
    console.error('Fetch Admin Circle Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await req.json();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    await connectMongo();

    const circle = await Circle.findById(id);
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

    const before = {
      name: circle.name,
      slug: circle.slug,
      status: circle.status,
      capacity: circle.capacity,
      hasTelegramLink: Boolean(circle.telegramLink)
    };
    const hadTelegramLink = Boolean(circle.telegramLink);
    const allowedUpdates = ['name', 'slug', 'status', 'capacity', 'telegramLink'];
    for (const field of allowedUpdates) {
      if (field in data) {
        circle[field] = field === 'capacity' ? Math.max(parseInt(data[field], 10) || 0, 0) : data[field];
      }
    }
    
    // Auto-mark notifications and send emails if Telegram link is added for the first time
    if (data.telegramLink && !hadTelegramLink) {
      const pendingSubmissions = await Submission.find({ circleId: id, notified: false });
      const emailResults = await Promise.allSettled(
        pendingSubmissions.map((sub) =>
          sendTelegramInviteEmail(
            sub.email,
            sub.fullName,
            circle.titleEn || circle.name,
            data.telegramLink
          )
        )
      );

      await Promise.all(
        pendingSubmissions.map((sub, index) => {
          if (emailResults[index].status === 'fulfilled' && emailResults[index].value) {
            sub.notified = true;
            return sub.save();
          }
          return Promise.resolve();
        })
      );
    }
    
    await circle.save();
    await recordAdminAction(session, {
      action: 'circle.update',
      resourceType: 'circle',
      resourceId: circle._id,
      resourceLabel: circle.name,
      details: {
        before,
        after: {
          name: circle.name,
          slug: circle.slug,
          status: circle.status,
          capacity: circle.capacity,
          hasTelegramLink: Boolean(circle.telegramLink)
        },
        updatedFields: allowedUpdates.filter((field) => field in data)
      }
    });

    return NextResponse.json({ 
      success: true, 
      circle: serializeDoc(circle), 
      message: 'Updated successfully.' 
    });

  } catch (error) {
    console.error('Update Circle Error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Circle not found' }, { status: 404 });
    }

    await connectMongo();
    const circle = await Circle.findByIdAndDelete(id);
    if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 });

    const deletionResult = await Submission.deleteMany({ circleId: id });
    await recordAdminAction(session, {
      action: 'circle.delete',
      resourceType: 'circle',
      resourceId: id,
      resourceLabel: circle.name,
      details: {
        slug: circle.slug,
        deletedSubmissions: deletionResult.deletedCount || 0
      }
    });

    return NextResponse.json({ success: true, message: 'Circle deleted successfully.' });
  } catch (error) {
    console.error('Delete Circle Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
