import http from 'node:http';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { WebSocket } from 'ws';
import { attachWebSocketServer } from './websocket';

let server: http.Server;
let baseWsUrl: string;
let clients: WebSocket[] = [];

beforeAll(async () => {
    server = http.createServer();
    attachWebSocketServer(server);

    await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                throw new Error('Unable to resolve WebSocket test server address');
            }
            baseWsUrl = `ws://127.0.0.1:${address.port}`;
            resolve();
        });
    });
});

afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
});

afterEach(() => {
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

function waitForMessage(ws: WebSocket, predicate: (message: string) => boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timed out waiting for WebSocket message'));
        }, 2000);

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

describe('attachWebSocketServer', () => {
    test('accepts clients on /ws and sends a welcome message', async () => {
        const ws = connect('/ws');

        await expect(
            waitForMessage(ws, (message) => message === 'Welcome to the Stagecraft WebSocket server!'),
        ).resolves.toBe('Welcome to the Stagecraft WebSocket server!');
    });

    test('echoes client messages back on the WebSocket connection', async () => {
        const ws = connect('/ws');
        await waitForMessage(ws, (message) => message === 'Welcome to the Stagecraft WebSocket server!');

        ws.send('hello stagecraft');

        await expect(waitForMessage(ws, (message) => message === 'echo: hello stagecraft')).resolves.toBe(
            'echo: hello stagecraft',
        );
    });

    test('rejects upgrade requests outside the /ws path', async () => {
        const ws = connect('/not-ws');

        await expect(
            new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('connection was not rejected')), 1000);
                ws.once('open', () => reject(new Error('unexpected connection opened')));
                ws.once('close', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                ws.once('error', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            }),
        ).resolves.toBeUndefined();
    });
});
