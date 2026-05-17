// Service worker for the service-workers lab.
// Intercepts /api/sw-items and returns stale cached data to demonstrate
// that page.route() alone won't intercept requests when a SW is active.

const CACHE_NAME = 'sw-lab-v1';
const INTERCEPTED_URL = '/api/sw-items';

const STALE_RESPONSE = JSON.stringify([
    { id: 1, name: 'Cached Widget (stale)', source: 'cache' },
    { id: 2, name: 'Cached Gadget (stale)', source: 'cache' },
    { id: 3, name: 'Cached Doohickey (stale)', source: 'cache' },
]);

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.pathname === INTERCEPTED_URL) {
        // Return stale cached data — bypasses the network entirely
        event.respondWith(
            new Response(STALE_RESPONSE, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Served-By': 'service-worker',
                },
            }),
        );
    }
    // All other requests pass through normally
});
