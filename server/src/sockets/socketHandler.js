import * as Y from 'yjs';
import { RoomManager } from '../rooms/roomManager.js';
import { createRateLimiter } from '../services/rateLimiter.js';
import { isValidPayload, validatePassword, validateRoomId } from '../services/validation.js';

const manager = new RoomManager();
const isLimited = createRateLimiter();

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('room:create', ({ roomId, username, password }, ack) => {
      if (isLimited(socket.id)) return ack?.({ ok: false, error: 'Rate limited' });

      const safeName = String(username || '').replace(/[^\w\s-]/g, '').trim().slice(0, 24);
      if (safeName.length < 2 || !validatePassword(password)) {
        return ack?.({ ok: false, error: 'Invalid username or password length (min 6)' });
      }

      const safeRoomId = String(roomId || '').trim().toUpperCase();
      if (!safeRoomId) {
        return ack?.({ ok: false, error: 'Generate or enter a room ID first' });
      }
      if (!validateRoomId(safeRoomId)) {
        return ack?.({ ok: false, error: 'Invalid room ID format' });
      }
      if (manager.getRoom(safeRoomId)) {
        return ack?.({ ok: false, error: 'Room ID already exists' });
      }

      const createdRoomId = manager.createPrivateRoom(password, safeRoomId);
      socket.join(createdRoomId);
      socket.data.roomId = createdRoomId;
      socket.data.username = safeName;

      manager.addUser(createdRoomId, socket.id, safeName);
      io.to(createdRoomId).emit('presence:update', { users: manager.getUsers(createdRoomId) });
      ack?.({ ok: true, roomId: createdRoomId });
    });

    socket.on('room:join', ({ roomId, username, password }, ack) => {
      if (isLimited(socket.id)) return ack?.({ ok: false, error: 'Rate limited' });

      const check = isValidPayload({ roomId, username });
      if (!check.valid) return ack?.({ ok: false, error: 'Invalid room or name' });

      const safeRoom = roomId.trim();
      const access = manager.verifyAccess(safeRoom, password);
      if (!access.ok) return ack?.({ ok: false, error: access.reason });

      socket.join(safeRoom);
      socket.data.roomId = safeRoom;
      socket.data.username = check.safeName;

      manager.addUser(safeRoom, socket.id, check.safeName);
      io.to(safeRoom).emit('presence:update', { users: manager.getUsers(safeRoom) });
      ack?.({ ok: true, roomId: safeRoom });
    });

    socket.on('doc:request-state', ({ roomId }) => {
      if (isLimited(socket.id) || !validateRoomId(roomId)) return;
      const room = manager.getRoom(roomId);
      if (!room) return;
      const state = Y.encodeStateAsUpdate(room.doc);
      socket.emit('doc:state', { update: Array.from(state) });
    });

    socket.on('doc:update', ({ roomId, update }) => {
      if (isLimited(socket.id) || !validateRoomId(roomId) || !Array.isArray(update)) return;

      const room = manager.getRoom(roomId);
      if (!room) return;

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
