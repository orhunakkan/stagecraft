import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import app, { apiErrorHandler } from './app';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  server = http.createServer(app);
  baseUrl = await listenOnRandomPort(server, 'Unable to resolve test server address');
});

afterAll(async () => {
  await closeServer(server);
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

async function listenOnRandomPort(serverToListen: http.Server, errorMessage: string) {
  return new Promise<string>((resolve) => {
    serverToListen.listen(0, '127.0.0.1', () => {
      const address = serverToListen.address();
      if (!address || typeof address === 'string') {
        throw new Error(errorMessage);
      }
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

async function closeServer(serverToClose: http.Server) {
  await new Promise<void>((resolve, reject) => {
    serverToClose.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
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

describe('ready endpoint', () => {
  test('reports the server is ready', async () => {
    const { response, body } = await json<{ ready: boolean }>('/ready');

    expect(response.status).toBe(200);
    expect(body).toEqual({ ready: true });
  });
});

describe('server-sent events API', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('streams build log events and a completion event', async () => {
    vi.useFakeTimers();

    const response = await fetch(`${baseUrl}/api/sse`);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let stream = '';

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(response.headers.get('cache-control')).toContain('no-cache');
    expect(reader).toBeDefined();

    for (let tick = 0; tick < 12; tick += 1) {
      const read = reader!.read();
      await vi.advanceTimersByTimeAsync(600);
      const result = await read;

      if (result.value) {
        stream += decoder.decode(result.value, { stream: !result.done });
      }

      if (stream.includes('event: done')) {
        break;
      }
    }

    expect(stream).toContain('event: log');
    expect(stream).toContain('"type":"info","message":"Build started"');
    expect(stream).toContain('"type":"error","message":"Health-check failed — retrying…"');
    expect(stream).toContain('event: done');
  });
});

describe('API documentation', () => {
  test('serves the OpenAPI document', async () => {
    const { response, body } = await json<{
      openapi: string;
      paths: Record<string, unknown>;
    }>('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(body.openapi).toBe('3.0.3');
    expect(body.paths).toHaveProperty('/health');
    expect(body.paths).toHaveProperty('/api/auth/login');
    expect(body.paths).toHaveProperty('/api/notes');
    expect(body.paths).toHaveProperty('/api/tasks/{id}');
    expect(body.paths).toHaveProperty('/api/products/{id}');
    expect(body.paths).toHaveProperty('/api/sw-items');
  });

  test('serves Swagger UI for the OpenAPI document', async () => {
    const response = await fetch(`${baseUrl}/api-docs`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('id="swagger-ui"');
    expect(html).toContain('Stagecraft API Docs');
    expect(response.headers.get('content-security-policy')).toContain(
      "script-src 'self' 'unsafe-inline'",
    );
  });
});

describe('production startup configuration', () => {
  const originalEnv = { ...process.env };
  const clientDist = path.resolve(process.cwd(), '../client/dist');

  async function writeProductionIndex() {
    await fs.mkdir(clientDist, { recursive: true });
    await fs.writeFile(
      path.join(clientDist, 'index.html'),
      '<!doctype html><html><body>Stagecraft production shell</body></html>',
    );
  }

  async function startProductionApp() {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.CLIENT_ORIGIN = 'https://stagecraft.example';
    process.env.SESSION_SECRET = 'test-secret';
    await writeProductionIndex();

    const productionApp = (await import('./app.js')).default as unknown as typeof app;
    const productionServer = http.createServer(productionApp);
    const productionBaseUrl = await listenOnRandomPort(
      productionServer,
      'Unable to resolve production test server address',
    );

    return { productionBaseUrl, productionServer };
  }

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  test('rejects localhost client origins in production', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.CLIENT_ORIGIN = 'http://localhost:5173';
    process.env.SESSION_SECRET = 'test-secret';

    await expect(import('./app.js')).rejects.toThrow(
      'CLIENT_ORIGIN must not be localhost in production',
    );
  });

  test('requires a session secret in production', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.CLIENT_ORIGIN = 'https://stagecraft.example';
    delete process.env.SESSION_SECRET;

    await expect(import('./app.js')).rejects.toThrow(
      'SESSION_SECRET environment variable is required in production',
    );
  });

  test('sets strict transport security in production', async () => {
    const { productionBaseUrl, productionServer } = await startProductionApp();

    try {
      const response = await fetch(`${productionBaseUrl}/health`);

      expect(response.status).toBe(200);
      expect(response.headers.get('strict-transport-security')).toBe(
        'max-age=15552000; includeSubDomains',
      );
    } finally {
      await closeServer(productionServer);
    }
  });

  test('serves the SPA shell for production client routes', async () => {
    const { productionBaseUrl, productionServer } = await startProductionApp();

    try {
      const response = await fetch(`${productionBaseUrl}/practice/network-api`);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-cache');
      expect(response.headers.get('content-type')).toContain('text/html');
      expect(html).toContain('Stagecraft production shell');
    } finally {
      await closeServer(productionServer);
    }
  });

  test('serves index.html through static middleware with no-cache headers', async () => {
    const { productionBaseUrl, productionServer } = await startProductionApp();

    try {
      const response = await fetch(`${productionBaseUrl}/index.html`);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-cache');
      expect(html).toContain('Stagecraft production shell');
    } finally {
      await closeServer(productionServer);
    }
  });

  test('does not serve the SPA shell for API or non-GET requests', async () => {
    const { productionBaseUrl, productionServer } = await startProductionApp();

    try {
      const apiResponse = await fetch(`${productionBaseUrl}/api/missing`);
      const apiBody = (await apiResponse.json()) as { error: string };
      const postResponse = await fetch(`${productionBaseUrl}/practice/network-api`, {
        method: 'POST',
      });

      expect(apiResponse.status).toBe(404);
      expect(apiResponse.headers.get('content-type')).toContain('application/json');
      expect(apiBody.error).toBe('API route not found');
      expect(postResponse.status).toBe(404);
    } finally {
      await closeServer(productionServer);
    }
  });
});

describe('notes API', () => {
  test('returns the seed notes array', async () => {
    const { response, body } =
      await json<Array<{ id: number; text: string; createdAt: string }>>('/api/notes');

    expect(response.status).toBe(200);
    expect(body).toHaveLength(3);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, text: 'Intercept network requests with page.route()' }),
        expect.objectContaining({
          id: 2,
          text: 'Use waitForResponse() to synchronise on API calls',
        }),
        expect.objectContaining({ id: 3, text: 'Mock responses with route.fulfill()' }),
      ]),
    );
  });

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

  test('logs out an authenticated session', async () => {
    const login = await json<{ username: string; role: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'alice', password: 'password123' }),
    });
    const cookie = login.response.headers.get('set-cookie');

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookie ?? '' },
    });

    expect(logout.status).toBe(204);

    const me = await json<{ error: string }>('/api/auth/me', {
      headers: { Cookie: cookie ?? '' },
    });

    expect(me.response.status).toBe(401);
    expect(me.body.error).toBe('Not authenticated');
  });

  test('returns admin stats for an admin session', async () => {
    const login = await json<{ username: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'alice', password: 'password123' }),
    });
    const cookie = login.response.headers.get('set-cookie');

    const stats = await json<{ totalUsers: number; pendingReviews: number }>(
      '/api/auth/admin/stats',
      {
        headers: { Cookie: cookie ?? '' },
      },
    );

    expect(stats.response.status).toBe(200);
    expect(stats.body).toEqual({ totalUsers: 2, pendingReviews: 3 });
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
  test('returns the seed tasks array', async () => {
    const { response, body } =
      await json<Array<{ id: number; title: string; done: boolean; createdAt: string }>>(
        '/api/tasks',
      );

    expect(response.status).toBe(200);
    expect(body).toHaveLength(3);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, title: 'Write a Playwright test', done: false }),
        expect.objectContaining({ id: 2, title: 'Use the request fixture', done: false }),
        expect.objectContaining({ id: 3, title: 'Seed data via API before UI test', done: false }),
      ]),
    );
  });

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

  test('updates a task title without changing its done state', async () => {
    const created = await json<{ id: number; title: string; done: boolean }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: `Rename me ${Date.now()}` }),
    });

    const updated = await json<{ id: number; title: string; done: boolean }>(
      `/api/tasks/${created.body.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated server task title' }),
      },
    );

    expect(updated.response.status).toBe(200);
    expect(updated.body).toMatchObject({ title: 'Updated server task title', done: false });

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

  test('rejects task updates without any supported fields', async () => {
    const created = await json<{ id: number }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: `Empty update validation ${Date.now()}` }),
    });

    const emptyUpdate = await json<{ error: string }>(`/api/tasks/${created.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
    expect(emptyUpdate.response.status).toBe(400);
    expect(emptyUpdate.body.error).toBe('at least one task field is required');

    const unknownOnlyUpdate = await json<{ error: string }>(`/api/tasks/${created.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({ priority: 'high' }),
    });
    expect(unknownOnlyUpdate.response.status).toBe(400);
    expect(unknownOnlyUpdate.body.error).toBe('at least one task field is required');
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

  test('returns an individual product by id', async () => {
    const { response, body } = await json<{ id: number; name: string; inStock: boolean }>(
      '/api/products/1',
    );

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ id: 1, name: 'Mechanical Keyboard', inStock: true });
  });
});

describe('activity feed API', () => {
  test('paginates activity feed items with the default page size', async () => {
    const { response, body } = await json<{
      items: Array<{ id: number; title: string }>;
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
    }>('/api/feed');

    expect(response.status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(body.total).toBe(42);
    expect(body.hasMore).toBe(true);
    expect(body.items).toHaveLength(10);
    expect(body.items[0]).toMatchObject({ id: 1, title: 'Deployed new feature' });
  });

  test('clamps invalid pagination values to supported bounds', async () => {
    const { response, body } = await json<{
      items: Array<{ id: number }>;
      page: number;
      pageSize: number;
      hasMore: boolean;
    }>('/api/feed?page=0&pageSize=500');

    expect(response.status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(100);
    expect(body.hasMore).toBe(false);
    expect(body.items).toHaveLength(42);
  });

  test('normalizes fractional pagination values to integers', async () => {
    const { response, body } = await json<{
      items: Array<{ id: number }>;
      page: number;
      pageSize: number;
    }>('/api/feed?page=1.5&pageSize=2.5');

    expect(response.status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(2);
    expect(body.items).toHaveLength(2);
  });

  test('defaults an empty page query to the first page', async () => {
    const { response, body } = await json<{
      items: Array<{ id: number }>;
      page: number;
      pageSize: number;
    }>('/api/feed?page=');

    expect(response.status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(body.items).toHaveLength(10);
  });

  test('falls back to defaults for non-numeric pagination values', async () => {
    const { response, body } = await json<{
      items: Array<{ id: number }>;
      page: number;
      pageSize: number;
    }>('/api/feed?page=abc&pageSize=nope');

    expect(response.status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(body.items).toHaveLength(10);
  });

  test('returns later pages and reports when more feed items remain', async () => {
    const { response, body } = await json<{
      items: Array<{ id: number }>;
      page: number;
      pageSize: number;
      hasMore: boolean;
    }>('/api/feed?page=3&pageSize=8');

    expect(response.status).toBe(200);
    expect(body.page).toBe(3);
    expect(body.pageSize).toBe(8);
    expect(body.hasMore).toBe(true);
    expect(body.items[0]).toMatchObject({ id: 17 });
  });
});

describe('error handling', () => {
  test('returns a generic JSON error for non-syntax errors', async () => {
    const failingApp = express();
    failingApp.get('/boom', (_req, _res, next) => {
      next(new Error('boom'));
    });
    failingApp.use(apiErrorHandler);

    const failingServer = http.createServer(failingApp);
    const failingBaseUrl = await listenOnRandomPort(
      failingServer,
      'Unable to resolve failing test server address',
    );

    try {
      const response = await fetch(`${failingBaseUrl}/boom`);
      const body = (await response.json()) as { error: string };

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: 'Internal server error' });
    } finally {
      await closeServer(failingServer);
    }
  });

  test('does not write a second response when headers were already sent', async () => {
    const failingApp = express();
    failingApp.get('/partial-boom', (_req, res, next) => {
      res.write('partial');
      next(new Error('boom'));
    });
    failingApp.use(apiErrorHandler);
    failingApp.use(
      (
        error: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        expect(error).toBeInstanceOf(Error);
        if (!res.writableEnded) {
          res.end();
        }
      },
    );

    const failingServer = http.createServer(failingApp);
    const failingBaseUrl = await listenOnRandomPort(
      failingServer,
      'Unable to resolve headers-sent test server address',
    );

    try {
      const response = await fetch(`${failingBaseUrl}/partial-boom`);
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBeNull();
      expect(body).toBe('partial');
    } finally {
      await closeServer(failingServer);
    }
  });
});
