"use client";

import { useCallback, useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CircleDetails({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [circle, setCircle] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [telegramLink, setTelegramLink] = useState('');
  const [capacityInput, setCapacityInput] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const loadCircleData = useCallback(async () => {
    const res = await fetch(`/api/admin/circles/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }, [id]);

  const applyCircleData = (data) => {
    setCircle(data.circle);
    setSubmissions(data.submissions);
    setTelegramLink(data.circle.telegramLink || '');
    setCapacityInput(data.circle.capacity || 0);
  };

  const fetchData = useCallback(async () => {
    try {
      const data = await loadCircleData();
      applyCircleData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadCircleData]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const data = await loadCircleData();
        if (!ignore) applyCircleData(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [loadCircleData]);

  const handleUpdateLink = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/circles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramLink })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(data.message || 'Telegram link updated successfully.');
      fetchData(); // refresh to show updated notified statuses
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdateLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/circles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCircle({ ...circle, status: newStatus });
      setSuccess(`Status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCapacityUpdate = async () => {
    let parsedCapacity = parseInt(capacityInput, 10);
    if (isNaN(parsedCapacity) || parsedCapacity < 0) parsedCapacity = 0;
    
    if (parsedCapacity === circle.capacity) {
      setCapacityInput(parsedCapacity);
      return;
    }

    setUpdateLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/circles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: parsedCapacity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCircle({ ...circle, capacity: parsedCapacity });
      setCapacityInput(parsedCapacity);
      setSuccess(`Capacity updated to ${parsedCapacity === 0 ? 'Unlimited' : parsedCapacity}.`);
    } catch (err) {
      setError(err.message);
      setCapacityInput(circle.capacity); // Revert on error
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/circles/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.push('/admin/dashboard');
    } catch (err) {
      setError(`Error deleting circle: ${err.message}`);
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading circle...</div>;
  if (!circle) return <div className="text-center mt-8">Circle not found</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem', margin: 0 }}>{circle.name}</h2>
            {deletingId ? (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', background: 'var(--danger)', border: 'none' }}>
                  Confirm Delete
                </button>
                <button onClick={() => setDeletingId(null)} className="btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setDeletingId(id)} className="btn-secondary flex items-center justify-center" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)', borderRadius: '50%' }} title="Delete Circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
            <span>Slug: /{circle.slug}</span>
            <span className="flex items-center">
              Status: 
              <select 
                value={circle.status} 
                onChange={handleStatusChange} 
                className="form-control" 
                style={{ marginLeft: '0.5rem', padding: '0.2rem 1rem 0.2rem 0.5rem', height: 'auto', background: 'transparent', color: 'var(--accent-primary)', fontWeight: 'bold' }}
                disabled={updateLoading}
              >

                <option value="active">active</option>
                <option value="closed">closed</option>
              </select>
            </span>
            <span className="flex items-center">
              Capacity (0=Unl): 
              <input 
                type="number"
                min="0"
                value={capacityInput} 
                onChange={(e) => setCapacityInput(e.target.value)}
                onBlur={handleCapacityUpdate}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCapacityUpdate(); }}
                className="form-control" 
                style={{ marginLeft: '0.5rem', width: '80px', padding: '0.2rem 0.5rem', height: 'auto', background: 'transparent', color: 'var(--accent-primary)', fontWeight: 'bold' }}
                disabled={updateLoading}
                title="Enter 0 for Unlimited"
              />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/circles" className="btn-secondary">
            Back to Circles
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card mb-8">
        <h3 className="font-serif" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Telegram Invitation Configuration</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          When you add or update the Telegram invite link, the system will automatically send an invitation email to all existing registered users who have not yet received one.
        </p>
        
        <form onSubmit={handleUpdateLink} className="flex gap-4 items-end">
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Telegram Group Link</label>
            <input 
              type="url" className="form-control" 
              value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)}
              placeholder="https://t.me/+joinlink"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={updateLoading}>
            {updateLoading ? 'Updating...' : 'Save & Send Invites'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-serif" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Registered Submissions ({submissions.length})</h3>
        {submissions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No submissions for this circle yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Education</th>
                  <th>Field</th>
                  <th>Notified (TG)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub._id}>
                    <td style={{ fontWeight: 500 }}>{sub.fullName}</td>
                    <td style={{ wordBreak: 'break-all', maxWidth: '200px' }}>{sub.email}</td>
                    <td>{sub.country}</td>
                    <td>{sub.educationLevel}</td>
                    <td style={{ maxWidth: '250px' }}>{sub.fieldOfStudy}</td>
                    <td>
                      {sub.notified ? (
                        <span className="badge badge-open">Sent</span>
                      ) : (
                        <span className="badge badge-closed">Pending</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

