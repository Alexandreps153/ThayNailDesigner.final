import { useEffect, useState } from 'react';
import { api, getToken, clearToken } from '@/lib/api';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';

export default function AdminPage() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthed(false);
      return;
    }
    api.checkAuth()
      .then(() => setAuthed(true))
      .catch(() => {
        clearToken();
        setAuthed(false);
      });
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authed) {
    return <AdminPanel onLogout={() => setAuthed(false)} />;
  }
  return <AdminLogin onSuccess={() => setAuthed(true)} />;
}
