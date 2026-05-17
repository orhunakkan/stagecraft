import { Router } from 'express';

// Extend express-session with our custom session fields
declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}

interface User {
    id: number;
    username: string;
    password: string;
    displayName: string;
}

// Hardcoded test users — this is an intentional learning fixture, not real auth
const USERS: User[] = [
    { id: 1, username: 'alice', password: 'password123', displayName: 'Alice Chen' },
    { id: 2, username: 'bob', password: 'letmein', displayName: 'Robert Smith' },
];

const router = Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body as { username: unknown; password: unknown };
    if (typeof username !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: 'username and password are required' });
        return;
    }
    const user = USERS.find((u) => u.username === username && u.password === password);
    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username, displayName: user.displayName });
});

router.get('/me', (req, res) => {
    const user = USERS.find((u) => u.id === req.session.userId);
    if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    res.json({ id: user.id, username: user.username, displayName: user.displayName });
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(204).send();
    });
});

export default router;
