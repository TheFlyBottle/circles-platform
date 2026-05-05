"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CircleRegistrationPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/registrations');
        const data = await res.json();

        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (!res.ok) throw new Error(data.error || 'Failed to load registrations');

        if (!ignore) setRegistrations(data.registrations || []);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [router]);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)' }}>Approved</span>;
      case 'rejected': return <span className="badge badge-closed">Rejected</span>;
      case 'reviewed': return <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#d97706' }}>Reviewed</span>;
      default: return <span className="badge badge-open">Pending</span>;
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
          <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>Circle Registrations</h2>
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

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered Circle (EN)</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Applicant</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading registrations...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No registrations found.</td></tr>
              ) : (
                registrations.map(registration => (
                  <tr key={registration._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{registration.circleNameEn}</div>
                      <div className="dir-rtl" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{registration.circleNameFa}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{registration.fullName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{registration.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(registration.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(registration.status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div className="flex gap-4 justify-center items-center" style={{ minHeight: '32px' }}>
                        <Link href={`/admin/circle-registration/${registration._id}`} className="btn-secondary" style={{ minWidth: '70px', height: '32px', padding: '0 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          Review
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
