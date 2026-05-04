import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_test123');

const SENDER_EMAIL = 'The Fly Bottle <noreply@theflybottle.org>';
const NEW_CIRCLE_NOTIFICATION_EMAIL = 'diba.makki@theflybottle.org';
const SUPER_ADMIN_EMAIL = 'diba.makki@theflybottle.org';

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

export async function sendConfirmationEmail(toEmail, name, circleName) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating confirmation email... missing RESEND_API_KEY');
      return true;
    }
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: `تایید ثبت‌نام: ${circleName}`,
      html: `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/EmailLogo.png'); background-size: cover; background-position: center;"></div>
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
    });
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
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: `دعوت‌نامه گروه تلگرام: ${circleName}`,
      html: `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/EmailLogo.png'); background-size: cover; background-position: center;"></div>
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
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendCustomEmail(emails, subject, messageHtml, circleName) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating custom email... missing RESEND_API_KEY', { emails, subject });
      return true;
    }

    const htmlContent = `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/EmailLogo.png'); background-size: cover; background-position: center;"></div>
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

    // Use Resend's batch API to send individual emails efficiently
    await resend.batch.send(emails.map(email => ({
      from: SENDER_EMAIL,
      to: [email],
      subject: subject,
      html: htmlContent
    })));

    return true;
  } catch (error) {
    console.error('Custom email error:', error);
    return false;
  }
}

export async function sendNewCircleRegistrationNotification(registration) {
  try {
    const circleName = registration.circleNameEn || registration.circleNameFa || 'New circle';

    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating new circle registration notification... missing RESEND_API_KEY', {
        to: NEW_CIRCLE_NOTIFICATION_EMAIL,
        circleName,
        organizer: registration.fullName,
        email: registration.email
      });
      return true;
    }

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [NEW_CIRCLE_NOTIFICATION_EMAIL],
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
            </div>
          </div>
        </div>
      `
    });

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

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: `فرم تکمیل اطلاعات حلقه: ${circleName}`,
      html: `
        <div dir="rtl" style="font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #fdfbf7; padding: 40px 20px; color: #2d2d2d; line-height: 1.8;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(45, 45, 45, 0.08);">
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/TheFlyBottle/circles-platform/master/public/EmailLogo.png'); background-size: cover; background-position: center;"></div>
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
    });

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
        to: SUPER_ADMIN_EMAIL,
        circleName: circle.name,
        circleUrl,
        organizer: registration.fullName,
        email: registration.email
      });
      return true;
    }

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [SUPER_ADMIN_EMAIL],
      subject: `Circle created from follow-up form: ${circle.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #fdfbf7; padding: 32px 20px; color: #2d2d2d; line-height: 1.6;">
          <div style="background-color: #ffffff; border: 1px solid #e5e0d8; border-radius: 12px; overflow: hidden;">
            <div style="padding: 28px;">
              <h2 style="color: #4a5d4e; margin: 0 0 12px; font-size: 22px;">Follow-up form submitted</h2>
              <p style="font-size: 15px; margin: 0 0 24px;">The host completed the follow-up form and a new circle was created.</p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${formatRegistrationField('Circle name', circle.name)}
                ${formatRegistrationField('Circle link', circleUrl)}
                ${formatRegistrationField('Capacity', circle.capacity === 0 ? 'Unlimited' : circle.capacity)}
                ${formatRegistrationField('Organizer name', registration.fullName)}
                ${formatRegistrationField('Organizer email', registration.email)}
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
    });

    return true;
  } catch (error) {
    console.error('Circle created from setup email error:', error);
    return false;
  }
}

export async function sendAuditLogDigestEmail(logs) {
  try {
    if (!logs?.length) return true;

    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating audit log digest email... missing RESEND_API_KEY', {
        to: SUPER_ADMIN_EMAIL,
        count: logs.length
      });
      return true;
    }

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: [SUPER_ADMIN_EMAIL],
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
    });

    return true;
  } catch (error) {
    console.error('Audit log digest email error:', error);
    return false;
  }
}
