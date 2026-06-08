import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import Circle from '@/models/Circle';
import Registration from '@/models/Registration';
import Submission from '@/models/Submission';
import { createXlsxWorkbook } from '@/lib/xlsx';

function formatDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function valueForCell(value) {
  if (value == null) return '';
  if (value instanceof Date) return formatDate(value);
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function detailRows(title, data, fields) {
  return [
    [title, ''],
    ['Field', 'Value'],
    ...fields.map(([key, label]) => [label, valueForCell(data?.[key])])
  ];
}

function sanitizeFilenamePart(value) {
  return String(value || 'circle')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60) || 'circle';
}

function registrationRows(registrations) {
  const headers = [
    'Registration ID',
    'Organizer Name',
    'Email',
    'Telegram ID',
    'Phone Number',
    'Country',
    'Workplace/Education',
    'Education Level',
    'Previous Organizer',
    'Registered Circle Name EN',
    'Registered Circle Name FA',
    'Description',
    'Expected Registration Date',
    'Expected Session Start Date',
    'Expected Duration',
    'Status',
    'Agreed To Terms',
    'Setup Email Sent At',
    'Setup Submitted At',
    'Promote On Social',
    'Show Host Name',
    'Social Link',
    'Capacity Note',
    'Conversation Languages',
    'Prerequisites',
    'Public Introduction',
    'Circle Focus',
    'Session Activities',
    'Schedule Plan',
    'Needed Support',
    'Subjects',
    'Promo Asset URL',
    'Shared File Name',
    'Shared File URL',
    'Shared File Size',
    'Shared File Type',
    'Created At',
    'Updated At'
  ];

  return [
    headers,
    ...registrations.map((registration) => {
      const details = registration.setupDetails || {};
      const shareFile = details.shareFile || {};

      return [
        registration._id?.toString(),
        registration.fullName,
        registration.email,
        registration.telegramId,
        registration.phoneNumber,
        registration.country,
        registration.workplaceOrEducation,
        registration.educationLevel,
        registration.previousOrganizer,
        registration.circleNameEn,
        registration.circleNameFa,
        registration.description,
        registration.expectedRegistrationDate,
        registration.expectedSessionStartDate,
        registration.expectedDuration,
        registration.status,
        registration.agreedToTerms,
        formatDate(registration.setupEmailSentAt),
        formatDate(registration.setupSubmittedAt),
        details.promoteOnSocial,
        details.showHostName,
        details.socialLink,
        details.capacityNote,
        details.conversationLanguages,
        details.prerequisites,
        details.publicIntroduction,
        details.circleFocus,
        details.sessionActivities,
        details.schedulePlan,
        details.neededSupport,
        details.subjects,
        details.promoAssetUrl,
        shareFile.name,
        shareFile.url,
        shareFile.size,
        shareFile.type,
        formatDate(registration.createdAt),
        formatDate(registration.updatedAt)
      ].map(valueForCell);
    })
  ];
}

function submissionRows(submissions) {
  const headers = [
    'Submission ID',
    'Full Name',
    'Email',
    'Country',
    'Education Level',
    'Field Of Study',
    'Interested Subjects',
    'Agreed To Code Of Conduct',
    'Telegram Invite Sent',
    'Created At',
    'Updated At'
  ];

  return [
    headers,
    ...submissions.map((submission) => [
      submission._id?.toString(),
      submission.fullName,
      submission.email,
      submission.country,
      submission.educationLevel,
      submission.fieldOfStudy,
      submission.interestedSubjects,
      submission.agreedToCodeOfConduct,
      submission.notified,
      formatDate(submission.createdAt),
      formatDate(submission.updatedAt)
    ].map(valueForCell))
  ];
}

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Circle not found' }, { status: 404 });
    }

    await connectMongo();

    const circle = await Circle.findById(id).lean();
    if (!circle) return Response.json({ error: 'Circle not found' }, { status: 404 });

    const [submissions, registrations] = await Promise.all([
      Submission.find({ circleId: id }).sort({ createdAt: -1 }).lean(),
      Registration.find({ circleId: id }).sort({ createdAt: -1 }).lean()
    ]);

    const workbook = createXlsxWorkbook([
      {
        name: 'Circle',
        rows: detailRows('Circle Details', circle, [
          ['_id', 'Circle ID'],
          ['name', 'Name'],
          ['titleEn', 'Title EN'],
          ['titleFa', 'Title FA'],
          ['slug', 'Slug'],
          ['status', 'Status'],
          ['capacity', 'Capacity'],
          ['telegramLink', 'Telegram Link'],
          ['createdAt', 'Created At'],
          ['updatedAt', 'Updated At']
        ])
      },
      { name: 'Registered Members', rows: submissionRows(submissions) },
      { name: 'Proposal Setup', rows: registrationRows(registrations) }
    ]);

    const filename = `${sanitizeFilenamePart(circle.slug || circle.name)}-export.xlsx`;

    return new Response(workbook, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(workbook.length),
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Export Circle Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
