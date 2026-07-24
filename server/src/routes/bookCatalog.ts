import { Router } from 'express';
import { getBookCatalogStore } from '../lib/bookCatalogStore';
import {
  AuthorQuerySchema,
  BookQuerySchema,
  CatalogQuerySchema,
  firstIssueMessage,
} from '../lib/schemas';

const router = Router();

// Fully public — no session/auth dependency on any other lab.

router.get('/authors', async (req, res) => {
  const parsed = AuthorQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssueMessage(parsed.error, 'Invalid query parameters') });
    return;
  }

  try {
    const result = await getBookCatalogStore().listAuthors(parsed.data);
    res.json(result);
  } catch {
    // Only reachable if the store itself throws (e.g. Azure SQL unreachable) —
    // not exercised by the default in-memory store used in tests/CI.
    /* v8 ignore next */
    res.status(503).json({ error: 'Book catalog store unavailable' });
  }
});

router.get('/books', async (req, res) => {
  const parsed = BookQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssueMessage(parsed.error, 'Invalid query parameters') });
    return;
  }

  try {
    const result = await getBookCatalogStore().listBooks(parsed.data);
    res.json(result);
  } catch {
    /* v8 ignore next */
    res.status(503).json({ error: 'Book catalog store unavailable' });
  }
});

router.get('/catalog', async (req, res) => {
  const parsed = CatalogQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssueMessage(parsed.error, 'Invalid query parameters') });
    return;
  }

  try {
    const result = await getBookCatalogStore().listCatalog(parsed.data);
    res.json(result);
  } catch {
    /* v8 ignore next */
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
