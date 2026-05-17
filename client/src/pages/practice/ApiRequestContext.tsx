import { useState, useEffect } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'api-request-context')!;

interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

export function ApiRequestContext() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTasks((await res.json()) as Task[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const task = (await res.json()) as Task;
      setTasks((prev) => [...prev, task]);
      setNewTitle('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (id: number, done: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !done }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-6 text-sm text-zinc-500">
        Playwright&apos;s <code className="rounded bg-zinc-100 px-1 text-xs">request</code> fixture
        operates entirely outside the browser. Use it to call GET, POST, PUT, and DELETE directly —
        seed data before a UI test, then verify the UI reflects it.
      </p>

      <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
        <p className="font-medium">API endpoints</p>
        <ul className="mt-2 space-y-0.5 font-mono text-xs">
          <li>GET &nbsp;&nbsp;/api/tasks</li>
          <li>POST &nbsp;/api/tasks &nbsp;&nbsp;&nbsp;&#123; title: string &#125;</li>
          <li>PUT &nbsp;&nbsp;/api/tasks/:id &nbsp;&#123; done?: boolean, title?: string &#125;</li>
          <li>DELETE /api/tasks/:id</li>
        </ul>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Add task */}
      <form onSubmit={(e) => void addTask(e)} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          aria-label="New task title"
          placeholder="New task…"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {loading ? (
        <div
          role="status"
          aria-label="Loading tasks"
          className="flex items-center gap-2 text-sm text-zinc-500"
        >
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
          Loading…
        </div>
      ) : (
        <ul aria-label="Task list" className="space-y-2">
          {tasks.length === 0 && (
            <li className="text-sm text-zinc-400">
              No tasks yet. Add one above or POST via the request fixture.
            </li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              data-testid={`task-${task.id}`}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => void toggleTask(task.id, task.done)}
                aria-label={`Mark "${task.title}" as ${task.done ? 'incomplete' : 'complete'}`}
                className="h-4 w-4 accent-indigo-600"
              />
              <span
                className={`flex-1 text-sm ${task.done ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}
              >
                {task.title}
              </span>
              <span className="text-xs text-zinc-400">{task.createdAt.slice(0, 10)}</span>
              <button
                type="button"
                onClick={() => void deleteTask(task.id)}
                aria-label={`Delete ${task.title}`}
                className="text-xs text-red-500 hover:text-red-700"
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
