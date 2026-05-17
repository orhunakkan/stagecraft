import { useState, useEffect } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'storage-state')!;

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  role: 'admin' | 'user';
}

interface AdminData {
  totalUsers: number;
  pendingReviews: number;
}

export function StorageState() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          setProfile(null);
        } else {
          const user = (await res.json()) as UserProfile;
          setProfile(user);
          if (user.role === 'admin') {
            const adminRes = await fetch('/api/auth/admin/stats', { credentials: 'include' });
            if (adminRes.ok) setAdminData((await adminRes.json()) as AdminData);
          }
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-6 text-sm text-zinc-500">
        This lab begins with a valid session already in hand. The focus is on{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">context.storageState()</code> — saving
        auth state to a file so subsequent tests skip the login flow, and loading different states
        into parallel contexts (admin vs. regular user).
      </p>

      {/* Credentials hint */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
        <p className="font-medium text-zinc-800">Test credentials</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-zinc-600">Admin user</p>
            <p className="font-mono text-xs text-zinc-700">username: alice</p>
            <p className="font-mono text-xs text-zinc-700">password: password123</p>
            <span className="mt-1 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">
              role: admin
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-600">Regular user</p>
            <p className="font-mono text-xs text-zinc-700">username: bob</p>
            <p className="font-mono text-xs text-zinc-700">password: letmein</p>
            <span className="mt-1 inline-block rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600">
              role: user
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Log in at{' '}
          <a href="/practice/fake-auth" className="text-indigo-600 underline hover:text-indigo-800">
            /practice/fake-auth
          </a>{' '}
          first to establish a session.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          role="status"
          aria-label="Loading profile"
          className="flex items-center gap-2 text-sm text-zinc-500"
        >
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
          Loading…
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Profile card */}
          <div
            data-testid="profile-card"
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                {profile.displayName[0]}
              </div>
              <div>
                <p className="font-semibold text-zinc-900" data-testid="display-name">
                  {profile.displayName}
                </p>
                <p className="text-sm text-zinc-500">@{profile.username}</p>
              </div>
              <span
                data-testid="user-role"
                className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
                  profile.role === 'admin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {profile.role}
              </span>
            </div>
          </div>

          {/* Admin-only panel */}
          {profile.role === 'admin' && adminData && (
            <div
              data-testid="admin-panel"
              aria-label="Admin panel"
              className="rounded-xl border border-indigo-200 bg-indigo-50 p-5"
            >
              <h2 className="mb-3 text-sm font-semibold text-indigo-900">Admin panel</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-indigo-200 bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700" data-testid="total-users">
                    {adminData.totalUsers}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">Total users</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600" data-testid="pending-reviews">
                    {adminData.pendingReviews}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">Pending reviews</p>
                </div>
              </div>
            </div>
          )}

          {/* Challenge hint */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <p className="font-medium">Challenge</p>
            <p className="mt-1 text-zinc-500">
              Log in as both users and call{' '}
              <code className="rounded bg-zinc-100 px-1 text-xs">
                await context.storageState(&#123; path: &apos;admin.json&apos; &#125;)
              </code>{' '}
              for each. Load both states into parallel contexts and assert that only the admin
              context sees the admin panel.
            </p>
          </div>
        </div>
      ) : (
        <div
          data-testid="not-authenticated"
          className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center"
        >
          <p className="text-sm text-zinc-600">
            Not authenticated. Log in at{' '}
            <a
              href="/practice/fake-auth"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              /practice/fake-auth
            </a>{' '}
            to see role-specific content.
          </p>
        </div>
      )}
    </div>
  );
}
