"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistrationReviewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/proposals/${id}`);
        const data = await res.json();
        
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        
        if (!res.ok) throw new Error(data.error || 'Failed to load registration');
        
        if (!ignore) setProposal(data.proposal);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, router]);

  const handleStatusChange = async (newStatus) => {
    if (!confirm(`Are you sure you want to mark this registration as ${newStatus}?${newStatus === 'approved' ? ' This will automatically create an active Circle.' : ''}`)) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${newStatus} registration`);

      setProposal(data.proposal);
      
      if (newStatus === 'approved') {
        alert('Registration approved. A new active Circle has been created.');
        router.push('/admin/circles');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-12" style={{color: 'var(--text-secondary)'}}>Loading registration details...</div>;
  if (error && !proposal) return <div className="alert alert-error" style={{maxWidth: '600px', margin: '4rem auto'}}>{error}</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/admin/circle-registration" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Registrations
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem', margin: 0 }}>Review Registration</h2>
        <span className={`badge ${proposal.status === 'approved' ? '' : proposal.status === 'rejected' ? 'badge-closed' : 'badge-open'}`} style={proposal.status === 'approved' ? {background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)'} : proposal.status === 'reviewed' ? {background: 'rgba(217, 119, 6, 0.2)', color: '#d97706'} : {}}>
          {proposal.status.toUpperCase()}
        </span>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Applicant Details</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div><strong style={{color: 'var(--text-secondary)'}}>Full Name:</strong> <br/>{proposal.fullName}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Email:</strong> <br/>{proposal.email}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Telegram ID:</strong> <br/>{proposal.telegramId}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Phone Number:</strong> <br/>{proposal.phoneNumber || 'N/A'}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Country:</strong> <br/>{proposal.country || 'N/A'}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Education Level:</strong> <br/>{proposal.educationLevel || 'N/A'}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Workplace/School:</strong> <br/>{proposal.workplaceOrEducation || 'N/A'}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Previous Organizer?</strong> <br/>{proposal.previousOrganizer ? 'Yes' : 'No'}</div>
        </div>

        <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '2rem' }}>Circle Details</h3>
        <div className="mb-4">
          <strong style={{color: 'var(--text-secondary)'}}>Registered Circle Name (EN):</strong>
          <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{proposal.circleNameEn}</div>
        </div>
        <div className="mb-4">
          <strong style={{color: 'var(--text-secondary)'}} className="dir-rtl">نام پیشنهادی حلقه (FA):</strong>
          <div className="dir-rtl" style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{proposal.circleNameFa}</div>
        </div>
        
        <div className="mb-6">
          <strong style={{color: 'var(--text-secondary)'}}>Description:</strong>
          <div className="dir-rtl" style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--border-radius)', lineHeight: '1.6' }}>
            {proposal.description}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div><strong style={{color: 'var(--text-secondary)'}}>Expected Registration Date:</strong> <br/>{proposal.expectedRegistrationDate || 'Not specified'}</div>
          <div><strong style={{color: 'var(--text-secondary)'}}>Expected Session Start:</strong> <br/>{proposal.expectedSessionStartDate || 'Not specified'}</div>
          <div className="md:col-span-2"><strong style={{color: 'var(--text-secondary)'}}>Expected Duration:</strong> <br/>{proposal.expectedDuration || 'Not specified'}</div>
        </div>
        
        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <strong>Agreed to Terms:</strong> {proposal.agreedToTerms ? 'Yes' : 'No'} <br/>
          <strong>Submitted On:</strong> {new Date(proposal.createdAt).toLocaleString()}
        </div>
      </div>

      {proposal.status !== 'approved' && (
        <div className="flex gap-4 justify-end">
          {proposal.status !== 'rejected' && (
            <button 
              className="btn-secondary" 
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.8rem 1.5rem' }}
              onClick={() => handleStatusChange('rejected')}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Reject Registration'}
            </button>
          )}
          
          <button 
            className="btn-primary" 
            style={{ background: 'var(--success)', color: '#fff', padding: '0.8rem 1.5rem' }}
            onClick={() => handleStatusChange('approved')}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Approve & Create Circle'}
          </button>
        </div>
      )}
    </div>
  );
}
