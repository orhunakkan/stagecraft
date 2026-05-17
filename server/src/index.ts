import http from 'node:http';
import app from './app';
import { attachWebSocketServer } from './lib/websocket';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer(app);

attachWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

export { server };
