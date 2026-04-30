"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  position: '',
  department: ''
};

const EMPTY_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function AdminSettings() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [canRemoveAdmins, setCanRemoveAdmins] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [activeSetting, setActiveSetting] = useState('password');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const mustChangePassword = Boolean(currentAdmin?.forcePasswordChange);

  const loadAdmins = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to load admins.');

      setAdmins(data.admins || []);
      setCurrentAdmin(data.currentAdmin || null);
      setCanRemoveAdmins(Boolean(data.canRemoveAdmins));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(loadAdmins, 0);
    return () => clearTimeout(timer);
  }, [loadAdmins]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create admin.');

      setFormData(EMPTY_FORM);
      setSuccess(`${data.admin.name || data.admin.email} can now sign in as an admin.`);
      await loadAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    setDeletingId(admin._id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/admins/${admin._id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to remove admin.');

      setSuccess(`${admin.name || admin.email} was removed from admins.`);
      await loadAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      setChangingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to change password.');

      setPasswordForm(EMPTY_PASSWORD_FORM);
      setSuccess('Your password was updated.');
      await loadAdmins();
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="mb-8">
        <Link href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Dashboard
        </Link>
        <h2 className="font-serif" style={{ color: 'var(--accent-primary)', fontSize: '2rem', margin: 0 }}>Admin Settings</h2>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}
      {mustChangePassword && (
        <div className="alert alert-error mb-4">
          You need to change your temporary password before using the admin dashboard.
        </div>
      )}

      {!mustChangePassword && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          className="card hover-card"
          onClick={() => setActiveSetting('password')}
          style={{
            padding: '1.5rem',
            textAlign: 'left',
            borderColor: activeSetting === 'password' ? 'var(--accent-primary)' : 'var(--border-color)'
          }}
        >
          <div style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--accent-primary)' }}>Change Password</h3>
        </button>

        <button
          type="button"
          className="card hover-card"
          onClick={() => setActiveSetting('create-admin')}
          style={{
            padding: '1.5rem',
            textAlign: 'left',
            borderColor: activeSetting === 'create-admin' ? 'var(--accent-primary)' : 'var(--border-color)'
          }}
        >
          <div style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
          </div>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--accent-primary)' }}>Create Admin</h3>
        </button>
        </div>
      )}

      {activeSetting === 'password' && (
        <div className="card mb-8">
          <h3 className="font-serif" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Change Your Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" className="form-control" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={8} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" className="form-control" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required minLength={8} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {!mustChangePassword && activeSetting === 'create-admin' && (
        <div className="card mb-8">
          <h3 className="font-serif" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Create Admin Profile</h3>
          <form onSubmit={handleCreateAdmin}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="form-control" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="form-control" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="name@example.com" />
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Position</label>
                <input type="text" className="form-control" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" className="form-control" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
      `}} />

      {!mustChangePassword && (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="font-serif" style={{ margin: 0, fontSize: '1.25rem' }}>Admin Profiles</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Position</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading admins...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No admins found.</td></tr>
              ) : (
                admins.map((admin) => {
                  const isCurrentAdmin = currentAdmin?.email === admin.email;
                  const isSuperAdmin = admin.role === 'super_admin';
                  const canDelete = canRemoveAdmins && !isSuperAdmin && !isCurrentAdmin;

                  return (
                    <tr key={admin._id}>
                      <td style={{ fontWeight: 500 }}>{admin.name}</td>
                      <td style={{ wordBreak: 'break-all' }}>{admin.email}</td>
                      <td>
                        <span className={isSuperAdmin ? 'badge badge-open' : 'badge'}>
                          {isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td>{admin.position || admin.department || 'Not provided'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {canDelete ? (
                          <button type="button" className="btn-secondary" onClick={() => handleDeleteAdmin(admin)} disabled={deletingId === admin._id} style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            {deletingId === admin._id ? 'Removing...' : 'Remove'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{isCurrentAdmin ? 'You' : 'Locked'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
