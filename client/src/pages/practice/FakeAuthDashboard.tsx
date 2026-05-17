import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'fake-auth')!;

interface User {
  id: number;
  username: string;
  displayName: string;
}

export function FakeAuthDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          void navigate('/practice/fake-auth', { replace: true });
          return null;
        }
        return res.json() as Promise<User>;
      })
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => void navigate('/practice/fake-auth', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    void navigate('/practice/fake-auth', { replace: true });
  };

  if (loading) {
    return (
      <div>
        <LabHeader lab={lab} />
        <div role="status" aria-label="Loading dashboard" className="text-sm text-zinc-400">
          Checking session…
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <LabHeader lab={lab} />

      <div className="max-w-sm rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Dashboard</h2>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Authenticated
          </span>
        </div>

        <p className="text-sm text-zinc-600">
          Welcome back, <strong>{user.displayName}</strong>!
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-zinc-400">Username</dt>
            <dd className="font-mono text-zinc-700">{user.username}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-zinc-400">User ID</dt>
            <dd className="font-mono text-zinc-700">{user.id}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
