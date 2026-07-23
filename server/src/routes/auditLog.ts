import { Router } from 'express';
import { findSessionUser } from './auth';
import { getAuditLogStore } from '../lib/auditLogStore';
import { AuditLogQuerySchema, firstIssueMessage } from '../lib/schemas';

const router = Router();

router.get('/', async (req, res) => {
  const user = findSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const parsed = AuditLogQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssueMessage(parsed.error, 'Invalid query parameters') });
    return;
  }

  try {
    const result = await getAuditLogStore().query(parsed.data);
    res.json(result);
  } catch {
    // Only reachable if the audit store itself throws (e.g. Azure SQL unreachable) —
    // not exercised by the default in-memory store used in tests/CI.
    /* v8 ignore next */
    res.status(503).json({ error: 'Audit log store unavailable' });
  }
});

router.post('/reseed', async (req, res) => {
  const user = findSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Reseeding is not allowed in production' });
    return;
  }

  try {
    const result = await getAuditLogStore().reseed();
    res.json(result);
  } catch {
    // Only reachable if the audit store itself throws (e.g. Azure SQL unreachable) —
    // not exercised by the default in-memory store used in tests/CI.
    /* v8 ignore next */
    res.status(503).json({ error: 'Audit log store unavailable' });
  }
});

export default router;
