"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CirclesPage() {
  const router = useRouter();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (slug, id) => {
    const url = `${window.location.origin}/circles/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

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

      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoggingOut(false);
    }
  };

  const activeCircles = circles.filter((circle) => circle.status !== 'archived');
  const archivedCircles = circles.filter((circle) => circle.status === 'archived');

  const getStatusBadgeClass = (status) => {
    if (status === 'active') return 'badge-open';
    if (status === 'closed' || status === 'archived') return 'badge-closed';
    return '';
  };

  const renderCirclesTable = (items, emptyMessage) => (
    items.length === 0 ? (
      <p style={{ color: 'var(--text-secondary)' }}>{emptyMessage}</p>
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
            {items.map(circle => (
              <tr key={circle._id} className={circle.telegramLink ? 'row-completed' : ''}>
                <td style={{ fontWeight: 500 }}>{circle.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>/{circle.slug}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(circle.status)}`}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleCopyLink(circle.slug, circle._id)}
                      className="btn-secondary"
                      style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Copy Link"
                      aria-label="Copy Link"
                    >
                      {copiedId === circle._id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      )}
                    </button>
                    <Link
                      href={`/admin/circles/${circle._id}`}
                      className="btn-secondary"
                      style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Manage Circle"
                      aria-label="Manage Circle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  if (loading) return <div className="text-center mt-8">Loading circles...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Dashboard
          </Link>
          <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>Circles Management</h2>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn-secondary"
          disabled={loggingOut}
          style={{
            color: 'var(--danger)',
            borderColor: 'var(--danger)',
            padding: '0.55rem 1.1rem',
            fontSize: '0.9rem'
          }}
        >
          {loggingOut ? 'Logging Out...' : 'Log Out'}
        </button>
      </div>

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
        {renderCirclesTable(activeCircles, 'No active circles created yet.')}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Archived Circles</h3>
        {renderCirclesTable(archivedCircles, 'No archived circles yet.')}
      </div>

      {/* Inject specific dynamic styling for Telegram Rows */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
