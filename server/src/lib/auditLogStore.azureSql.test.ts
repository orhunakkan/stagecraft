// Exercises SqlAuditLogStore against a real Azure SQL (or any SQL Server)
// instance. Inert everywhere by default, including CI: it only runs when a
// developer sets AZURE_SQL_CONNECTION_STRING locally. See SPEC.md's Resolved
// Decisions table (#5) for why the default test run never touches a live DB.
import { afterAll, describe, expect, test } from 'vitest';
import { SqlAuditLogStore } from './auditLogStore';
import { getPool } from './db';

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

describe.skipIf(!connectionString)('SqlAuditLogStore (live Azure SQL)', () => {
  const store = new SqlAuditLogStore();

  afterAll(async () => {
    const pool = await getPool();
    await pool.close();
  });

  test('creates the schema and reseeds deterministic fixture data', async () => {
    const result = await store.reseed();

    expect(result).toEqual({ ok: true, seeded: 120 });
  });

  test('records and queries a real login event', async () => {
    await store.reseed();
    await store.record('alice', 'login');

    const result = await store.query({
      page: 1,
      pageSize: 10,
      username: 'alice',
      sort: 'createdAt:desc',
    });

    expect(result.items[0]).toMatchObject({ username: 'alice', eventType: 'login' });
  });

  test('paginates with real OFFSET/FETCH semantics', async () => {
    await store.reseed();

    const page1 = await store.query({ page: 1, pageSize: 20, sort: 'createdAt:asc' });
    const page2 = await store.query({ page: 2, pageSize: 20, sort: 'createdAt:asc' });

    expect(page1.total).toBe(120);
    expect(page1.items).toHaveLength(20);
    expect(page2.items).toHaveLength(20);
    expect(page1.items[0]?.id).not.toBe(page2.items[0]?.id);
  });

  test('treats SQL-injection-style search input as a literal, harmless substring', async () => {
    await store.reseed();

    const result = await store.query({
      page: 1,
      pageSize: 100,
      username: "'; DROP TABLE AuditLog; --",
      sort: 'createdAt:desc',
    });

    expect(result.total).toBe(0);

    const pool = await getPool();
    const tableStillExists = await pool
      .request()
      .query<{ total: number }>("SELECT COUNT(*) AS total FROM sys.tables WHERE name = 'AuditLog'");
    expect(tableStillExists.recordset[0]?.total).toBe(1);

    const followUp = await store.query({ page: 1, pageSize: 10, sort: 'createdAt:desc' });
    expect(followUp.total).toBe(120);
  });
});
