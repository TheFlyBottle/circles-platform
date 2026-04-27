"use client";

import { useEffect, useState, use } from 'react';
import { SUBJECTS } from '@/lib/constants';

export default function RegistrationForm({ params }) {
  const { slug } = use(params);
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    educationLevel: '',
    fieldOfStudy: '',
    interestedSubjects: [],
    agreedToCodeOfConduct: false,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCircle() {
      try {
        const res = await fetch(`/api/circles/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (!ignore) setCircle(data.circle);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCircle();
    return () => {
      ignore = true;
    };
  }, [slug]);

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const list = [...prev.interestedSubjects];
      if (list.includes(value)) {
        return { ...prev, interestedSubjects: list.filter(item => item !== value) };
      } else {
        return { ...prev, interestedSubjects: [...list, value] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');

    try {
      const payload = {
        ...formData,
        circleId: circle._id
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading registration form... / در حال بارگذاری...</div>;
  if (error) return (
    <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <div className="alert alert-error">
        <h3 className="font-serif">Cannot Access Form</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="card animate-fade-in text-center" style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h2 className="font-serif" style={{ color: 'var(--success)' }}>Registration Successful</h2>
      <p style={{ color: 'var(--text-secondary)', margin: '1.5rem 0', fontSize: '1.1rem' }}>
        Thank you for registering for <strong style={{ color: 'var(--foreground)' }}>{circle.titleEn || circle.name}</strong>. 
      </p>
      <p className="dir-rtl" style={{ color: 'var(--text-secondary)', margin: '1.5rem 0', fontSize: '1.1rem' }}>
        ثبت نام شما با موفقیت انجام شد. ما یک ایمیل تایید به آدرس شما ارسال کرده‌ایم.
      </p>
    </div>
  );

  const isFull = circle.capacity > 0 && circle.currentRegistrations >= circle.capacity;
  const isClosed = circle.status === 'closed';

  if (isClosed || isFull) {
    return (
      <div className="card animate-fade-in text-center" style={{ maxWidth: '600px', margin: '4rem auto' }}>
        <div className="motif-circle-large"></div>
        <h2 className="font-serif" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
          {isClosed ? 'Registration Closed' : 'Capacity is Full'}
        </h2>
        <h3 className="font-sans dir-rtl" style={{ color: 'var(--danger)', marginBottom: '2rem', fontWeight: 300 }}>
          {isClosed ? 'ثبت نام بسته شده است' : 'ظرفیت تکمیل است'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Unfortunately, we cannot accept any more registrations for <strong>{circle.titleEn || circle.name}</strong> at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="motif-circle-large"></div>
      <div className="text-center" style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <h2 className="font-serif" style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>{circle.titleEn || circle.name}</h2>
        <h3 className="font-sans dir-rtl" style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 300 }}>{circle.titleFa}</h3>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div className="motif-circle"></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {circle.capacity > 0 ? `${circle.currentRegistrations} / ${circle.capacity} Spots Filled` : 'Unlimited Spots'}
            </span>
        </div>
      </div>

      {submitError && <div className="alert alert-error">{submitError}</div>}

      <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="form-group">
            <label>Full Name / نام و نام خانوادگی</label>
            <input 
              type="text" className="form-control" 
              value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address / آدرس ایمیل</label>
            <input 
              type="email" className="form-control" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-4">
          <div className="form-group">
            <label>Country / کشور محل سکونت</label>
            <input 
              type="text" className="form-control" 
              value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Education / مقطع تحصیلی</label>
            <input 
              type="text" className="form-control" placeholder="e.g. Master's"
              value={formData.educationLevel} onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Field of Study / رشته تحصیلی</label>
            <input 
              type="text" className="form-control" 
              value={formData.fieldOfStudy} onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
              required 
            />
          </div>
        </div>

        <div className="form-group mt-4">
          <label>Interested Subjects / موضوعات مورد علاقه</label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Select multiple by holding Ctrl/Cmd
          </p>
          <select 
            multiple 
            className="form-control" 
            style={{ height: '180px' }}
            onChange={handleSubjectChange}
            required
            value={formData.interestedSubjects}
          >
            {SUBJECTS.map((subject, idx) => (
               <option key={idx} value={subject} style={{ padding: '0.5rem' }}>{subject}</option>
            ))}
          </select>
          <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 500 }}>
             Selected: {formData.interestedSubjects.length} subject(s)
          </p>
        </div>

        <div className="form-group mt-8" style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
          <div className="checkbox-group">
            <input 
              type="checkbox" id="conductCheckbox"
              checked={formData.agreedToCodeOfConduct} 
              onChange={(e) => setFormData({...formData, agreedToCodeOfConduct: e.target.checked})}
              required
            />
            <label htmlFor="conductCheckbox" style={{ fontSize: '0.95rem' }}>
              I agree to the <a href="#" target="_blank" style={{ fontWeight: 600, textDecoration: 'underline' }}>Code of Conduct</a>.<br/>
              <span className="dir-rtl" style={{ display: 'block', marginTop: '0.5rem' }}>
                من با <a href="#" target="_blank" style={{ fontWeight: 600, textDecoration: 'underline' }}>آیین‌نامه رفتاری حلقه‌های مگس در بطری</a> موافقت می‌کنم.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-8">
          <button type="submit" className="btn-primary w-full" style={{ padding: '1.25rem', fontSize: '1.1rem' }} disabled={submitLoading}>
            {submitLoading ? 'Submitting Registration...' : 'Complete Registration / تکمیل ثبت نام'}
          </button>
        </div>
      </form>
    </div>
  );
}
