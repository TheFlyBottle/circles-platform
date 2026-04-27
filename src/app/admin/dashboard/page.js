"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCircles() {
      try {
        const res = await fetch('/api/admin/circles');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (!ignore) setCircles(data.circles);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCircles();
    return () => {
      ignore = true;
    };
  }, []);

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

  if (loading) return <div className="text-center mt-8">Loading dashboard...</div>;

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: 0 }}>Active Circles</h3>
          <Link
            href="/admin/circles/new"
            className="btn-primary"
            aria-label="Create circle"
            title="Create circle"
            style={{
              width: '38px',
              height: '38px',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              flex: '0 0 auto'
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </div>
        {circles.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No circles created yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Telegram</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {circles.map(circle => (
                  <tr key={circle._id} className={circle.telegramLink ? 'row-completed' : ''}>
                    <td style={{ fontWeight: 500 }}>{circle.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>/{circle.slug}</td>
                    <td>
                      <span className={`badge ${circle.status === 'active' ? 'badge-open' : circle.status === 'closed' ? 'badge-closed' : ''}`}>
                        {circle.status}
                      </span>
                    </td>
                    <td>{circle.capacity === 0 ? 'Unlimited' : circle.capacity}</td>
                    <td>
                      {circle.telegramLink ? (
                        <span className="badge badge-open">Added</span>
                      ) : (
                        <span className="badge badge-closed">None</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/admin/circles/${circle._id}`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inject specific dynamic styling for Telegram Rows */}
      <style dangerouslySetInnerHTML={{__html: `
        .row-completed td {
          border-bottom: 1px solid rgba(74, 93, 78, 0.2) !important;
          background: rgba(74, 93, 78, 0.03);
        }
        .row-completed:hover td {
          background: rgba(74, 93, 78, 0.06) !important;
        }
      `}} />
    </div>
  );
}

