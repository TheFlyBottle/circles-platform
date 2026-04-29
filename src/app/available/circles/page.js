"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CirclesList() {
    const [circles, setCircles] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/circles')
            .then(res => res.json())
            .then(data => {
                if(data.success) setCircles(data.circles);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-center mt-8">Loading circles... / در حال بارگذاری...</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div className="mb-4">
                <Link href="/circles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Hub
                </Link>
            </div>
            <header className="text-center mb-8">
                <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Available Circles</h2>
                <h3 className="font-sans dir-rtl" style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text-secondary)' }}>حلقه‌های در دسترس</h3>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {circles && circles.map(circle => {
                    const isFull = circle.capacity > 0 && circle.currentRegistrations >= circle.capacity;
                    const isClosed = circle.status === 'closed';
                    const locked = isFull || isClosed;

                    return (
                        <div key={circle._id} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                            <div className="motif-circle-large"></div>
                            <div style={{ flexGrow: 1, zIndex: 1, position: 'relative' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`badge ${locked ? (isClosed ? 'badge-closed' : 'badge-full') : 'badge-open'}`}>
                                        {isClosed ? 'Closed / بسته' : isFull ? 'Full / تکمیل' : 'Open / باز'}
                                    </span>
                                </div>
                                <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{circle.titleEn || circle.name}</h3>
                                <h4 className="dir-rtl" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{circle.titleFa}</h4>
                                
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>{circle.descriptionEn}</p>
                                <p className="dir-rtl" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{circle.descriptionFa}</p>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto', zIndex: 1, position: 'relative' }}>
                                <div className="flex items-center justify-between">
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        {circle.capacity > 0 ? `${circle.currentRegistrations} / ${circle.capacity} spots` : `${circle.currentRegistrations} joined`}
                                    </span>
                                    {locked ? (
                                        <button className="btn-primary" disabled>Register</button>
                                    ) : (
                                        <Link href={`/circles/${circle.slug}`} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                                            Register
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
