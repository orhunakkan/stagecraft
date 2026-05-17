import path from 'node:path';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import notesRouter from './routes/notes';
import authRouter from './routes/auth';
import tasksRouter from './routes/tasks';
import productsRouter from './routes/products';
import swItemsRouter from './routes/swItems';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

function applySecurityHeaders(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self' ws: wss:",
    ].join('; '),
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'DENY');

  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }

  next();
}

app.disable('x-powered-by');
app.use(applySecurityHeaders);

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: '16kb', strict: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && isProduction) {
  throw new Error('SESSION_SECRET environment variable is required in production');
}

app.use(
  session({
    secret: sessionSecret ?? 'dev-secret-do-not-use-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 60 * 60 * 1000,
    },
  }),
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/products', productsRouter);
app.use('/api/sw-items', swItemsRouter);

app.use(
  (error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    if (
      error instanceof SyntaxError &&
      'status' in error &&
      (error as { status?: number }).status === 400
    ) {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  },
);

// In production Express serves the Vite-built SPA and acts as the only process.
// Static assets first, then index.html fallback for client-side routing.
if (isProduction) {
  // __dirname is server/dist at runtime; client/dist sits two levels up from there
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'), { dotfiles: 'allow' });
  });
}

export default app;
