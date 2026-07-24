// Exercises SqlBookCatalogStore against a real Azure SQL (or any SQL Server)
// instance. Inert everywhere by default, including CI: it only runs when a
// developer sets AZURE_SQL_CONNECTION_STRING locally. See SPEC.md's Resolved
// Decisions table (#5) for why the default test run never touches a live DB.
import { afterAll, describe, expect, test } from 'vitest';
import { SqlBookCatalogStore } from './bookCatalogStore';
import { getPool } from './db';

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

describe.skipIf(!connectionString)('SqlBookCatalogStore (live Azure SQL)', () => {
  const store = new SqlBookCatalogStore();

  afterAll(async () => {
    const pool = await getPool();
    await pool.close();
  });

  test('creates the schema and reseeds deterministic fixture data', async () => {
    const result = await store.reseed();

    expect(result).toEqual({ ok: true, seededAuthors: 12, seededBooks: 30 });
  });

  test('lists authors with real OFFSET/FETCH pagination', async () => {
    await store.reseed();

    const page1 = await store.listAuthors({ page: 1, pageSize: 5, sort: 'name', direction: 'asc' });
    const page2 = await store.listAuthors({ page: 2, pageSize: 5, sort: 'name', direction: 'asc' });

    expect(page1.total).toBe(12);
    expect(page1.items).toHaveLength(5);
    expect(page2.items[0]?.id).not.toBe(page1.items[0]?.id);
  });

  test('filters books by genre', async () => {
    await store.reseed();

    const result = await store.listBooks({
      page: 1,
      pageSize: 100,
      genre: 'Sci-Fi',
      sort: 'title',
      direction: 'asc',
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((item) => item.genre === 'Sci-Fi')).toBe(true);
  });

  test('joins books with their author and filters on the joined country', async () => {
    await store.reseed();

    const result = await store.listCatalog({
      page: 1,
      pageSize: 100,
      country: 'Japan',
      sort: 'title',
      direction: 'asc',
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((item) => item.authorCountry === 'Japan')).toBe(true);
  });

  test('treats SQL-injection-style search input as a literal, harmless substring', async () => {
    await store.reseed();

    const result = await store.listBooks({
      page: 1,
      pageSize: 100,
      search: "'; DROP TABLE Books; --",
      sort: 'title',
      direction: 'asc',
    });

    expect(result.total).toBe(0);

    const pool = await getPool();
    const tableStillExists = await pool
      .request()
      .query<{ total: number }>("SELECT COUNT(*) AS total FROM sys.tables WHERE name = 'Books'");
    expect(tableStillExists.recordset[0]?.total).toBe(1);

    const followUp = await store.listBooks({
      page: 1,
      pageSize: 100,
      sort: 'title',
      direction: 'asc',
    });
    expect(followUp.total).toBe(30);
  });
});
