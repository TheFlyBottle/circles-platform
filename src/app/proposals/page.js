"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Proposals() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        previousOrganizer: null,
        fullName: '',
        workplaceOrEducation: '',
        country: '',
        email: '',
        telegramId: '',
        phoneNumber: '',
        educationLevel: '',
        circleNameFa: '',
        circleNameEn: '',
        description: '',
        expectedRegistrationDate: '',
        expectedSessionStartDate: '',
        expectedDuration: '',
        agreedToTerms: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.previousOrganizer === null) {
            setError('Please indicate if you have been a previous organizer. / لطفاً مشخص کنید که آیا پیشتر برگزارکننده بوده‌اید یا خیر.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push('/proposals/success');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div className="mb-4">
                <Link href="/circles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Hub
                </Link>
            </div>

            <header className="text-center mb-8">
                <h2 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Registration</h2>
                <h3 className="font-sans dir-rtl" style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text-secondary)' }}>ثبت نام حلقه</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
                    Interested in starting a new reading group or study circle? Fill out the form below to register your idea with The Fly Bottle team.
                </p>
            </header>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem' }}>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error mb-6">{error}</div>}

                    <div className="form-group dir-rtl" style={{ marginBottom: '2rem', textAlign: 'right' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>
                            آیا پیشتر در فِلای‌باتل مسئول یا برگزارکننده حلقه‌ای بوده‌اید؟ <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-start' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="previousOrganizer" checked={formData.previousOrganizer === true} onChange={() => setFormData({ ...formData, previousOrganizer: true })} />
                                بله (Yes)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="previousOrganizer" checked={formData.previousOrganizer === false} onChange={() => setFormData({ ...formData, previousOrganizer: false })} />
                                خیر (No)
                            </label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="form-group text-right">
                            <label className="dir-rtl">نام و نام خانوادگی (Full Name) <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input type="text" className="form-control dir-rtl" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                        </div>
                        <div className="form-group text-left">
                            <label>آدرس ایمیل (Email Address) <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="form-group text-left">
                            <label>آیدی تلگرام (Telegram ID) <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input type="text" className="form-control" placeholder="@username" required value={formData.telegramId} onChange={e => setFormData({ ...formData, telegramId: e.target.value })} />
                        </div>
                        <div className="form-group text-right">
                            <label className="dir-rtl">شماره تلفن (Phone Number)</label>
                            <input type="tel" className="form-control dir-rtl" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="form-group text-right">
                            <label className="dir-rtl">محل کار/تحصیل (Workplace/School)</label>
                            <input type="text" className="form-control dir-rtl" value={formData.workplaceOrEducation} onChange={e => setFormData({ ...formData, workplaceOrEducation: e.target.value })} />
                        </div>
                        <div className="form-group text-right">
                            <label className="dir-rtl">کشور محل سکونت (Country)</label>
                            <input type="text" className="form-control dir-rtl" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                        </div>
                        <div className="form-group text-right">
                            <label className="dir-rtl">میزان تحصیلات (Education Level)</label>
                            <input type="text" className="form-control dir-rtl" value={formData.educationLevel} onChange={e => setFormData({ ...formData, educationLevel: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="form-group text-right">
                            <label className="dir-rtl">نام حلقه به فارسی <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input type="text" className="form-control dir-rtl" required value={formData.circleNameFa} onChange={e => setFormData({ ...formData, circleNameFa: e.target.value })} />
                        </div>
                        <div className="form-group text-left">
                            <label>Circle's Name in English <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input type="text" className="form-control" required value={formData.circleNameEn} onChange={e => setFormData({ ...formData, circleNameEn: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group mb-6 text-right">
                        <label className="dir-rtl" style={{ display: 'block' }}>درباره حلقه‌ای که می‌خواهید تأسیس کنید توضیح دهید؛ برای مثال، هدف، نوع فعالیت‌ها، اعضای مورد نظر و نحوه برگزاری آن را شرح دهید. <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <textarea className="form-control dir-rtl" rows="5" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="form-group text-right">
                            <label className="dir-rtl" style={{ display: 'block' }}>چه زمانی را برای آغاز عضوگیری حلقه در نظر دارید؟ (Registration Start Date)</label>
                            <input type="date" className="form-control" value={formData.expectedRegistrationDate} onChange={e => setFormData({ ...formData, expectedRegistrationDate: e.target.value })} />
                        </div>
                        <div className="form-group text-right">
                            <label className="dir-rtl" style={{ display: 'block' }}>چه زمانی را برای شروع جلسات در نظر دارید؟ (Sessions Start Date)</label>
                            <input type="date" className="form-control" value={formData.expectedSessionStartDate} onChange={e => setFormData({ ...formData, expectedSessionStartDate: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group mb-8 text-right">
                        <label className="dir-rtl" style={{ display: 'block' }}>برای تکمیل این حلقه، به چند جلسه یا چه مدت زمان نیاز دارید؟ (Expected Duration)</label>
                        <input type="text" className="form-control dir-rtl" placeholder="e.g. 10 sessions or 3 months" value={formData.expectedDuration} onChange={e => setFormData({ ...formData, expectedDuration: e.target.value })} />
                    </div>

                    <div className="form-group mb-8" style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                        <div className="checkbox-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                            <input
                                type="checkbox" id="termsCheckbox"
                                checked={formData.agreedToTerms}
                                onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                                required
                                style={{ marginTop: '0.25rem' }}
                            />
                            <label htmlFor="termsCheckbox" className="dir-rtl text-right" style={{ fontSize: '0.95rem', flex: 1, cursor: 'pointer' }}>
                                من <a href="https://drive.google.com/file/d/1xHX79M4W6mkcjF6FBA6drc0s4k2LoZTt/view" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, textDecoration: 'underline', color: 'var(--accent-primary)' }}>شرایط استفاده از خدمات حلقه‌های مگس در بطری</a> را خوانده‌ام و با آن موافقم. <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full" style={{ padding: '1.25rem', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? 'Submitting / در حال ثبت...' : 'Register / ثبت نام'}
                    </button>
                </form>
            </div>
        </div>
    );
}
