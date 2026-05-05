"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCircle() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', slug: '', status: 'active', capacity: 0 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)' }}>Create New Circle</h2>
        <Link href="/admin/dashboard" className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
          Back
        </Link>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Circle Name</label>
          <input 
            type="text" className="form-control" 
            value={formData.name} onChange={handleNameChange}
            required placeholder="e.g. History Seminar Fall 2026"
          />
        </div>
        
        <div className="form-group">
          <label>URL Slug (Unique path)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <input 
              type="text" className="form-control" 
              value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})}
              required placeholder="history-seminar-fall-2026"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="active">Active (Open)</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Capacity limit (0 = unlimited)</label>
            <input 
              type="number" className="form-control" min="0"
              value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Circle'}
        </button>
      </form>
    </div>
  );
}

