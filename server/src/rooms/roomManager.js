import crypto from 'node:crypto';
import * as Y from 'yjs';

const MESSAGE_HISTORY_LIMIT = 100;

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  ensureRoom(roomId, options = {}) {
    if (!this.rooms.has(roomId)) {
      // Each room owns one CRDT document for conflict-free collaboration.
      const doc = new Y.Doc();
      const filesMap = doc.getMap('files');
      const savedMap = doc.getMap('savedAt');
      const main = new Y.Text();
      main.insert(0, '// Start collaborating in real-time...\n');
      filesMap.set('main.js', main);
      savedMap.set('main.js', Date.now());

      this.rooms.set(roomId, {
        doc,
        users: new Map(),
        messages: [],
        isPrivate: Boolean(options.password),
        passwordHash: options.password ? hashPassword(options.password) : null,
        createdAt: Date.now()
      });
    }

    return this.rooms.get(roomId);
  }

  createPrivateRoom(password, preferredRoomId) {
    const roomId = String(preferredRoomId || '').trim().toUpperCase();
    this.ensureRoom(roomId, { password });
    return roomId;
  }

  verifyAccess(roomId, password) {
    const room = this.getRoom(roomId);
    if (!room) return { ok: false, reason: 'Room not found' };
    if (!room.isPrivate) return { ok: true };

    const provided = hashPassword(password || '');
    if (provided !== room.passwordHash) return { ok: false, reason: 'Invalid password' };

    return { ok: true };
  }

  addUser(roomId, socketId, username) {
    const room = this.ensureRoom(roomId);
    room.users.set(socketId, { id: socketId, username });
    return room;
  }

  removeUser(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.users.has(socketId)) {
        room.users.delete(socketId);
        return roomId;
      }
    }

    return null;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  getUsers(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  getMessages(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return [];
    return room.messages.slice(-MESSAGE_HISTORY_LIMIT);
  }

  addMessage(roomId, message) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    room.messages.push(message);
    if (room.messages.length > MESSAGE_HISTORY_LIMIT) {
      room.messages = room.messages.slice(-MESSAGE_HISTORY_LIMIT);
    }

    return message;
  }
}
