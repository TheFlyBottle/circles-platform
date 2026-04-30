"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
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
        <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>Admin Dashboard</h2>
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
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                View Circles Hub
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
          style={{ position: 'fixed', inset: 0, zIndex: 5, background: 'transparent', border: 0, padding: 0, cursor: 'default' }}
        />
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Link href="/admin/circles" className="card hover-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          </div>
          <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>Circles</h3>
          {/* <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Manage active and closed circles. Edit details, manage capacities, and assign Telegram links.</p> */}
        </Link>

        <Link href="/admin/circle-registration" className="card hover-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3 className="font-serif" style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>Circle Registrations</h3>
          {/* <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Review and manage user-submitted registrations for new circles.</p> */}
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
      `}} />
    </div>
  );
}

