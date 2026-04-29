"use client";
import Link from 'next/link';

export default function CirclesHub() {
    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header className="text-center mb-12">
                <h2 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Circles Hub</h2>
                <h3 className="font-sans dir-rtl" style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text-secondary)' }}>مرکز حلقه‌ها</h3>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <Link href="/available/circles" className="card hover-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', padding: '2.5rem', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    </div>
                    <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>Available Circles</h3>
                    <h4 className="dir-rtl" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 'normal' }}>حلقه‌های در دسترس</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Browse and register for our currently active circles and study groups.</p>
                </Link>
                
                <Link href="/proposals" className="card hover-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', padding: '2.5rem', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>Submit a Proposal</h3>
                    <h4 className="dir-rtl" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 'normal' }}>ثبت پیشنهاد</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Propose a new circle topic or reading group idea for the community.</p>
                </Link>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .hover-card {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .hover-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 32px rgba(45, 45, 45, 0.2);
                }
            `}} />
        </div>
    );
}

