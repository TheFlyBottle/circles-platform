"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

function Field({ label, children }) {
  return (
    <div className="form-group text-right" style={{ marginBottom: '1.5rem' }}>
      <label className="dir-rtl" style={{ display: 'block', lineHeight: 1.8 }}>{label}</label>
      {children}
    </div>
  );
}

function RadioGroup({ name, label }) {
  return (
    <Field label={label}>
      <div className="dir-rtl" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="radio" name={name} value="yes" required />
          بله
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="radio" name={name} value="no" required />
          خیر
        </label>
      </div>
    </Field>
  );
}

export default function CircleSetupForm({ params, searchParams }) {
  const { id } = use(params);
  const { token = '' } = use(searchParams);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdCircle, setCreatedCircle] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadSetup() {
      try {
        const res = await fetch(`/api/registrations/${id}/setup?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Setup form not found.');
        if (!ignore) setRegistration(data.registration);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSetup();
    return () => {
      ignore = true;
    };
  }, [id, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData(event.currentTarget);
      formData.set('token', token);

      const res = await fetch(`/api/registrations/${id}/setup`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit setup form.');
      setCreatedCircle(data.circle);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading form...</div>;

  if (error && !registration) {
    return <div className="alert alert-error" style={{ maxWidth: '680px', margin: '4rem auto' }}>{error}</div>;
  }

  if (createdCircle) {
    return (
      <div className="animate-fade-in text-center" style={{ maxWidth: '680px', margin: '4rem auto' }}>
        <div className="card">
          <h2 className="font-serif" style={{ color: 'var(--success)', marginBottom: '1rem' }}>Circle Created</h2>
          <p className="dir-rtl" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            اطلاعات حلقه با موفقیت ثبت شد و صفحه ثبت‌نام حلقه ساخته شد.
          </p>
          <Link href={`/circles/${createdCircle.slug}`} className="btn-primary" style={{ marginTop: '1.5rem' }}>
            View Circle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="text-center mb-8">
        <h2 className="font-serif" style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Circle Details</h2>
        <h3 className="font-sans dir-rtl" style={{ fontSize: '1.35rem', fontWeight: 300, color: 'var(--text-secondary)' }}>تکمیل اطلاعات حلقه</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          {registration.circleNameEn} / <span className="dir-rtl">{registration.circleNameFa}</span>
        </p>
      </header>

      <div className="card" style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem' }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error mb-6">{error}</div>}
          <input type="hidden" name="token" value={token} />

          <RadioGroup
            name="promoteOnSocial"
            label="آیا می‌خواهید این حلقه از طریق شبکه‌های اجتماعی مگس در بطری معرفی شود؟"
          />

          <RadioGroup
            name="showHostName"
            label="آیا مایل هستید نام شما به‌عنوان میزبان حلقه، در کنار معرفی حلقه در وب‌سایت نمایش داده شود؟"
          />

          <Field label="در صورت تمایل، می‌توانید لینک یکی از شبکه‌های اجتماعی‌تان را نیز اضافه کنید تا دیگران برای آشنایی بیشتر با شما به آن مراجعه کنند.">
            <input type="url" name="socialLink" className="form-control" dir="ltr" placeholder="https://..." />
          </Field>

          <Field label="اگر برای تعداد اعضای حلقه محدودیتی در نظر دارید، لطفاً ظرفیت نهایی را وارد کنید. عدد ۰ به معنی نامحدود است.">
            <input type="number" name="capacity" min="0" defaultValue="0" className="form-control" required />
          </Field>

          <Field label="اگر توضیحی درباره محدودیت تعداد اعضا دارید، لطفاً اینجا بنویسید.">
            <textarea name="capacityNote" className="form-control dir-rtl" rows="3" />
          </Field>

          <Field label="اگر عکس یا لوگوی خاصی برای تبلیغ گروه در نظر دارید لطفاً آن را بارگذاری بفرمایید.">
            <input type="file" name="promoAsset" className="form-control" accept="image/*,.pdf" />
          </Field>

          <Field label="اگر طرح درس یا فایل دیگری دارید که می‌خواهید با داوطلبان عضویت در حلقه به اشتراک بگذارید، لطفاً در اینجا بارگذاری کنید.">
            <input type="file" name="shareFile" className="form-control" accept=".pdf,.doc,.docx,.txt,.rtf,image/*" />
          </Field>

          <Field label="زبان(های) اصلی گفتگو">
            <input type="text" name="conversationLanguages" className="form-control dir-rtl" required />
          </Field>

          <Field label="آیا عضویت در این حلقه پیش‌نیاز خاصی دارد؟">
            <textarea name="prerequisites" className="form-control dir-rtl" rows="3" />
          </Field>

          <Field label="لطفاً برای نمایش در وب‌سایت، معرفی عمومی و کاملی از حلقهٔ خود بنویسید. متن را به فارسی یا انگلیسی بنویسید و لطفاً آن را در حدود ۱۵۰ تا ۲۰۰ واژه نگه دارید.">
            <textarea name="publicIntroduction" className="form-control dir-rtl" rows="7" required />
          </Field>

          <Field label="تمرکز حلقه بر چه خواهد بود؟">
            <textarea name="circleFocus" className="form-control dir-rtl" rows="4" required />
          </Field>

          <Field label="در جلسات چه فعالیت‌هایی انجام می‌شود؟">
            <textarea name="sessionActivities" className="form-control dir-rtl" rows="4" required />
          </Field>

          <Field label="اگر برنامهٔ زمانی خاصی برای برگزاری جلسات در نظر دارید، لطفاً آن را بنویسید.">
            <textarea name="schedulePlan" className="form-control dir-rtl" rows="3" />
          </Field>

          <Field label="به چه پشتیبانی از تیم مگس در بطری نیاز دارید؟">
            <textarea name="neededSupport" className="form-control dir-rtl" rows="3" />
          </Field>

          <Field label="لطفاً همه‌ی موضوعاتی که به حلقه‌ی مورد نظر شما مربوط است را انتخاب کنید یا بنویسید.">
            <textarea name="subjects" className="form-control dir-rtl" rows="3" required />
          </Field>

          <button type="submit" className="btn-primary w-full" style={{ padding: '1.1rem', fontSize: '1.05rem' }} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit & Create Circle'}
          </button>
        </form>
      </div>
    </div>
  );
}
