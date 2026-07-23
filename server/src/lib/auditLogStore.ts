// Deliberate, scoped deviation from repo convention: every other lab is one
// in-memory array with a single implementation. This lab needs a real
// Azure SQL-backed store *and* an in-memory fallback so CI stays hermetic
// without cloud credentials or a DB service container — see SPEC.md's
// Resolved Decisions table (#5) for the rationale. Do not treat this as a
// pattern to copy for future labs without the same tradeoff.
import sql from 'mssql';
import { ensureAuditLogSchema, getPool } from './db';

export type AuditEventType = 'login' | 'logout' | 'failed_login';

export interface AuditLogEntry {
  id: number;
  username: string;
  eventType: AuditEventType;
  createdAt: string;
}

export type AuditLogSort = 'createdAt:asc' | 'createdAt:desc';

export interface AuditLogQuery {
  page: number;
  pageSize: number;
  username?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  sort: AuditLogSort;
}

export interface AuditLogQueryResult {
  items: AuditLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface AuditLogStore {
  record(username: string, eventType: AuditEventType): Promise<void>;
  query(params: AuditLogQuery): Promise<AuditLogQueryResult>;
  reseed(): Promise<{ ok: true; seeded: number }>;
}

interface SeedRow {
  username: string;
  eventType: AuditEventType;
  createdAt: string;
}

const SEED_USERNAMES = ['alice', 'bob', 'carol', 'dave', 'erin'];
// Cycle length (4) is deliberately coprime with SEED_USERNAMES.length (5) so
// every username gets an even mix of event types instead of always pairing
// with the same one.
const SEED_EVENT_CYCLE: AuditEventType[] = ['login', 'logout', 'login', 'failed_login'];
const SEED_ROW_COUNT = 120;
const SEED_START_MS = Date.UTC(2026, 0, 1);
const SEED_STEP_MS = 24 * 60 * 60 * 1000;

/** Deterministic (no randomness) so both store implementations seed identical data. */
export function buildSeedRows(): SeedRow[] {
  const rows: SeedRow[] = [];
  for (let i = 0; i < SEED_ROW_COUNT; i += 1) {
    rows.push({
      username: SEED_USERNAMES[i % SEED_USERNAMES.length]!,
      eventType: SEED_EVENT_CYCLE[i % SEED_EVENT_CYCLE.length]!,
      createdAt: new Date(SEED_START_MS + i * SEED_STEP_MS).toISOString(),
    });
  }
  return rows;
}

function matchesUsername(username: string, filter: string | undefined): boolean {
  if (!filter) {
    return true;
  }
  return username.toLowerCase().includes(filter.toLowerCase());
}

function matchesDateRange(
  createdAt: string,
  from: string | undefined,
  to: string | undefined,
): boolean {
  const time = Date.parse(createdAt);
  if (from && time < Date.parse(from)) {
    return false;
  }
  if (to && time > Date.parse(to)) {
    return false;
  }
  return true;
}

export class InMemoryAuditLogStore implements AuditLogStore {
  private rows: AuditLogEntry[] = [];
  private nextId = 1;

  constructor() {
    this.rows = buildSeedRows().map((row) => ({ id: this.nextId++, ...row }));
  }

  record(username: string, eventType: AuditEventType): Promise<void> {
    this.rows.push({
      id: this.nextId++,
      username: username.slice(0, 64),
      eventType,
      createdAt: new Date().toISOString(),
    });
    return Promise.resolve();
  }

  query(params: AuditLogQuery): Promise<AuditLogQueryResult> {
    const filtered = this.rows
      .filter(
        (row) =>
          matchesUsername(row.username, params.username) &&
          matchesDateRange(row.createdAt, params.from, params.to),
      )
      .sort((a, b) => {
        const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt);
        return params.sort === 'createdAt:asc' ? diff : -diff;
      });

    const total = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    const items = filtered.slice(start, start + params.pageSize);
    const hasMore = start + params.pageSize < total;

    return Promise.resolve({ items, page: params.page, pageSize: params.pageSize, total, hasMore });
  }

  reseed(): Promise<{ ok: true; seeded: number }> {
    this.nextId = 1;
    this.rows = buildSeedRows().map((row) => ({ id: this.nextId++, ...row }));
    return Promise.resolve({ ok: true, seeded: this.rows.length });
  }
}

// Only exercised against a live Azure SQL connection — covered by the
// guarded, skip-by-default auditLogStore.azureSql.test.ts, not the default
// in-memory-store test run. See SPEC.md Resolved Decisions #5.
/* v8 ignore start */
export class SqlAuditLogStore implements AuditLogStore {
  private async ready(): Promise<sql.ConnectionPool> {
    const pool = await getPool();
    await ensureAuditLogSchema(pool);
    return pool;
  }

  async record(username: string, eventType: AuditEventType): Promise<void> {
    const pool = await this.ready();
    const request = pool.request();
    request.input('username', sql.NVarChar(64), username.slice(0, 64));
    request.input('eventType', sql.NVarChar(20), eventType);
    request.input('createdAt', sql.DateTime2, new Date());
    await request.query(
      'INSERT INTO AuditLog (Username, EventType, CreatedAt) VALUES (@username, @eventType, @createdAt)',
    );
  }

  async query(params: AuditLogQuery): Promise<AuditLogQueryResult> {
    const pool = await this.ready();

    const conditions: string[] = [];
    if (params.username) {
      conditions.push('Username LIKE @username');
    }
    if (params.from) {
      conditions.push('CreatedAt >= @from');
    }
    if (params.to) {
      conditions.push('CreatedAt <= @to');
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause =
      params.sort === 'createdAt:asc' ? 'ORDER BY CreatedAt ASC' : 'ORDER BY CreatedAt DESC';

    const bindFilters = (request: sql.Request): void => {
      if (params.username) {
        request.input('username', sql.NVarChar(64), `%${params.username}%`);
      }
      if (params.from) {
        request.input('from', sql.DateTime2, new Date(params.from));
      }
      if (params.to) {
        request.input('to', sql.DateTime2, new Date(params.to));
      }
    };

    const countRequest = pool.request();
    bindFilters(countRequest);
    const countResult = await countRequest.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM AuditLog ${whereClause}`,
    );
    const total = Number(countResult.recordset[0]?.total ?? 0);

    const offset = (params.page - 1) * params.pageSize;
    const itemsRequest = pool.request();
    bindFilters(itemsRequest);
    itemsRequest.input('offset', sql.Int, offset);
    itemsRequest.input('pageSize', sql.Int, params.pageSize);
    const itemsResult = await itemsRequest.query<{
      Id: number;
      Username: string;
      EventType: AuditEventType;
      CreatedAt: Date;
    }>(
      `SELECT Id, Username, EventType, CreatedAt FROM AuditLog ${whereClause} ${orderClause} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
    );

    const items: AuditLogEntry[] = itemsResult.recordset.map((row) => ({
      id: row.Id,
      username: row.Username,
      eventType: row.EventType,
      createdAt: row.CreatedAt.toISOString(),
    }));

    return {
      items,
      page: params.page,
      pageSize: params.pageSize,
      total,
      hasMore: offset + params.pageSize < total,
    };
  }

  async reseed(): Promise<{ ok: true; seeded: number }> {
    const pool = await this.ready();
    await pool.request().query('TRUNCATE TABLE AuditLog');

    const rows = buildSeedRows();
    const table = new sql.Table('AuditLog');
    table.create = false;
    table.columns.add('Username', sql.NVarChar(64), { nullable: false });
    table.columns.add('EventType', sql.NVarChar(20), { nullable: false });
    table.columns.add('CreatedAt', sql.DateTime2, { nullable: false });
    for (const row of rows) {
      table.rows.add(row.username, row.eventType, new Date(row.createdAt));
    }

    await pool.request().bulk(table);

    return { ok: true, seeded: rows.length };
  }
}
/* v8 ignore stop */

let storeInstance: AuditLogStore | undefined;

export function getAuditLogStore(): AuditLogStore {
  if (!storeInstance) {
    // The SQL branch is only reachable with a real Azure SQL connection string —
    // not exercised by the default in-memory-store test run.
    /* v8 ignore next 3 */
    storeInstance = process.env.AZURE_SQL_CONNECTION_STRING
      ? new SqlAuditLogStore()
      : new InMemoryAuditLogStore();
  }
  return storeInstance;
}
