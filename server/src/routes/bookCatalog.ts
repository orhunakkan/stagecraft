import { performance } from 'node:perf_hooks';
import { Router } from 'express';
import { getBookCatalogStore } from '../lib/bookCatalogStore';
import { logger } from '../lib/logger';
import {
  AuthorQuerySchema,
  BookQuerySchema,
  CatalogQuerySchema,
  firstIssueMessage,
} from '../lib/schemas';

const router = Router();

type ReadEndpoint = 'authors' | 'books' | 'catalog';

/** One structured record per read request — duration and outcome only, no query params or errors. */
function logRequestTiming(
  endpoint: ReadEndpoint,
  startTime: number,
  outcome: 'success' | 'error',
): void {
  logger.info(
    { endpoint, outcome, elapsedMs: Math.round(performance.now() - startTime) },
    'Book catalog request completed',
  );
}

// Fully public — no session/auth dependency on any other lab.

router.get('/authors', async (req, res) => {
  const parsed = AuthorQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssueMessage(parsed.error, 'Invalid query parameters') });
    return;
  }

  const startTime = performance.now();
  try {
    const result = await getBookCatalogStore().listAuthors(parsed.data);
    logRequestTiming('authors', startTime, 'success');
    res.json(result);
  } catch {
    // Only reachable if the store itself throws (e.g. Azure SQL unreachable) —
    // not exercised by the default in-memory store used in tests/CI.
    logRequestTiming('authors', startTime, 'error');
    res.status(503).json({ error: 'Book catalog store unavailable' });
  }
});

router.get('/books', async (req, res) => {
  const parsed = BookQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssueMessage(parsed.error, 'Invalid query parameters') });
    return;
  }

  const startTime = performance.now();
  try {
    const result = await getBookCatalogStore().listBooks(parsed.data);
    logRequestTiming('books', startTime, 'success');
    res.json(result);
  } catch {
    logRequestTiming('books', startTime, 'error');
    res.status(503).json({ error: 'Book catalog store unavailable' });
  }
});

router.get('/catalog', async (req, res) => {
  const parsed = CatalogQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssueMessage(parsed.error, 'Invalid query parameters') });
    return;
  }

  const startTime = performance.now();
  try {
    const result = await getBookCatalogStore().listCatalog(parsed.data);
    logRequestTiming('catalog', startTime, 'success');
    res.json(result);
  } catch {
    logRequestTiming('catalog', startTime, 'error');
    res.status(503).json({ error: 'Book catalog store unavailable' });
  }
});

router.post('/reseed', async (_req, res) => {
  try {
    const result = await getBookCatalogStore().reseed();
    res.json(result);
  } catch {
    /* v8 ignore next */
    res.status(503).json({ error: 'Book catalog store unavailable' });
  }
});

export default router;
