import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import type http from 'node:http';

const MAX_WEBSOCKET_PAYLOAD_BYTES = 16 * 1024;

type TickerSocket = Pick<WebSocket, 'readyState' | 'send'>;
type MessageSocket = Pick<WebSocket, 'send' | 'close'>;

export function sendTicker(ws: TickerSocket): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(`ticker: ${new Date().toISOString()}`);
  }
}

export function relayWebSocketMessage(ws: MessageSocket, text: string): void {
  if (Buffer.byteLength(text, 'utf8') > MAX_WEBSOCKET_PAYLOAD_BYTES) {
    ws.close(1009, 'Message too large');
    return;
  }

  ws.send(`echo: ${text}`);
}

export function attachWebSocketServer(server: http.Server): void {
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_WEBSOCKET_PAYLOAD_BYTES });

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
    ws.send('Welcome to the Stagecraft WebSocket server!');

    const ticker = setInterval(() => {
      sendTicker(ws);
    }, 3000);
    const clearTicker = () => {
      clearInterval(ticker);
    };

    ws.on('message', (data) => {
      relayWebSocketMessage(ws, data.toString());
    });

    ws.on('close', clearTicker);
    ws.on('error', clearTicker);
  });
}
