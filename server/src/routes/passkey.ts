import { Router, type Request } from 'express';

// Extend express-session with our custom session fields
declare module 'express-session' {
  interface SessionData {
    passkeyUserId?: number;
  }
}

interface PasskeyUser {
  id: number;
  username: string;
  displayName: string;
}

// Single hardcoded demo user — this is an intentional learning fixture, not real auth.
const USER: PasskeyUser = { id: 1, username: 'alice', displayName: 'Alice Chen' };

// In-memory store of registered credential IDs for the demo user. The server
// trusts whichever credential ID the browser hands back from
// navigator.credentials.get() without verifying a signature — real WebAuthn
// signature verification is out of scope here because the CDP virtual
// authenticator already proves the browser drove a genuine credential
// ceremony, which is what this lab is teaching.
const registeredCredentialIds = new Set<string>();

function findSessionUser(req: Request): PasskeyUser | undefined {
  return req.session.passkeyUserId === USER.id ? USER : undefined;
}

function randomChallenge(): string {
  const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  return Buffer.from(bytes).toString('base64url');
}

const router = Router();

router.get('/register/challenge', (_req, res) => {
  res.json({
    challenge: randomChallenge(),
    rpId: 'localhost',
    rpName: 'Stagecraft Labs',
    userId: Buffer.from(String(USER.id)).toString('base64url'),
    userName: USER.username,
    userDisplayName: USER.displayName,
  });
});

router.post('/register', (req, res) => {
  const { credentialId } = req.body as { credentialId: unknown };
  if (typeof credentialId !== 'string' || credentialId.length === 0) {
    res.status(400).json({ error: 'credentialId is required' });
    return;
  }
  registeredCredentialIds.add(credentialId);
  res.status(201).json({ ok: true });
});

router.get('/login/challenge', (_req, res) => {
  res.json({
    challenge: randomChallenge(),
    allowCredentialIds: Array.from(registeredCredentialIds),
  });
});

router.post('/login', (req, res) => {
  const { credentialId } = req.body as { credentialId: unknown };
  if (typeof credentialId !== 'string' || !registeredCredentialIds.has(credentialId)) {
    res.status(401).json({ error: 'No matching passkey found' });
    return;
  }
  req.session.passkeyUserId = USER.id;
  res.json(USER);
});

router.get('/me', (req, res) => {
  const user = findSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json(user);
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(204).send();
  });
});

export default router;
