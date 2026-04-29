"use client";

import Link from 'next/link';

export default function ProposalSuccess() {
  return (
    <div className="card animate-fade-in text-center" style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <div className="motif-circle-large"></div>
      <h2 className="font-serif" style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '2rem' }}>
        Proposal Submitted!
      </h2>
      <h3 className="font-sans dir-rtl" style={{ color: 'var(--success)', marginBottom: '2rem', fontWeight: 300, fontSize: '1.5rem' }}>
        پیشنهاد شما با موفقیت ثبت شد!
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
        Thank you for your interest in organizing a circle with The Fly Bottle. Our team will review your proposal and get back to you soon.
      </p>
      <Link href="/circles" className="btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
        Return to Circles Hub
      </Link>
    </div>
  );
}
