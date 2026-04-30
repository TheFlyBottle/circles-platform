"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', password: '', position: '', department: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setSuccess('Registration successful! You can now sign in.');
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <div className="text-center" style={{ marginBottom: '2rem' }}>
        <h2 className="font-serif" style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Admin Registration</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Create a new administrator account.</p>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="form-group">
            <label>First Name</label>
            <input 
              type="text" className="form-control" 
              value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" className="form-control" 
              value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required 
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" className="form-control" 
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" className="form-control" 
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            required minLength={6}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="form-group">
            <label>Position</label>
            <input 
              type="text" className="form-control" 
              value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input 
              type="text" className="form-control" 
              value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Processing...' : 'Register'}
        </button>
      </form>
      
      <div className="text-center mt-8" style={{ fontSize: '0.9rem' }}>
        <Link href="/admin/login" style={{ color: 'var(--text-secondary)' }}>
          Already have an account? <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>Sign In</span>
        </Link>
      </div>
    </div>
  );
}
