import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_test123');

const SENDER_EMAIL = 'onboarding@resend.dev';
const NEW_CIRCLE_NOTIFICATION_EMAIL = 'diba.makki@theflybottle.org';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatProposalField(label, value) {
  const displayValue = value || 'Not provided';

  return `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #5a5a5a; width: 35%; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e0d8; color: #2d2d2d; vertical-align: top;">${escapeHtml(displayValue)}</td>
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
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/dibamackie/circles/master/public/circles-bg.png'); background-size: cover; background-position: center;"></div>
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
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/dibamackie/circles/master/public/circles-bg.png'); background-size: cover; background-position: center;"></div>
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
            <div style="width: 100%; height: 180px; background-color: #4a5d4e; background-image: url('https://raw.githubusercontent.com/dibamackie/circles/master/public/circles-bg.png'); background-size: cover; background-position: center;"></div>
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

export async function sendNewCircleProposalNotification(proposal) {
  try {
    const circleName = proposal.circleNameEn || proposal.circleNameFa || 'New circle';

    if (!process.env.RESEND_API_KEY) {
      console.warn('Simulating new circle proposal notification... missing RESEND_API_KEY', {
        to: NEW_CIRCLE_NOTIFICATION_EMAIL,
        circleName,
        organizer: proposal.fullName,
        email: proposal.email
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
              <p style="font-size: 15px; margin: 0 0 24px;">A new circle proposal was submitted through the registration form.</p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${formatProposalField('Organizer name', proposal.fullName)}
                ${formatProposalField('Email', proposal.email)}
                ${formatProposalField('Telegram ID', proposal.telegramId)}
                ${formatProposalField('Phone number', proposal.phoneNumber)}
                ${formatProposalField('Country', proposal.country)}
                ${formatProposalField('Workplace / school', proposal.workplaceOrEducation)}
                ${formatProposalField('Education level', proposal.educationLevel)}
                ${formatProposalField('Previous organizer', proposal.previousOrganizer ? 'Yes' : 'No')}
                ${formatProposalField('Circle name (English)', proposal.circleNameEn)}
                ${formatProposalField('Circle name (Persian)', proposal.circleNameFa)}
                ${formatProposalField('Expected registration date', proposal.expectedRegistrationDate)}
                ${formatProposalField('Expected session start date', proposal.expectedSessionStartDate)}
                ${formatProposalField('Expected duration', proposal.expectedDuration)}
              </table>

              <div style="margin-top: 24px;">
                <h3 style="color: #4a5d4e; margin: 0 0 8px; font-size: 16px;">Circle description</h3>
                <div style="white-space: pre-wrap; background-color: #fdfbf7; border: 1px solid #e5e0d8; border-radius: 8px; padding: 14px;">${escapeHtml(proposal.description || 'Not provided')}</div>
              </div>
            </div>
          </div>
        </div>
      `
    });

    return true;
  } catch (error) {
    console.error('New circle proposal notification email error:', error);
    return false;
  }
}
