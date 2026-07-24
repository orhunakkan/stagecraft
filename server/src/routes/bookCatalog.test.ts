import http from 'node:http';
import express from 'express';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { logger } from '../lib/logger';
import bookCatalogRouter from './bookCatalog';

const listAuthors = vi.fn();
const listBooks = vi.fn();
const listCatalog = vi.fn();
const reseed = vi.fn();

vi.mock('../lib/bookCatalogStore', () => ({
  getBookCatalogStore: () => ({ listAuthors, listBooks, listCatalog, reseed }),
}));

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.use('/api/book-catalog', bookCatalogRouter);
  server = http.createServer(app);
  baseUrl = await new Promise<string>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Unable to resolve test server address');
      }
      resolve(`http://127.0.0.1:${address.port}`);
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

afterEach(() => {
  vi.restoreAllMocks();
  listAuthors.mockReset();
  listBooks.mockReset();
  listCatalog.mockReset();
});

const emptyPage = { items: [], page: 1, pageSize: 10, total: 0, hasMore: false, sql: 'SELECT 1' };

const storeByEndpoint = { authors: listAuthors, books: listBooks, catalog: listCatalog };

describe('book catalog request telemetry', () => {
  test.each(['authors', 'books', 'catalog'] as const)(
    'records one structured timing record with endpoint, outcome, and elapsed ms for a successful %s request',
    async (endpoint) => {
      storeByEndpoint[endpoint].mockResolvedValue(emptyPage);
      const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never);

      const response = await fetch(`${baseUrl}/api/book-catalog/${endpoint}`);

      expect(response.status).toBe(200);
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint,
          outcome: 'success',
          elapsedMs: expect.any(Number),
        }),
        'Book catalog request completed',
      );
    },
  );

  test.each(['authors', 'books', 'catalog'] as const)(
    'returns a safe generic 503 and a failure timing record when the %s store throws',
    async (endpoint) => {
      storeByEndpoint[endpoint].mockRejectedValue(
        new Error('ETIMEOUT: connection lost to sql-server-01.database.windows.net'),
      );
      const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never);

      const response = await fetch(`${baseUrl}/api/book-catalog/${endpoint}`);
      const body = (await response.json()) as { error: string };

      expect(response.status).toBe(503);
      expect(body).toEqual({ error: 'Book catalog store unavailable' });
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint,
          outcome: 'error',
          elapsedMs: expect.any(Number),
        }),
        'Book catalog request completed',
      );
    },
  );
});
