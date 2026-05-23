import Registration from '@/models/Registration';
import { sendTelegramInviteEmail } from '@/lib/email';

export async function getApplicantCircleName(circle) {
  if (circle.titleFa || circle.titleEn) {
    return circle.titleFa || circle.titleEn;
  }

  const registration = await Registration.findOne({ circleId: circle._id })
    .select('circleNameFa circleNameEn')
    .lean();

  return registration?.circleNameFa || registration?.circleNameEn || circle.name;
}

export async function sendTelegramInvitesToSubmissions(submissions, circle, telegramLink) {
  const circleName = await getApplicantCircleName(circle);
  const failedEmails = [];
  const sentEmails = [];

  for (const submission of submissions) {
    const sent = await sendTelegramInviteEmail(
      submission.email,
      submission.fullName,
      circleName,
      telegramLink
    );

    if (sent) {
      submission.notified = true;
      await submission.save();
      sentEmails.push(submission.email);
    } else {
      failedEmails.push(submission.email);
    }
  }

  return {
    attempted: submissions.length,
    sent: sentEmails.length,
    failed: failedEmails.length,
    sentEmails,
    failedEmails
  };
}
