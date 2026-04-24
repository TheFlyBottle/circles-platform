"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      const res = await fetch('/api/admin/circles');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCircles(data.circles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading dashboard...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>Admin Dashboard</h2>
        <Link href="/admin/circles/new" className="btn-primary">
          + Create Circle
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3 className="font-serif" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Active Circles</h3>
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

