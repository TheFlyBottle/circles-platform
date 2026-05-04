import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Circle from '@/models/Circle';
import { serializeDoc } from '@/lib/serialize';
import { recordAdminAction } from '@/lib/audit-log';
import { sendCircleCreatedFromSetupEmail } from '@/lib/email';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function createSlug(value) {
  return String(value || 'circle')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'circle';
}

async function createUniqueSlug(name) {
  const baseSlug = createSlug(name);
  let finalSlug = baseSlug;
  let counter = 1;

  while (await Circle.exists({ slug: finalSlug })) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

function getText(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

async function readUpload(formData, name) {
  const file = formData.get(name);
  if (!file || typeof file === 'string' || file.size === 0) return null;

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} is larger than 5MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    data: buffer.toString('base64')
  };
}

async function getApprovedRegistration(id, token) {
  if (!mongoose.Types.ObjectId.isValid(id) || !token) return null;

  await connectMongo();
  return Registration.findOne({ _id: id, setupToken: token, status: 'approved' });
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = new URL(req.url).searchParams.get('token');
    const registration = await getApprovedRegistration(id, token);

    if (!registration) {
      return NextResponse.json({ error: 'Setup form not found or expired.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      registration: serializeDoc({
        _id: registration._id,
        fullName: registration.fullName,
        email: registration.email,
        circleNameEn: registration.circleNameEn,
        circleNameFa: registration.circleNameFa,
        setupSubmittedAt: registration.setupSubmittedAt,
        circleId: registration.circleId
      })
    });
  } catch (error) {
    console.error('Fetch Registration Setup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const token = getText(formData, 'token');
    const registration = await getApprovedRegistration(id, token);

    if (!registration) {
      return NextResponse.json({ error: 'Setup form not found or expired.' }, { status: 404 });
    }

    if (registration.setupSubmittedAt || registration.circleId) {
      return NextResponse.json({ error: 'This setup form has already been submitted.' }, { status: 400 });
    }

    const capacity = Math.max(parseInt(getText(formData, 'capacity'), 10) || 0, 0);
    const setupDetails = {
      promoteOnSocial: getText(formData, 'promoteOnSocial'),
      showHostName: getText(formData, 'showHostName'),
      socialLink: getText(formData, 'socialLink'),
      capacityNote: getText(formData, 'capacityNote'),
      capacity,
      conversationLanguages: getText(formData, 'conversationLanguages'),
      prerequisites: getText(formData, 'prerequisites'),
      publicIntroduction: getText(formData, 'publicIntroduction'),
      circleFocus: getText(formData, 'circleFocus'),
      sessionActivities: getText(formData, 'sessionActivities'),
      schedulePlan: getText(formData, 'schedulePlan'),
      neededSupport: getText(formData, 'neededSupport'),
      subjects: getText(formData, 'subjects'),
      promoAsset: await readUpload(formData, 'promoAsset'),
      shareFile: await readUpload(formData, 'shareFile')
    };

    const slug = await createUniqueSlug(registration.circleNameEn || registration.circleNameFa);
    const circle = await Circle.create({
      name: registration.circleNameEn,
      slug,
      status: 'active',
      capacity,
      telegramLink: ''
    });

    registration.setupDetails = setupDetails;
    registration.setupSubmittedAt = new Date();
    registration.circleId = circle._id;
    registration.setupToken = undefined;
    await registration.save();

    const circleUrl = new URL(`/circles/${circle.slug}`, new URL(req.url).origin).toString();
    const notificationSent = await sendCircleCreatedFromSetupEmail(registration, circle, circleUrl);

    if (!notificationSent) {
      console.warn('Circle was created, but the setup completion email was not sent.', {
        registrationId: registration._id,
        circleId: circle._id
      });
    }

    await recordAdminAction({ email: 'system@theflybottle.org', name: 'System' }, {
      action: 'circle.create_from_registration',
      resourceType: 'circle',
      resourceId: circle._id,
      resourceLabel: circle.name,
      details: {
        registrationId: String(registration._id),
        slug: circle.slug,
        capacity: circle.capacity,
        notificationSent,
        setupSubmitted: true
      }
    });

    return NextResponse.json({ success: true, circle: serializeDoc(circle) });
  } catch (error) {
    console.error('Submit Registration Setup Error:', error);
    const message = error.message || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: message.includes('larger than') ? 400 : 500 });
  }
}
