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

const ACTION_LABELS = {
  'admin.create': 'Created admin',
  'admin.delete': 'Removed admin',
  'admin.password_change': 'Changed password',
  'circle.create': 'Created circle',
  'circle.create_from_registration': 'Created circle from registration',
  'circle.update': 'Updated circle',
  'circle.delete': 'Deleted circle',
  'circle.email_members': 'Emailed circle members',
  'registration.status_update': 'Updated registration status'
};

function formatAction(action) {
  return ACTION_LABELS[action] || action;
}

function TrashIcon({ size = 16 }) {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

export default function AdminSettings() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [canRemoveAdmins, setCanRemoveAdmins] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [activeSetting, setActiveSetting] = useState('password');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingLogId, setDeletingLogId] = useState(null);
  const [clearingLogs, setClearingLogs] = useState(false);
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

  const loadAuditLogs = useCallback(async () => {
    setLogsLoading(true);

    try {
      const res = await fetch('/api/admin/audit-logs?limit=50');
      const data = await res.json();

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to load activity logs.');

      setAuditLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLogsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(loadAdmins, 0);
    return () => clearTimeout(timer);
  }, [loadAdmins]);

  useEffect(() => {
    if (activeSetting !== 'activity-log' || mustChangePassword) return;

    const timer = setTimeout(loadAuditLogs, 0);
    return () => clearTimeout(timer);
  }, [activeSetting, loadAuditLogs, mustChangePassword]);

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

  const handleDeleteLog = async (log) => {
    setDeletingLogId(log._id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/audit-logs/${log._id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete activity log.');

      setSuccess('Activity log deleted.');
      await loadAuditLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingLogId(null);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Delete all activity logs?')) return;

    setClearingLogs(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/audit-logs', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to clear activity logs.');

      setSuccess(`Deleted ${data.deletedCount} activity logs.`);
      await loadAuditLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setClearingLogs(false);
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
        <div className="grid md:grid-cols-3 gap-4 mb-8">
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

        <button
          type="button"
          className="card hover-card"
          onClick={() => setActiveSetting('activity-log')}
          style={{
            padding: '1.5rem',
            textAlign: 'left',
            borderColor: activeSetting === 'activity-log' ? 'var(--accent-primary)' : 'var(--border-color)'
          }}
        >
          <div style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
          </div>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--accent-primary)' }}>Activity Log</h3>
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

      {!mustChangePassword && activeSetting === 'activity-log' && (
        <div className="card mb-8" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex justify-between items-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="font-serif" style={{ margin: 0, fontSize: '1.25rem' }}>Activity Log</h3>
            {canRemoveAdmins && (
              <button type="button" className="btn-secondary" onClick={handleClearLogs} disabled={clearingLogs || logsLoading || auditLogs.length === 0} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                {clearingLogs ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  {canRemoveAdmins && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr><td colSpan={canRemoveAdmins ? '6' : '5'} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading activity...</td></tr>
                ) : auditLogs.length === 0 ? (
                  <tr><td colSpan={canRemoveAdmins ? '6' : '5'} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No activity recorded yet.</td></tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{log.actorName || log.actorEmail}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.actorEmail}</div>
                      </td>
                      <td><span className="badge">{formatAction(log.action)}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{log.resourceLabel || log.resourceType}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.resourceType}</div>
                      </td>
                      <td style={{ maxWidth: '400px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {log.details?.updatedFields?.length ? `Fields: ${log.details.updatedFields.join(', ')}` : ''}
                        {log.details?.status ? `Status: ${log.details.previousStatus || 'unknown'} -> ${log.details.status}` : ''}
                        {log.details?.recipientCount ? `Sent to ${log.details.recipientCount} members` : ''}
                        {log.details?.deletedSubmissions ? `Deleted ${log.details.deletedSubmissions} submissions` : ''}
                        {!log.details?.updatedFields?.length && !log.details?.status && !log.details?.recipientCount && !log.details?.deletedSubmissions ? 'Recorded' : ''}
                      </td>
                        {canRemoveAdmins && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => handleDeleteLog(log)}
                            disabled={deletingLogId === log._id}
                            aria-label="Delete activity log"
                            title={deletingLogId === log._id ? 'Deleting activity log' : 'Delete activity log'}
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger)', width: '34px', height: '34px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <TrashIcon size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => handleDeleteAdmin(admin)}
                            disabled={deletingId === admin._id}
                            aria-label={`Remove admin ${admin.name || admin.email}`}
                            title={deletingId === admin._id ? 'Removing admin' : 'Remove admin'}
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger)', width: '34px', height: '34px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <TrashIcon size={15} />
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
