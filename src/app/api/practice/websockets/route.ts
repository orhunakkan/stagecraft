// This is a placeholder API route.
// The WebSocket connection will be intercepted by Playwright,
// so this code will not be executed in the test environment.
// It exists to provide a valid URL for the browser to connect to.

export async function GET() {
  return new Response('This is an HTTP endpoint, not a WebSocket one.', {
    status: 426, // 426 Upgrade Required
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'WebSocket',
    },
  });
}
