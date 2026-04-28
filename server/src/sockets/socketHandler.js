import * as Y from 'yjs';
import { RoomManager } from '../rooms/roomManager.js';
import { createRateLimiter } from '../services/rateLimiter.js';
import { isValidPayload, validateRoomId } from '../services/validation.js';

const manager = new RoomManager();
const isLimited = createRateLimiter();

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('room:join', ({ roomId, username }, ack) => {
      if (isLimited(socket.id)) return ack?.({ ok: false, error: 'Rate limited' });

      const check = isValidPayload({ roomId, username });
      if (!check.valid) return ack?.({ ok: false, error: 'Invalid room or name' });

      const safeRoom = roomId.trim();
      socket.join(safeRoom);
      socket.data.roomId = safeRoom;
      socket.data.username = check.safeName;

      manager.addUser(safeRoom, socket.id, check.safeName);
      io.to(safeRoom).emit('presence:update', { users: manager.getUsers(safeRoom) });
      ack?.({ ok: true });
    });

    socket.on('doc:request-state', ({ roomId }) => {
      if (isLimited(socket.id) || !validateRoomId(roomId)) return;
      const room = manager.ensureRoom(roomId);
      const state = Y.encodeStateAsUpdate(room.doc);
      socket.emit('doc:state', { update: Array.from(state) });
    });

    socket.on('doc:update', ({ roomId, update }) => {
      if (isLimited(socket.id) || !validateRoomId(roomId) || !Array.isArray(update)) return;

      const room = manager.ensureRoom(roomId);
      try {
        Y.applyUpdate(room.doc, Uint8Array.from(update));
        socket.to(roomId).emit('doc:sync', { update });
      } catch {
        socket.emit('doc:error', { message: 'Update rejected' });
      }
    });

    socket.on('disconnect', () => {
      const roomId = manager.removeUser(socket.id);
      if (roomId) {
        io.to(roomId).emit('presence:update', { users: manager.getUsers(roomId) });
      }
    });
  });
}
