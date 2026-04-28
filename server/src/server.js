import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './sockets/socketHandler.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin }));
app.use(express.json({ limit: '64kb' }));

app.get('/health', (_, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin, methods: ['GET', 'POST'] }
});

registerSocketHandlers(io);

server.listen(port, () => {
  console.log(`Server listening on :${port}`);
});
