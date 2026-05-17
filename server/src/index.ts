import http from 'node:http';
import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
});

export { server };
