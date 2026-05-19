import http from 'node:http';
import app from './app';
import { attachWebSocketServer } from './lib/websocket';
import { logger } from './lib/logger';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer(app);

attachWebSocketServer(server);

server.listen(PORT, () => {
  logger.info(`[server] listening on http://localhost:${PORT}`);
});

export { server };
