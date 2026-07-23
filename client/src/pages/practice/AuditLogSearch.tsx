import { useEffect, useState } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { getErrorMessage } from '../../lib/api';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'audit-log-search')!;

type SortOption = 'createdAt:desc' | 'createdAt:asc';

interface AuditLogEntry {
  id: number;
  username: string;
  eventType: 'login' | 'logout' | 'failed_login';
  createdAt: string;
}

interface AuditLogPage {
  items: AuditLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function AuditLogSearch() {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<SortOption>('createdAt:desc');
  const [username, setUsername] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<'unauthenticated' | 'forbidden' | null>(null);
  const [reseeding, setReseeding] = useState(false);

  const fetchPage = async (targetPage: number) => {
    setLoading(true);
    setError(null);
    setAuthError(null);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        pageSize: String(PAGE_SIZE),
        sort,
      });
      if (username.trim()) params.set('username', username.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const res = await fetch(`/api/audit-log?${params.toString()}`);
      if (res.status === 401) {
        setAuthError('unauthenticated');
        return;
      }
      if (res.status === 403) {
        setAuthError('forbidden');
        return;
      }
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as AuditLogPage;
      setItems(data.items);
      setPage(data.page);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchPage(1);
  };

  const handleReseed = async () => {
    setReseeding(true);
    setError(null);
    setAuthError(null);
    try {
      const res = await fetch('/api/audit-log/reseed', { method: 'POST' });
      if (res.status === 401) {
        setAuthError('unauthenticated');
        return;
      }
      if (res.status === 403) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? 'Reseeding is not allowed right now');
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      await fetchPage(1);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setReseeding(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <LabHeader lab={lab} />

      {authError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
        >
          {authError === 'unauthenticated' ? (
            <>
              You must be signed in as an admin to view the audit log. Sign in via the{' '}
              <a href="/practice/fake-auth" className="font-medium underline">
                Fake Auth
              </a>{' '}
              lab as <code>alice</code>.
            </>
          ) : (
            <>This account does not have admin access. Sign in as `alice` to view the audit log.</>
          )}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          Error: {error}
        </div>
      )}

      <form
        onSubmit={handleSearch}
        className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="lg:col-span-2">
          <label htmlFor="audit-username" className="mb-1 block text-xs font-medium text-muted">
            Username contains
          </label>
          <input
            id="audit-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. alice"
            className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="audit-from" className="mb-1 block text-xs font-medium text-muted">
            From date
          </label>
          <input
            id="audit-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="audit-to" className="mb-1 block text-xs font-medium text-muted">
            To date
          </label>
          <input
            id="audit-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <label htmlFor="audit-sort">Sort order</label>
          <select
            id="audit-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-edge px-2 py-1 text-sm"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => void handleReseed()}
          disabled={reseeding}
          className="rounded-lg border border-edge px-3 py-1.5 text-xs font-medium text-content transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50"
        >
          {reseeding ? 'Reseeding…' : 'Reseed fixture data'}
        </button>
      </div>

      {loading ? (
        <div role="status" aria-label="Loading audit log" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-raised" />
          ))}
        </div>
      ) : items.length === 0 && !authError ? (
        <p className="text-sm text-muted">No audit log entries match this search.</p>
      ) : (
        !authError && (
          <ul aria-label="Audit log entries" className="space-y-2">
            {items.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-edge bg-surface px-4 py-3 text-sm"
              >
                <span className="font-medium text-content">{entry.username}</span>
                <span className="text-muted">{entry.eventType}</span>
                <span className="text-xs text-muted">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )
      )}

      {!authError && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchPage(page - 1)}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-edge px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => void fetchPage(page + 1)}
              disabled={!hasMore || loading}
              className="rounded-lg border border-edge px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
