import crypto from 'node:crypto';
import * as Y from 'yjs';

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomId() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let roomId = '';

    do {
      roomId = Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    } while (this.rooms.has(roomId));

    return roomId;
  }

  ensureRoom(roomId, options = {}) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        doc: new Y.Doc(),
        users: new Map(),
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
}
