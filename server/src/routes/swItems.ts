import { Router } from 'express';

// Items returned by the real server (fresh data)
const REAL_ITEMS = [
    { id: 1, name: 'Fresh Widget', source: 'network' as const },
    { id: 2, name: 'Fresh Gadget', source: 'network' as const },
    { id: 3, name: 'Fresh Doohickey', source: 'network' as const },
];

const router = Router();

// GET /api/sw-items — returns fresh data from the server.
// When a service worker is active, the SW intercepts this and returns stale cache instead.
// Use serviceWorkers: 'block' in your Playwright context to bypass the SW.
router.get('/', (_req, res) => {
    res.json(REAL_ITEMS);
});

export default router;
