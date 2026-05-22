import http from 'node:http';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { WebSocket } from 'ws';
import { attachWebSocketServer, relayWebSocketMessage, sendTicker } from './websocket';

let server: http.Server;
let baseWsUrl: string;
let clients: WebSocket[] = [];

beforeAll(async () => {
  server = http.createServer();
  attachWebSocketServer(server);

  baseWsUrl = await listenOnRandomPort(server);
});

afterAll(async () => {
  await closeServer(server);
});

afterEach(() => {
  vi.useRealTimers();

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CONNECTING) {
      client.terminate();
    }
  }
  clients = [];
});

function connect(path: string): WebSocket {
  const ws = new WebSocket(`${baseWsUrl}${path}`);
  clients.push(ws);
  return ws;
}

async function listenOnRandomPort(serverToListen: http.Server) {
  return new Promise<string>((resolve) => {
    serverToListen.listen(0, '127.0.0.1', () => {
      const address = serverToListen.address();
      if (!address || typeof address === 'string') {
        throw new Error('Unable to resolve WebSocket test server address');
      }
      resolve(`ws://127.0.0.1:${address.port}`);
    });
  });
}

async function closeServer(serverToClose: http.Server) {
  await new Promise<void>((resolve, reject) => {
    serverToClose.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function waitForMessage(
  ws: WebSocket,
  predicate: (message: string) => boolean,
  timeoutMs = 2000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for WebSocket message'));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timeout);
      ws.off('message', onMessage);
      ws.off('error', onError);
    };
    const onMessage = (data: Buffer) => {
      const message = data.toString();
      if (predicate(message)) {
        cleanup();
        resolve(message);
      }
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    ws.on('message', onMessage);
    ws.once('error', onError);
  });
}

function waitForWelcomeMessage(ws: WebSocket) {
  return waitForMessage(ws, (message) => message === 'Welcome to the Stagecraft WebSocket server!');
}

function waitForConnectionClose(
  ws: WebSocket,
  failureMessage: string,
  unexpectedOpenMessage?: string,
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(failureMessage));
    }, 1000);
    const cleanup = () => {
      clearTimeout(timeout);
      ws.off('close', finish);
      ws.off('error', finish);
      ws.off('open', onOpen);
    };
    const finish = () => {
      cleanup();
      resolve();
    };
    const onOpen = () => {
      cleanup();
      reject(new Error(unexpectedOpenMessage));
    };

    ws.once('close', finish);
    ws.once('error', finish);
    if (unexpectedOpenMessage) {
      ws.once('open', onOpen);
    }
  });
}

describe('attachWebSocketServer', () => {
  test('accepts clients on /ws and sends a welcome message', async () => {
    const ws = connect('/ws');

    await expect(waitForWelcomeMessage(ws)).resolves.toBe(
      'Welcome to the Stagecraft WebSocket server!',
    );
  });

  test('echoes client messages back on the WebSocket connection', async () => {
    const ws = connect('/ws');
    await waitForWelcomeMessage(ws);

    ws.send('hello stagecraft');

    await expect(
      waitForMessage(ws, (message) => message === 'echo: hello stagecraft'),
    ).resolves.toBe('echo: hello stagecraft');
  });

  test('sends ticker messages while the socket stays open', async () => {
    vi.useFakeTimers();

    const ws = connect('/ws');
    await waitForWelcomeMessage(ws);

    const tickerMessage = waitForMessage(ws, (message) => message.startsWith('ticker: '), 4000);

    await vi.advanceTimersByTimeAsync(3100);

    await expect(tickerMessage).resolves.toMatch(/^ticker: /);
  });

  test('closes connections that send oversized messages', async () => {
    const ws = connect('/ws');
    await waitForWelcomeMessage(ws);

    ws.send('x'.repeat(16 * 1024 + 1));

    await expect(waitForConnectionClose(ws, 'connection stayed open')).resolves.toBeUndefined();
  });

  test('rejects upgrade requests outside the /ws path', async () => {
    const ws = connect('/not-ws');

    await expect(
      waitForConnectionClose(ws, 'connection was not rejected', 'unexpected connection opened'),
    ).resolves.toBeUndefined();
  });
});

describe('sendTicker', () => {
  test('sends a ticker payload for open sockets', () => {
    const send = vi.fn();

    sendTicker({ readyState: WebSocket.OPEN, send } as unknown as WebSocket);

    expect(send).toHaveBeenCalledWith(expect.stringMatching(/^ticker: /));
  });

  test('skips ticker payloads for sockets that are not open', () => {
    const send = vi.fn();

    sendTicker({ readyState: WebSocket.CLOSING, send } as unknown as WebSocket);

    expect(send).not.toHaveBeenCalled();
  });
});

describe('relayWebSocketMessage', () => {
  test('echoes messages that are within the payload limit', () => {
    const send = vi.fn();
    const close = vi.fn();

    relayWebSocketMessage({ send, close } as unknown as WebSocket, 'hello stagecraft');

    expect(send).toHaveBeenCalledWith('echo: hello stagecraft');
    expect(close).not.toHaveBeenCalled();
  });

  test('closes the socket when a message exceeds the payload limit', () => {
    const send = vi.fn();
    const close = vi.fn();

    relayWebSocketMessage({ send, close } as unknown as WebSocket, 'x'.repeat(16 * 1024 + 1));

    expect(close).toHaveBeenCalledWith(1009, 'Message too large');
    expect(send).not.toHaveBeenCalled();
  });
});
