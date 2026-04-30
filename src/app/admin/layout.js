import AdminPasswordGate from './AdminPasswordGate';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <AdminPasswordGate />
      {children}
    </div>
  );
}

