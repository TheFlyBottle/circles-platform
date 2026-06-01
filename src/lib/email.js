import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_test123');

const SENDER_EMAIL = 'The Fly Bottle <noreply@theflybottle.org>';
const NEW_CIRCLE_NOTIFICATION_EMAILS = ['diba.makki@theflybottle.org', 'circleadmins@theflybottle.org'];
const SUPER_ADMIN_EMAILS = ['diba.makki@theflybottle.org', 'm.ebrahimpour@theflybottle.org'];
const FULL_SETUP_NOTIFICATION_EMAILS = ['production@theflybottle.org', 'diba.mak@gmail.com'];
const RESEND_BATCH_SIZE = 100;
const RESEND_REQUEST_INTERVAL_MS = 250;
const RESEND_MAX_ATTEMPTS = 4;

let resendRequestQueue = Promise.resolve();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForResendSlot() {
  const previousRequest = resendRequestQueue;
  let releaseSlot;
  resendRequestQueue = new Promise((resolve) => {
    releaseSlot = resolve;
  });

  await previousRequest;
  await sleep(RESEND_REQUEST_INTERVAL_MS);
  releaseSlot();
}

function getErrorStatus(error) {
  return error?.statusCode || error?.status || error?.response?.status;
}

function getRetryDelay(error, attempt) {
  const retryAfter = error?.headers?.get?.('retry-after') || error?.response?.headers?.get?.('retry-after');
  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return Math.min(1000 * 2 ** attempt, 8000);
}

function isRetryableResendError(error) {
  const status = getErrorStatus(error);
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;

  const message = String(error?.message || error?.name || '').toLowerCase();
  return message.includes('rate limit') || message.includes('too many requests');
}

async function sendResendRequest(context, sendRequest) {
  for (let attempt = 0; attempt < RESEND_MAX_ATTEMPTS; attempt++) {
    await waitForResendSlot();

    try {
      const result = await sendRequest();
      if (!result?.error) return result;

      if (!isRetryableResendError(result.error) || attempt === RESEND_MAX_ATTEMPTS - 1) {
        console.error(`${context} error:`, result.error);
        return result;
      }

      console.warn(`${context} rate limited. Retrying attempt ${attempt + 2}/${RESEND_MAX_ATTEMPTS}.`);
      await sleep(getRetryDelay(result.error, attempt));
    } catch (error) {
      if (!isRetryableResendError(error) || attempt === RESEND_MAX_ATTEMPTS - 1) {
        throw error;
      }

      console.warn(`${context} request failed temporarily. Retrying attempt ${attempt + 2}/${RESEND_MAX_ATTEMPTS}.`, error);
      await sleep(getRetryDelay(error, attempt));
    }
  }

  return { error: new Error(`${context} failed after ${RESEND_MAX_ATTEMPTS} attempts.`) };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRegistrationField(label, value) {
  const displayValue = value || 'Not provided';

  return `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #5a5a5a; width: 35%; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #2d2d2d; vertical-align: top;">${escapeHtml(displayValue)}</td>
    </tr>
  `;
}

function formatLinkField(label, url, linkText = 'Open link') {
  if (!url) return formatRegistrationField(label, 'Not provided');

  return `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #5a5a5a; width: 35%; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #2d2d2d; vertical-align: top;">
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color: #4a5d4e;">${escapeHtml(linkText)}</a>
        <div style="margin-top: 6px; color: #5a5a5a; word-break: break-all;">${escapeHtml(url)}</div>
      </td>
    </tr>
  `;
}

function formatTextBlock(title, value) {
  return `
    <div style="margin-top: 18px;">
      <h4 style="color: #4a5d4e; margin: 0 0 8px; font-size: 15px;">${escapeHtml(title)}</h4>
      <div style="white-space: pre-wrap; background-color: #fdfbf7; border: 1px solid #e5e0d8; border-radius: 8px; padding: 14px;">${escapeHtml(value || 'Not provided')}</div>
    </div>
  `;
}

function getFilenameFromUrl(url, fallback) {
  try {
    const pathname = new URL(url).pathname;
    const filename = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '');
    return filename || fallback;
  } catch {
    return fallback;
  }
}

function buildSetupAttachments(setupDetails) {
  const attachments = [];

  if (setupDetails?.promoAssetUrl) {
    attachments.push({
      path: setupDetails.promoAssetUrl,
      filename: getFilenameFromUrl(setupDetails.promoAssetUrl, 'promotion-image')
    });
  }

  const shareFile = setupDetails?.shareFile;
  if (shareFile?.url) {
    attachments.push({
      path: shareFile.url,
      filename: shareFile.name || getFilenameFromUrl(shareFile.url, 'shared-file'),
      contentType: shareFile.type || undefined
    });
  } else if (shareFile?.data) {
    attachments.push({
      content: shareFile.data,
      filename: shareFile.name || 'shared-file',
      contentType: shareFile.type || undefined
    });
  }

  return attachments;
}

function formatAuditLogRow(log) {
  const details = log.details && Object.keys(log.details).length > 0
    ? JSON.stringify(log.details)
    : 'Recorded';

  return `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; white-space: nowrap;">${escapeHtml(new Date(log.createdAt).toLocaleString('en-US'))}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8;">${escapeHtml(log.actorName || log.actorEmail)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8;">${escapeHtml(log.action)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8;">${escapeHtml(log.resourceLabel || log.resourceType)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8;">${escapeHtml(details)}</td>
    </tr>
  `;
}

function logResendError(context, result) {
  if (!result?.error) return false;

  console.error(`${context} error:`, result.error);
  return true;
}

export async function sendConfirmationEmail(toEmail, name, circleName) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating confirmation email... missing RESEND_API_KEY');
      return true;
    }
    const result = await sendResendRequest('Confirmation email', () => resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: `تایید ثبت‌نام: ${circleName}`,
      html: `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/email-bg.png'); background-size: cover; background-position: center;"></div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #4a5d4e; margin-top: 0; font-size: 24px; font-weight: bold; text-align: center;">ثبت‌نام موفق</h2>
              <p style="font-size: 16px;">سلام <strong>${name}</strong> عزیز،</p>
              <p style="font-size: 16px;">ثبت‌نام شما در حلقه <strong>${circleName}</strong> با موفقیت انجام شد.</p>
              <p style="font-size: 16px;">در صورت تایید نهایی و تشکیل گروه، لینک دعوت به گروه تلگرام برای شما ارسال خواهد شد.</p>
              <hr style="border: 0; border-top: 1px solid #e5e0d8; margin: 30px 0;" />
              <p style="font-size: 14px; color: #5a5a5a; text-align: center; margin-bottom: 0;">
                با احترام،<br/>تیم حلقه‌های مگس در بطری
              </p>
            </div>
          </div>
        </div>
      `
    }));
    if (logResendError('Email', result)) return false;
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendTelegramInviteEmail(toEmail, name, circleName, telegramLink) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating telegram email... missing RESEND_API_KEY');
      return true;
    }
    const result = await sendResendRequest('Telegram invite email', () => resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: `دعوت‌نامه گروه تلگرام: ${circleName}`,
      html: `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/email-bg.png'); background-size: cover; background-position: center;"></div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #4a5d4e; margin-top: 0; font-size: 24px; font-weight: bold; text-align: center;">دعوت‌نامه گروه تلگرام</h2>
              <p style="font-size: 16px;">سلام <strong>${name}</strong> عزیز،</p>
              <p style="font-size: 16px;">گروه تلگرام حلقه <strong>${circleName}</strong> اکنون در دسترس است.</p>
              <p style="font-size: 16px;">لطفاً برای پیوستن به گروه و شروع گفتگوها، روی دکمه زیر کلیک کنید:</p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${telegramLink}" style="background-color: #4a5d4e; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(45, 45, 45, 0.1);">
                  پیوستن به گروه تلگرام
                </a>
              </div>
              
              <p style="font-size: 14px; color: #5a5a5a; text-align: center;">
                اگر دکمه بالا کار نمی‌کند، لینک زیر را در مرورگر خود کپی کنید:<br/>
                <a href="${telegramLink}" style="color: #a73c3c; word-break: break-all; display: inline-block; margin-top: 10px;" dir="ltr">${telegramLink}</a>
              </p>
              
              <hr style="border: 0; border-top: 1px solid #e5e0d8; margin: 30px 0;" />
              
              <p style="font-size: 14px; color: #5a5a5a; text-align: center; margin-bottom: 0;">
                با احترام،<br/>تیم حلقه‌های مگس در بطری
              </p>
            </div>
          </div>
        </div>
      `
    }));
    if (logResendError('Telegram invite email', result)) return false;
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendCustomEmail(emails, subject, messageHtml, circleName) {
  const recipientEmails = [...new Set(emails.filter(Boolean))];

  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating custom email... missing RESEND_API_KEY', { emails: recipientEmails, subject });
      return {
        success: true,
        attempted: recipientEmails.length,
        sent: recipientEmails.length,
        failed: 0,
        failedEmails: []
      };
    }

    const htmlContent = `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/email-bg.png'); background-size: cover; background-position: center;"></div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #4a5d4e; margin-top: 0; font-size: 24px; font-weight: bold; text-align: center;">پیام جدید: ${circleName}</h2>
              
              <div style="font-size: 16px; margin: 30px 0; white-space: pre-wrap;">
${messageHtml}
              </div>
              
              <hr style="border: 0; border-top: 1px solid #e5e0d8; margin: 30px 0;" />
              
              <p style="font-size: 14px; color: #5a5a5a; text-align: center; margin-bottom: 0;">
                با احترام،<br/>تیم حلقه‌های مگس در بطری
              </p>
            </div>
          </div>
        </div>
      `;

    const failedEmails = [];
    let sent = 0;

    for (let i = 0; i < recipientEmails.length; i += RESEND_BATCH_SIZE) {
      const batchEmails = recipientEmails.slice(i, i + RESEND_BATCH_SIZE);
      const result = await sendResendRequest('Custom email batch', () => resend.batch.send(batchEmails.map(email => ({
        from: SENDER_EMAIL,
        to: [email],
        subject,
        html: htmlContent
      }))));

      if (logResendError('Custom email batch', result)) {
        failedEmails.push(...batchEmails);
      } else {
        sent += Array.isArray(result?.data) ? result.data.length : batchEmails.length;
      }
    }

    return {
      success: failedEmails.length === 0,
      attempted: recipientEmails.length,
      sent,
      failed: failedEmails.length,
      failedEmails
    };
  } catch (error) {
    console.error('Custom email error:', error);
    return {
      success: false,
      attempted: recipientEmails.length,
      sent: 0,
      failed: recipientEmails.length,
      failedEmails: recipientEmails
    };
  }
}

export async function sendNewCircleRegistrationNotification(registration, origin) {
  try {
    const circleName = registration.circleNameEn || registration.circleNameFa || 'New circle';
    const reviewUrl = `${origin || ''}/admin/circle-registration/${registration._id}`;

    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating new circle registration notification... missing RESEND_API_KEY', {
        to: NEW_CIRCLE_NOTIFICATION_EMAILS,
        circleName,
        organizer: registration.fullName,
        email: registration.email,
        reviewUrl
      });
      return true;
    }

    const result = await sendResendRequest('New circle registration notification', () => resend.emails.send({
      from: SENDER_EMAIL,
      to: NEW_CIRCLE_NOTIFICATION_EMAILS,
      subject: `New circle registration: ${circleName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #fdfbf7; padding: 32px 20px; color: #2d2d2d; line-height: 1.6;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 12px; overflow: hidden;">
            <div style="padding: 28px 28px 20px;">
              <h2 style="color: #4a5d4e; margin: 0 0 12px; font-size: 22px;">Someone registered to make a new circle</h2>
              <p style="font-size: 15px; margin: 0 0 24px;">A new circle registration was submitted through the registration form.</p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${formatRegistrationField('Organizer name', registration.fullName)}
                ${formatRegistrationField('Email', registration.email)}
                ${formatRegistrationField('Telegram ID', registration.telegramId)}
                ${formatRegistrationField('Phone number', registration.phoneNumber)}
                ${formatRegistrationField('Country', registration.country)}
                ${formatRegistrationField('Workplace / school', registration.workplaceOrEducation)}
                ${formatRegistrationField('Education level', registration.educationLevel)}
                ${formatRegistrationField('Previous organizer', registration.previousOrganizer ? 'Yes' : 'No')}
                ${formatRegistrationField('Circle name (English)', registration.circleNameEn)}
                ${formatRegistrationField('Circle name (Persian)', registration.circleNameFa)}
                ${formatRegistrationField('Expected registration date', registration.expectedRegistrationDate)}
                ${formatRegistrationField('Expected session start date', registration.expectedSessionStartDate)}
                ${formatRegistrationField('Expected duration', registration.expectedDuration)}
              </table>

              <div style="margin-top: 24px;">
                <h3 style="color: #4a5d4e; margin: 0 0 8px; font-size: 16px;">Circle description</h3>
                <div style="white-space: pre-wrap; background-color: #fdfbf7; border: 1px solid #e5e0d8; border-radius: 8px; padding: 14px;">${escapeHtml(registration.description || 'Not provided')}</div>
              </div>

              <div style="text-align: center; margin: 30px 0 8px;">
                <a href="${escapeHtml(reviewUrl)}" style="background-color: #4a5d4e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; display: inline-block;">
                  Review registration
                </a>
              </div>
            </div>
          </div>
        </div>
      `
    }));
    if (logResendError('New circle registration notification', result)) return false;

    return true;
  } catch (error) {
    console.error('New circle registration notification email error:', error);
    return false;
  }
}

export async function sendCircleSetupFormEmail(toEmail, name, circleName, setupUrl) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating circle setup form email... missing RESEND_API_KEY', {
        to: toEmail,
        circleName,
        setupUrl
      });
      return true;
    }

    const result = await sendResendRequest('Circle setup form email', () => resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: `فرم تکمیل اطلاعات حلقه: ${circleName}`,
      html: `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/email-bg.png'); background-size: cover; background-position: center;"></div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #4a5d4e; margin-top: 0; font-size: 24px; font-weight: bold; text-align: center;">فرم تکمیل اطلاعات حلقه</h2>
              <p style="font-size: 16px;">سلام <strong>${escapeHtml(name)}</strong> عزیز،</p>
              <p style="font-size: 16px;">پیشنهاد حلقه <strong>${escapeHtml(circleName)}</strong> تایید شده است. لطفاً برای تکمیل اطلاعات عمومی حلقه و ساخت صفحه ثبت‌نام، فرم زیر را پر کنید.</p>

              <div style="text-align: center; margin: 36px 0;">
                <a href="${escapeHtml(setupUrl)}" style="background-color: #4a5d4e; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">
                  تکمیل فرم اطلاعات حلقه
                </a>
              </div>

              <p style="font-size: 14px; color: #5a5a5a; text-align: center;">
                اگر دکمه بالا کار نمی‌کند، این لینک را در مرورگر خود باز کنید:<br/>
                <a href="${escapeHtml(setupUrl)}" style="color: #a73c3c; word-break: break-all; display: inline-block; margin-top: 10px;" dir="ltr">${escapeHtml(setupUrl)}</a>
              </p>

              <hr style="border: 0; border-top: 1px solid #e5e0d8; margin: 30px 0;" />
              <p style="font-size: 14px; color: #5a5a5a; text-align: center; margin-bottom: 0;">
                با احترام،<br/>تیم حلقه‌های مگس در بطری
              </p>
            </div>
          </div>
        </div>
      `
    }));
    if (logResendError('Circle setup form email', result)) return false;

    return true;
  } catch (error) {
    console.error('Circle setup form email error:', error);
    return false;
  }
}

export async function sendCircleCreatedFromSetupEmail(registration, circle, circleUrl) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating circle created from setup email... missing RESEND_API_KEY', {
        to: NEW_CIRCLE_NOTIFICATION_EMAILS,
        circleName: circle.name,
        circleUrl,
        organizer: registration.fullName,
        email: registration.email
      });
      return true;
    }

    const result = await sendResendRequest('Circle created from setup email', () => resend.emails.send({
      from: SENDER_EMAIL,
      to: NEW_CIRCLE_NOTIFICATION_EMAILS,
      subject: `Circle created from follow-up form: ${circle.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #fdfbf7; padding: 32px 20px; color: #2d2d2d; line-height: 1.6;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 12px; overflow: hidden;">
            <div style="padding: 28px;">
              <h2 style="color: #4a5d4e; margin: 0 0 12px; font-size: 22px;">Follow-up form submitted</h2>
              <p style="font-size: 15px; margin: 0 0 24px;">The host completed the follow-up form and a new circle was created.</p>
              <p style="font-size: 14px; margin: 0 0 24px; color: #5a5a5a;">A full version with all registration and follow-up details has been sent to the publication team.</p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${formatRegistrationField('Circle name', circle.name)}
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #5a5a5a; width: 35%; vertical-align: top;">Circle link</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #2d2d2d; vertical-align: top;">
                    <a href="${escapeHtml(circleUrl)}" target="_blank" style="color: #4a5d4e;">${escapeHtml(circleUrl)}</a>
                  </td>
                </tr>
                ${formatRegistrationField('Capacity', circle.capacity === 0 ? 'Unlimited' : circle.capacity)}
                ${formatRegistrationField('Organizer name', registration.fullName)}
                ${formatRegistrationField('Organizer email', registration.email)}
                ${registration.setupDetails?.promoAssetUrl ? `
                  <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #5a5a5a; width: 35%; vertical-align: top;">Promotion image</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #2d2d2d; vertical-align: top;">
                      <a href="${escapeHtml(registration.setupDetails.promoAssetUrl)}" target="_blank" style="color: #4a5d4e;">View image</a>
                    </td>
                  </tr>
                ` : ''}
                ${registration.setupDetails?.shareFile?.url ? `
                  <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #5a5a5a; width: 35%; vertical-align: top;">Syllabus/Shared file</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #2d2d2d; vertical-align: top;">
                      <a href="${escapeHtml(registration.setupDetails.shareFile.url)}" target="_blank" style="color: #4a5d4e;">View file (${escapeHtml(registration.setupDetails.shareFile.name || 'document')})</a>
                    </td>
                  </tr>
                ` : ''}
              </table>

              <div style="text-align: center; margin: 30px 0 8px;">
                <a href="${escapeHtml(circleUrl)}" style="background-color: #4a5d4e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; display: inline-block;">
                  Open circle registration form
                </a>
              </div>
            </div>
          </div>
        </div>
      `
    }));
    if (logResendError('Circle created from setup email', result)) return false;

    return true;
  } catch (error) {
    console.error('Circle created from setup email error:', error);
    return false;
  }
}

export async function sendFullCircleSetupNotificationEmail(registration, circle, circleUrl) {
  try {
    const setupDetails = registration.setupDetails || {};
    const shareFile = setupDetails.shareFile || {};
    const circleName = circle.name || registration.circleNameEn || registration.circleNameFa || 'New circle';
    const attachments = buildSetupAttachments(setupDetails);

    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating full circle setup notification email... missing RESEND_API_KEY', {
        to: FULL_SETUP_NOTIFICATION_EMAILS,
        circleName,
        attachments: attachments.map((attachment) => attachment.filename)
      });
      return true;
    }

    const result = await sendResendRequest('Full circle setup notification email', () => resend.emails.send({
      from: SENDER_EMAIL,
      to: FULL_SETUP_NOTIFICATION_EMAILS,
      subject: `Full circle setup details: ${circleName}`,
      attachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 760px; margin: 0 auto; background-color: #fdfbf7; padding: 32px 20px; color: #2d2d2d; line-height: 1.6;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 12px; overflow: hidden;">
            <div style="padding: 28px;">
              <h2 style="color: #4a5d4e; margin: 0 0 12px; font-size: 22px;">Full circle registration and follow-up details</h2>
              <p style="font-size: 15px; margin: 0 0 24px;">The applicant completed the follow-up form. The uploaded photo and shared file are attached when available.</p>

              <h3 style="color: #4a5d4e; margin: 0 0 10px; font-size: 16px;">Created circle</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${formatRegistrationField('Circle name', circle.name)}
                ${formatLinkField('Circle link', circleUrl, 'Open circle registration form')}
                ${formatRegistrationField('Slug', circle.slug)}
                ${formatRegistrationField('Status', circle.status)}
                ${formatRegistrationField('Capacity', circle.capacity === 0 ? 'Unlimited' : circle.capacity)}
                ${formatRegistrationField('Follow-up submitted at', registration.setupSubmittedAt ? new Date(registration.setupSubmittedAt).toLocaleString('en-US') : '')}
              </table>

              <h3 style="color: #4a5d4e; margin: 28px 0 10px; font-size: 16px;">Original registration form</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${formatRegistrationField('Organizer name', registration.fullName)}
                ${formatRegistrationField('Email', registration.email)}
                ${formatRegistrationField('Telegram ID', registration.telegramId)}
                ${formatRegistrationField('Phone number', registration.phoneNumber)}
                ${formatRegistrationField('Country', registration.country)}
                ${formatRegistrationField('Workplace / school', registration.workplaceOrEducation)}
                ${formatRegistrationField('Education level', registration.educationLevel)}
                ${formatRegistrationField('Previous organizer', registration.previousOrganizer ? 'Yes' : 'No')}
                ${formatRegistrationField('Circle name (English)', registration.circleNameEn)}
                ${formatRegistrationField('Circle name (Persian)', registration.circleNameFa)}
                ${formatRegistrationField('Expected duration', registration.expectedDuration)}
                ${formatRegistrationField('Original registration submitted at', registration.createdAt ? new Date(registration.createdAt).toLocaleString('en-US') : '')}
              </table>

              ${formatTextBlock('Original circle description', registration.description)}

              <h3 style="color: #4a5d4e; margin: 28px 0 10px; font-size: 16px;">Follow-up form</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${formatRegistrationField('Promote on social media', setupDetails.promoteOnSocial)}
                ${formatRegistrationField('Show host name publicly', setupDetails.showHostName)}
                ${formatLinkField('Host social link', setupDetails.socialLink, 'Open social link')}
                ${formatRegistrationField('Capacity', setupDetails.capacity === 0 ? 'Unlimited' : setupDetails.capacity)}
                ${formatRegistrationField('Capacity note', setupDetails.capacityNote)}
                ${formatRegistrationField('Conversation language(s)', setupDetails.conversationLanguages)}
                ${formatRegistrationField('Prerequisites', setupDetails.prerequisites)}
                ${formatRegistrationField('Circle focus', setupDetails.circleFocus)}
                ${formatRegistrationField('Session activities', setupDetails.sessionActivities)}
                ${formatRegistrationField('Schedule plan', setupDetails.schedulePlan)}
                ${formatRegistrationField('Needed support', setupDetails.neededSupport)}
                ${formatRegistrationField('Subjects', setupDetails.subjects)}
                ${formatLinkField('Promotion image', setupDetails.promoAssetUrl, 'View promotion image')}
                ${formatLinkField('Shared file', shareFile.url, shareFile.name ? `View file (${shareFile.name})` : 'View file')}
                ${formatRegistrationField('Shared file type', shareFile.type)}
                ${formatRegistrationField('Shared file size', shareFile.size ? `${Math.round(shareFile.size / 1024)} KB` : '')}
              </table>

              ${formatTextBlock('Public introduction', setupDetails.publicIntroduction)}

              <div style="text-align: center; margin: 30px 0 8px;">
                <a href="${escapeHtml(circleUrl)}" style="background-color: #4a5d4e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; display: inline-block;">
                  Open circle registration form
                </a>
              </div>
            </div>
          </div>
        </div>
      `
    }));
    if (logResendError('Full circle setup notification email', result)) return false;

    return true;
  } catch (error) {
    console.error('Full circle setup notification email error:', error);
    return false;
  }
}

export async function sendAuditLogDigestEmail(logs) {
  try {
    if (!logs?.length) return true;

    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating audit log digest email... missing RESEND_API_KEY', {
        to: SUPER_ADMIN_EMAILS,
        count: logs.length
      });
      return true;
    }

    const result = await sendResendRequest('Audit log digest email', () => resend.emails.send({
      from: SENDER_EMAIL,
      to: SUPER_ADMIN_EMAILS,
      subject: `Admin activity log reached ${logs.length} entries`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 960px; margin: 0 auto; background-color: #fdfbf7; padding: 32px 20px; color: #2d2d2d; line-height: 1.5;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 12px; overflow: hidden;">
            <div style="padding: 28px;">
              <h2 style="color: #4a5d4e; margin: 0 0 12px; font-size: 22px;">Admin activity log digest</h2>
              <p style="font-size: 15px; margin: 0 0 24px;">The admin activity log reached ${logs.length} new entries. A copy is included below.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background: #f4f0e8;">
                    <th align="left" style="padding: 10px 12px;">Time</th>
                    <th align="left" style="padding: 10px 12px;">Admin</th>
                    <th align="left" style="padding: 10px 12px;">Action</th>
                    <th align="left" style="padding: 10px 12px;">Target</th>
                    <th align="left" style="padding: 10px 12px;">Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map(formatAuditLogRow).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    }));
    if (logResendError('Audit log digest email', result)) return false;

    return true;
  } catch (error) {
    console.error('Audit log digest email error:', error);
    return false;
  }
}
