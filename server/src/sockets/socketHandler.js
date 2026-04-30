import * as Y from 'yjs';
import { RoomManager } from '../rooms/roomManager.js';
import { createRateLimiter } from '../services/rateLimiter.js';
import { isValidPayload, sanitizeName, validatePassword, validateRoomId } from '../services/validation.js';

const manager = new RoomManager();
const isLimitedGeneral = createRateLimiter(240, 60000);
const isLimitedPresence = createRateLimiter(4000, 60000);

function normalizeRoomId(roomId) {
  return String(roomId || '').trim().toUpperCase();
}

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('room:leave', ({ roomId }, ack) => {
      const safeRoomId = normalizeRoomId(roomId);
      if (!validateRoomId(safeRoomId)) return ack?.({ ok: false, error: 'Invalid room ID' });

      socket.leave(safeRoomId);
      manager.removeUser(socket.id);
      socket.data.roomId = null;
      socket.data.username = null;
      io.to(safeRoomId).emit('presence:update', { users: manager.getUsers(safeRoomId) });
      ack?.({ ok: true });
    });

    socket.on('room:create', ({ roomId, username, password }, ack) => {
      if (isLimitedGeneral(socket.id)) return ack?.({ ok: false, error: 'Rate limited' });

      const safeName = sanitizeName(username);
      if (safeName.length < 2 || !validatePassword(password)) {
        return ack?.({ ok: false, error: 'Invalid username or password length (min 6)' });
      }

      const safeRoomId = normalizeRoomId(roomId);
      if (!safeRoomId) return ack?.({ ok: false, error: 'Generate or enter a room ID first' });
      if (!validateRoomId(safeRoomId)) return ack?.({ ok: false, error: 'Invalid room ID format' });
      if (manager.getRoom(safeRoomId)) return ack?.({ ok: false, error: 'Room ID already exists' });

      const createdRoomId = manager.createPrivateRoom(password, safeRoomId);
      socket.join(createdRoomId);
      socket.data.roomId = createdRoomId;
      socket.data.username = safeName;

      manager.addUser(createdRoomId, socket.id, safeName);
      io.to(createdRoomId).emit('presence:update', { users: manager.getUsers(createdRoomId) });
      socket.emit('chat:history', { messages: manager.getMessages(createdRoomId) });
      ack?.({ ok: true, roomId: createdRoomId });
    });

    socket.on('room:join', ({ roomId, username, password }, ack) => {
      if (isLimitedGeneral(socket.id)) return ack?.({ ok: false, error: 'Rate limited' });

      const check = isValidPayload({ roomId, username });
      if (!check.valid) return ack?.({ ok: false, error: 'Invalid room or name' });

      const safeRoom = normalizeRoomId(roomId);
      const access = manager.verifyAccess(safeRoom, password);
      if (!access.ok) return ack?.({ ok: false, error: access.reason });

      socket.join(safeRoom);
      socket.data.roomId = safeRoom;
      socket.data.username = check.safeName;

      manager.addUser(safeRoom, socket.id, check.safeName);
      io.to(safeRoom).emit('presence:update', { users: manager.getUsers(safeRoom) });
      socket.to(safeRoom).emit('room:user-joined', {
        userId: socket.id,
        username: check.safeName,
        roomId: safeRoom,
        joinedAt: Date.now()
      });
      socket.emit('chat:history', { messages: manager.getMessages(safeRoom) });
      ack?.({ ok: true, roomId: safeRoom });
    });

    socket.on('presence:caret', ({ roomId, fileName, line, column, preview, visible }) => {
      if (isLimitedPresence(socket.id) || !validateRoomId(roomId)) return;
      const room = manager.getRoom(roomId);
      if (!room) return;
      const safeFile = String(fileName || '').trim().slice(0, 160);
      const safePreview = String(preview || '').trim().slice(0, 80);
      const safeLine = Math.max(1, Math.min(500000, Number(line) || 1));
      const safeColumn = Math.max(1, Math.min(10000, Number(column) || 1));

      socket.to(roomId).emit('presence:caret', {
        userId: socket.id,
        username: socket.data.username || 'User',
        fileName: safeFile,
        line: safeLine,
        column: safeColumn,
        preview: safePreview,
        visible: Boolean(visible),
        ts: Date.now()
      });
    });

    socket.on('presence:activity', ({ roomId, action, target }) => {
      if (isLimitedPresence(socket.id) || !validateRoomId(roomId)) return;
      const room = manager.getRoom(roomId);
      if (!room) return;
      const safeAction = String(action || '').trim().slice(0, 40);
      const safeTarget = String(target || '').trim().slice(0, 120);
      if (!safeAction) return;

      socket.to(roomId).emit('presence:activity', {
        userId: socket.id,
        username: socket.data.username || 'User',
        action: safeAction,
        target: safeTarget,
        ts: Date.now()
      });
    });

    socket.on('presence:cursor', ({ roomId, fileName, x, y, visible }) => {
      if (isLimitedPresence(socket.id) || !validateRoomId(roomId)) return;
      const room = manager.getRoom(roomId);
      if (!room) return;
      const safeFile = String(fileName || '').trim().slice(0, 160);
      const safeX = Number.isFinite(Number(x)) ? Math.max(0, Math.min(1, Number(x))) : 0;
      const safeY = Number.isFinite(Number(y)) ? Math.max(0, Math.min(1, Number(y))) : 0;

      socket.to(roomId).emit('presence:cursor', {
        userId: socket.id,
        username: socket.data.username || 'User',
        fileName: safeFile,
        x: safeX,
        y: safeY,
        visible: Boolean(visible),
        ts: Date.now()
      });
    });

    socket.on('chat:send', ({ roomId, message }) => {
      if (isLimitedGeneral(socket.id) || !validateRoomId(roomId)) return;
      const room = manager.getRoom(roomId);
      if (!room) return;

      const safeMessage = String(message || '').trim().slice(0, 1000);
      if (!safeMessage) return;

      const payload = {
        id: `${Date.now()}-${socket.id}`,
        roomId,
        username: socket.data.username || 'User',
        message: safeMessage,
        createdAt: Date.now()
      };

      manager.addMessage(roomId, payload);
      io.to(roomId).emit('chat:new', payload);
    });

    socket.on('doc:request-state', ({ roomId }) => {
      // Late joiners request the current room snapshot before live deltas.
      if (!validateRoomId(roomId)) return;
      const room = manager.getRoom(roomId);
      if (!room) return;
      const state = Y.encodeStateAsUpdate(room.doc);
      socket.emit('doc:state', { update: Array.from(state) });
    });

    socket.on('doc:update', ({ roomId, update }) => {
      // Y.js update packets are replicated to other peers in the same room.
      if (!validateRoomId(roomId) || !Array.isArray(update)) return;

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
