import sql from 'mssql';
import { logger } from './logger';

// Azure SQL free-tier serverless databases auto-pause when idle, so the first
// connection after a pause can take longer than mssql's 15s defaults.
const POOL_TIMEOUT_MS = 60_000;
const CONNECT_RETRY_DELAYS_MS = [2_000, 5_000, 10_000];

let poolPromise: Promise<sql.ConnectionPool> | undefined;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectWithRetry(connectionString: string): Promise<sql.ConnectionPool> {
  let lastError: unknown;

  for (let attempt = 0; attempt < CONNECT_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const config = sql.ConnectionPool.parseConnectionString(connectionString);
      config.connectionTimeout = POOL_TIMEOUT_MS;
      config.requestTimeout = POOL_TIMEOUT_MS;
      const pool = new sql.ConnectionPool(config);
      return await pool.connect();
    } catch (error) {
      lastError = error;
      logger.error(
        { err: error, attempt: attempt + 1 },
        'Azure SQL connection attempt failed, retrying',
      );
      await delay(CONNECT_RETRY_DELAYS_MS[attempt] ?? 10_000);
    }
  }

  throw lastError;
}

/** Lazily connects (with retry) and memoizes a single pooled connection. */
export function getPool(): Promise<sql.ConnectionPool> {
  const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('AZURE_SQL_CONNECTION_STRING is not configured');
  }

  if (!poolPromise) {
    poolPromise = connectWithRetry(connectionString).catch((error: unknown) => {
      poolPromise = undefined;
      throw error;
    });
  }

  return poolPromise;
}

/** Idempotent — safe to call before every operation, not just at boot. */
export async function ensureAuditLogSchema(pool: sql.ConnectionPool): Promise<void> {
  await pool.request().batch(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AuditLog')
    BEGIN
      CREATE TABLE AuditLog (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(64) NOT NULL,
        EventType NVARCHAR(20) NOT NULL CHECK (EventType IN ('login', 'logout', 'failed_login')),
        CreatedAt DATETIME2 NOT NULL
      );
      CREATE INDEX IX_AuditLog_CreatedAt ON AuditLog (CreatedAt DESC);
      CREATE INDEX IX_AuditLog_Username ON AuditLog (Username);
    END
  `);
}

/**
 * Fire-and-forget startup hook, called from index.ts. Never throws: the other
 * 35 labs must keep working even if Azure SQL is unreachable at boot. Each
 * SqlAuditLogStore operation also lazily re-runs ensureAuditLogSchema, so a
 * failure here just delays readiness rather than requiring a restart.
 */
export async function initAuditLogStore(): Promise<void> {
  if (!process.env.AZURE_SQL_CONNECTION_STRING) {
    return;
  }

  try {
    const pool = await getPool();
    await ensureAuditLogSchema(pool);
    logger.info('Azure SQL audit log schema is ready');
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize Azure SQL audit log store at startup');
  }
}
