import { useState, useEffect } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'network-api')!;

interface Note {
  id: number;
  text: string;
  createdAt: string;
}

export function NetworkApi() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNotes((await res.json()) as Note[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotes();
  }, []);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const note = (await res.json()) as Note;
      setNotes((prev) => [...prev, note]);
      setNewText('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAdding(false);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-6 text-sm text-zinc-500">
        This UI fetches from{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">/api/notes</code> on load and after
        mutations. Use{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">page.route()</code> to intercept or
        mock any of these requests.
      </p>

      {/* Add note form */}
      <form onSubmit={(e) => void addNote(e)} className="mb-6 flex gap-2" aria-label="Add note">
        <label htmlFor="note-input" className="sr-only">
          New note
        </label>
        <input
          id="note-input"
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!newText.trim() || adding}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          Error: {error}
        </div>
      )}

      {loading ? (
        <div role="status" aria-label="Loading notes" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-zinc-400">No notes yet. Add one above.</p>
      ) : (
        <ul className="space-y-2" aria-label="Notes list">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
            >
              <span className="text-sm text-zinc-800">{note.text}</span>
              <button
                type="button"
                onClick={() => void deleteNote(note.id)}
                aria-label={`Delete note: ${note.text}`}
                className="ml-3 shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
