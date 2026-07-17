import { Router, type Request } from 'express';

interface RegisteredPasskey {
  credentialId: string;
  publicKey?: string;
  userId: number;
}

// Extend express-session with our custom session fields
declare module 'express-session' {
  interface SessionData {
    passkeyUserId?: number;
    registeredPasskeys?: RegisteredPasskey[];
  }
}

interface PasskeyUser {
  id: number;
  username: string;
  displayName: string;
}

// Single hardcoded demo user — this is an intentional learning fixture, not real auth.
const USER: PasskeyUser = { id: 1, username: 'alice', displayName: 'Alice Chen' };

function findSessionUser(req: Request): PasskeyUser | undefined {
  return req.session.passkeyUserId === USER.id ? USER : undefined;
}

function registeredPasskeys(req: Request): RegisteredPasskey[] {
  return req.session.registeredPasskeys ?? [];
}

function randomChallenge(): string {
  const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  return Buffer.from(bytes).toString('base64url');
}

const router = Router();

router.get('/register/challenge', (req, res) => {
  res.json({
    challenge: randomChallenge(),
    rpId: req.hostname,
    rpName: 'Stagecraft Labs',
    userId: Buffer.from(String(USER.id)).toString('base64url'),
    userName: USER.username,
    userDisplayName: USER.displayName,
  });
});

router.post('/register', (req, res) => {
  const { credentialId, publicKey } = req.body as { credentialId: unknown; publicKey?: unknown };
  if (typeof credentialId !== 'string' || credentialId.length === 0) {
    res.status(400).json({ error: 'credentialId is required' });
    return;
  }
  if (publicKey !== undefined && typeof publicKey !== 'string') {
    res.status(400).json({ error: 'publicKey must be a string' });
    return;
  }

  // Store the credential record in the same session that later requests the
  // assertion options. This makes the registration-to-login handoff explicit
  // instead of relying on a route-local module variable.
  const credentials = registeredPasskeys(req);
  const existingCredential = credentials.find(({ credentialId: id }) => id === credentialId);
  if (existingCredential) {
    if (publicKey !== undefined) existingCredential.publicKey = publicKey;
  } else {
    credentials.push({
      credentialId,
      userId: USER.id,
      ...(publicKey !== undefined ? { publicKey } : {}),
    });
  }
  req.session.registeredPasskeys = credentials;

  res.status(201).json({ ok: true });
});

router.get('/login/challenge', (req, res) => {
  res.json({
    challenge: randomChallenge(),
    // credentialId comes from credential.rawId and is already base64url
    // encoded by the client, as required by the WebAuthn browser API.
    allowCredentialIds: registeredPasskeys(req).map(({ credentialId }) => credentialId),
  });
});

router.post('/login', (req, res) => {
  const { credentialId } = req.body as { credentialId: unknown };
  const registeredPasskey =
    typeof credentialId === 'string'
      ? registeredPasskeys(req).find(({ credentialId: id }) => id === credentialId)
      : undefined;
  if (!registeredPasskey) {
    res.status(401).json({ error: 'No matching passkey found' });
    return;
  }
  req.session.passkeyUserId = registeredPasskey.userId;
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
