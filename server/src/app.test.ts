import http from 'node:http';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import app from './app';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Unable to resolve test server address');
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

async function json<T>(path: string, init?: RequestInit): Promise<{ response: Response; body: T }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const body = (await response.json()) as T;
  return { response, body };
}

describe('health endpoint', () => {
  test('reports the server is healthy', async () => {
    const { response, body } = await json<{ ok: boolean }>('/health');

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  test('sets baseline security headers', async () => {
    const { response } = await json<{ ok: boolean }>('/health');

    expect(response.headers.get('x-powered-by')).toBeNull();
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.get('content-security-policy')).toContain("default-src 'self'");
  });
});

describe('notes API', () => {
  test('creates and deletes a note', async () => {
    const text = `Server note ${Date.now()}`;
    const created = await json<{ id: number; text: string }>('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });

    expect(created.response.status).toBe(201);
    expect(created.body.text).toBe(text);

    const deleted = await fetch(`${baseUrl}/api/notes/${created.body.id}`, { method: 'DELETE' });
    expect(deleted.status).toBe(204);
  });

  test('rejects blank note text', async () => {
    const { response, body } = await json<{ error: string }>('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ text: '   ' }),
    });

    expect(response.status).toBe(400);
    expect(body.error).toBe('text is required');
  });

  test('returns not found when deleting a missing note', async () => {
    const { response, body } = await json<{ error: string }>('/api/notes/999999', {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
    expect(body.error).toBe('Note not found');
  });
});

describe('auth API', () => {
  test('sets a session cookie for valid login and returns the current user', async () => {
    const login = await json<{ username: string; role: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'alice', password: 'password123' }),
    });

    expect(login.response.status).toBe(200);
    expect(login.body).toMatchObject({ username: 'alice', role: 'admin' });

    const cookie = login.response.headers.get('set-cookie');
    expect(cookie).toContain('connect.sid');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');

    const me = await json<{ username: string; role: string }>('/api/auth/me', {
      headers: { Cookie: cookie ?? '' },
    });

    expect(me.response.status).toBe(200);
    expect(me.body).toMatchObject({ username: 'alice', role: 'admin' });
  });

  test('blocks admin stats for a regular user', async () => {
    const login = await json<{ username: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'bob', password: 'letmein' }),
    });
    const cookie = login.response.headers.get('set-cookie');

    const stats = await json<{ error: string }>('/api/auth/admin/stats', {
      headers: { Cookie: cookie ?? '' },
    });

    expect(stats.response.status).toBe(403);
    expect(stats.body.error).toBe('Forbidden');
  });

  test('rejects missing login credentials', async () => {
    const { response, body } = await json<{ error: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'alice' }),
    });

    expect(response.status).toBe(400);
    expect(body.error).toBe('username and password are required');
  });

  test('rejects invalid login credentials', async () => {
    const { response, body } = await json<{ error: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'alice', password: 'wrongpassword' }),
    });

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid credentials');
  });

  test('returns a generic JSON error for malformed request bodies', async () => {
    const { response, body } = await json<{ error: string }>('/api/auth/login', {
      method: 'POST',
      body: '{"username":',
    });

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid JSON body');
  });

  test('requires authentication for the current user endpoint', async () => {
    const { response, body } = await json<{ error: string }>('/api/auth/me');

    expect(response.status).toBe(401);
    expect(body.error).toBe('Not authenticated');
  });

  test('requires authentication for admin stats', async () => {
    const { response, body } = await json<{ error: string }>('/api/auth/admin/stats');

    expect(response.status).toBe(401);
    expect(body.error).toBe('Not authenticated');
  });
});

describe('tasks API', () => {
  test('creates, updates, and deletes a task', async () => {
    const title = `Server task ${Date.now()}`;
    const created = await json<{ id: number; title: string; done: boolean }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    expect(created.response.status).toBe(201);
    expect(created.body).toMatchObject({ title, done: false });

    const updated = await json<{ id: number; done: boolean }>(`/api/tasks/${created.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({ done: true }),
    });
    expect(updated.response.status).toBe(200);
    expect(updated.body.done).toBe(true);

    const deleted = await fetch(`${baseUrl}/api/tasks/${created.body.id}`, { method: 'DELETE' });
    expect(deleted.status).toBe(204);
  });

  test('rejects a blank task title on create', async () => {
    const { response, body } = await json<{ error: string }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    });

    expect(response.status).toBe(400);
    expect(body.error).toBe('title is required');
  });

  test('rejects an empty title when updating a task', async () => {
    const created = await json<{ id: number }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: `Update validation ${Date.now()}` }),
    });

    const { response, body } = await json<{ error: string }>(`/api/tasks/${created.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: '   ' }),
    });

    expect(response.status).toBe(400);
    expect(body.error).toBe('title must be a non-empty string');
  });

  test('rejects non-boolean done values when updating a task', async () => {
    const created = await json<{ id: number }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: `Done validation ${Date.now()}` }),
    });

    const { response, body } = await json<{ error: string }>(`/api/tasks/${created.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({ done: 'yes' }),
    });

    expect(response.status).toBe(400);
    expect(body.error).toBe('done must be a boolean');
  });

  test('returns not found when updating or deleting a missing task', async () => {
    const updated = await json<{ error: string }>('/api/tasks/999999', {
      method: 'PUT',
      body: JSON.stringify({ done: true }),
    });
    expect(updated.response.status).toBe(404);
    expect(updated.body.error).toBe('Task not found');

    const deleted = await json<{ error: string }>('/api/tasks/999999', {
      method: 'DELETE',
    });
    expect(deleted.response.status).toBe(404);
    expect(deleted.body.error).toBe('Task not found');
  });
});

describe('catalog APIs', () => {
  test('returns products for HAR-backed practice', async () => {
    const { response, body } = await json<Array<{ name: string }>>('/api/products');

    expect(response.status).toBe(200);
    expect(body).toHaveLength(10);
    expect(body[0]).toMatchObject({ name: 'Mechanical Keyboard' });
  });

  test('returns fresh service-worker items from the network endpoint', async () => {
    const { response, body } = await json<Array<{ name: string; source: string }>>('/api/sw-items');

    expect(response.status).toBe(200);
    expect(body).toContainEqual({ id: 1, name: 'Fresh Widget', source: 'network' });
  });

  test('returns not found for an unknown product', async () => {
    const { response, body } = await json<{ error: string }>('/api/products/999999');

    expect(response.status).toBe(404);
    expect(body.error).toBe('Product not found');
  });
});
