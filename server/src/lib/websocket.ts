import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import type http from 'node:http';

export function attachWebSocketServer(server: http.Server): void {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket, head) => {
        const url = request.url ?? '';
        if (url !== '/ws') {
            socket.destroy();
            return;
        }
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    wss.on('connection', (ws: WebSocket) => {
        // Send welcome message
        ws.send('Welcome to the Stagecraft WebSocket server!');

        // Send a ticker message every 3 seconds
        const ticker = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(`ticker: ${new Date().toISOString()}`);
            }
        }, 3000);

        // Echo messages back
        ws.on('message', (data) => {
            const text = data.toString();
            ws.send(`echo: ${text}`);
        });

        ws.on('close', () => {
            clearInterval(ticker);
        });

        ws.on('error', () => {
            clearInterval(ticker);
        });
    });
}
