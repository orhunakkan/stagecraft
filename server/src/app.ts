import path from 'node:path';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import notesRouter from './routes/notes';
import authRouter from './routes/auth';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

app.use(
    cors({
        origin: clientOrigin,
        credentials: true,
    }),
);

app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is required in production');
}

app.use(
    session({
        secret: sessionSecret ?? 'dev-secret-do-not-use-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: false, // must be readable by Playwright for storage-state lab
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        },
    }),
);

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

// In production Express serves the Vite-built SPA and acts as the only process.
// Static assets first, then index.html fallback for client-side routing.
if (process.env.NODE_ENV === 'production') {
    // __dirname is server/dist at runtime; client/dist sits two levels up from there
    const clientDist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.use((_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

export default app;
