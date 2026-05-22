import { Router } from 'express';

const router = Router();

interface SseEvent {
  type: 'info' | 'warn' | 'error';
  message: string;
}

const EVENTS: SseEvent[] = [
  { type: 'info', message: 'Build started' },
  { type: 'info', message: 'Installing dependencies…' },
  { type: 'info', message: 'Compiling TypeScript…' },
  { type: 'warn', message: 'Deprecated API usage detected' },
  { type: 'info', message: 'Running tests…' },
  { type: 'info', message: 'Tests passed (312/312)' },
  { type: 'info', message: 'Bundling assets…' },
  { type: 'warn', message: 'Bundle size exceeds recommended limit' },
  { type: 'info', message: 'Deploying to staging…' },
  { type: 'error', message: 'Health-check failed — retrying…' },
  { type: 'info', message: 'Deploy succeeded ✓' },
];

/**
 * GET /api/sse
 *
 * Streams build/deploy status events as Server-Sent Events.
 * Each event is emitted at a 600 ms interval. The stream ends
 * after all events are sent or the client disconnects.
 */
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let index = 0;

  const timer = setInterval(() => {
    if (index >= EVENTS.length) {
      res.write('event: done\ndata: {}\n\n');
      clearInterval(timer);
      res.end();
      return;
    }

    const event = EVENTS[index++]!;
    const payload = JSON.stringify({ type: event.type, message: event.message });
    res.write(`event: log\ndata: ${payload}\n\n`);
  }, 600);

  req.on('close', () => {
    clearInterval(timer);
  });
});

export default router;
