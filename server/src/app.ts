import path from 'node:path';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import session from 'express-session';
import cors from 'cors';
import swaggerUi, { type JsonObject } from 'swagger-ui-express';
import notesRouter from './routes/notes';
import authRouter from './routes/auth';
import tasksRouter from './routes/tasks';
import productsRouter from './routes/products';
import swItemsRouter from './routes/swItems';
import { openApiDocument } from './openapi';

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

if (isProduction && clientOrigin.includes('localhost')) {
  throw new Error('CLIENT_ORIGIN must not be localhost in production');
}

if (isProduction) {
  app.set('trust proxy', 1);
}

function applySecurityHeaders(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const contentSecurityPolicy = req.path.startsWith('/api-docs')
    ? [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
      ]
    : [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self' ws: wss:",
      ];

  res.setHeader('Content-Security-Policy', contentSecurityPolicy.join('; '));
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

app.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument as JsonObject, {
    customSiteTitle: 'Stagecraft API Docs',
    explorer: true,
  }),
);

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

    if (error instanceof SyntaxError && (error as { status?: number }).status === 400) {
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

  // Vite outputs content-hashed filenames under /assets/ — safe to cache forever.
  // express-static-gzip serves the pre-compressed .br/.gz siblings written by vite-plugin-compression2.
  app.use(
    '/assets',
    expressStaticGzip(path.join(clientDist, 'assets'), {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],
      serveStatic: { maxAge: '1y', immutable: true },
    }),
  );

  // Everything else (index.html, favicon, manifest) must not be cached so
  // new deployments are picked up immediately.
  app.use(
    express.static(clientDist, {
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  app.use((req, res, next) => {
    if (
      !['GET', 'HEAD'].includes(req.method) ||
      req.path === '/api' ||
      req.path.startsWith('/api/')
    ) {
      next();
      return;
    }

    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

export default app;
