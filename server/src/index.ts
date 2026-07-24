import http from 'node:http';
import app from './app';
import { attachWebSocketServer } from './lib/websocket';
import { initBookCatalogStore } from './lib/db';
import { logger } from './lib/logger';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer(app);

attachWebSocketServer(server);
void initBookCatalogStore();

server.listen(PORT, () => {
  logger.info(`[server] listening on http://localhost:${PORT}`);
});

export { server };
