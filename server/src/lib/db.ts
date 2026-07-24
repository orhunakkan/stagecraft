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

/**
 * Idempotent — safe to call before every operation, not just at boot. Books
 * references Authors via a FK, so Authors must be created first.
 */
export async function ensureBookCatalogSchema(pool: sql.ConnectionPool): Promise<void> {
  await pool.request().batch(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Authors')
    BEGIN
      CREATE TABLE Authors (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Country NVARCHAR(60) NOT NULL,
        BirthYear INT NOT NULL
      );
      CREATE INDEX IX_Authors_Country ON Authors (Country);
    END
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Books')
    BEGIN
      CREATE TABLE Books (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(200) NOT NULL,
        AuthorId INT NOT NULL REFERENCES Authors(Id),
        Genre NVARCHAR(40) NOT NULL,
        PublishedYear INT NOT NULL,
        Rating DECIMAL(3,1) NOT NULL
      );
      CREATE INDEX IX_Books_AuthorId ON Books (AuthorId);
      CREATE INDEX IX_Books_Genre ON Books (Genre);
    END
  `);
}

/**
 * Fire-and-forget startup hook, called from index.ts. Never throws: the other
 * 35 labs must keep working even if Azure SQL is unreachable at boot. Each
 * SqlBookCatalogStore operation also lazily re-runs ensureBookCatalogSchema, so a
 * failure here just delays readiness rather than requiring a restart.
 */
export async function initBookCatalogStore(): Promise<void> {
  if (!process.env.AZURE_SQL_CONNECTION_STRING) {
    return;
  }

  try {
    const pool = await getPool();
    await ensureBookCatalogSchema(pool);
    logger.info('Azure SQL book catalog schema is ready');
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize Azure SQL book catalog store at startup');
  }
}
