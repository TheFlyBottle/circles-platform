"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CircleProposalsPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setError('');

    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed.');

      setMenuOpen(false);
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoggingOut(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Dashboard
          </Link>
          <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>Circle Proposals</h2>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="btn-secondary"
            aria-label="Open admin menu"
            aria-expanded={menuOpen}
            title="Admin menu"
            style={{
              width: '42px',
              height: '42px',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                zIndex: 10,
                minWidth: '210px',
                padding: '0.5rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                boxShadow: '0 16px 32px rgba(45, 45, 45, 0.14)'
              }}
            >
              <Link
                href="/circles"
                className="btn-secondary"
                onClick={() => setMenuOpen(false)}
                style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem' }}
              >
                View Client Side
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary"
                disabled={loggingOut}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  color: 'var(--danger)',
                  borderColor: 'var(--danger)'
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5,
            background: 'transparent',
            border: 0,
            padding: 0,
            cursor: 'default'
          }}
        />
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <p style={{ color: 'var(--text-secondary)' }}>No proposals found. (Placeholder)</p>
      </div>
    </div>
  );
}
