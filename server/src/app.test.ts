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
});
