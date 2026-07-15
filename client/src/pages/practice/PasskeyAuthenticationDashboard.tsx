import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'passkey-authentication')!;

interface User {
  id: number;
  username: string;
  displayName: string;
}

export function PasskeyAuthenticationDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/passkey/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          void navigate('/practice/passkey-authentication', { replace: true });
          return null;
        }
        return res.json() as Promise<User>;
      })
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => void navigate('/practice/passkey-authentication', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = async () => {
    await fetch('/api/passkey/logout', { method: 'POST', credentials: 'include' });
    void navigate('/practice/passkey-authentication', { replace: true });
  };

  if (loading) {
    return (
      <div>
        <LabHeader lab={lab} />
        <div role="status" aria-label="Loading dashboard" className="text-sm text-muted">
          Checking session…
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <LabHeader lab={lab} />

      <div className="max-w-sm rounded-xl border border-edge bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-content">Dashboard</h2>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Passkey verified
          </span>
        </div>

        <p className="text-sm text-muted">
          Welcome back, <strong>{user.displayName}</strong>!
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted">Username</dt>
            <dd className="font-mono text-muted">{user.username}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted">User ID</dt>
            <dd className="font-mono text-muted">{user.id}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 w-full rounded-lg border border-edge px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-canvas"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
