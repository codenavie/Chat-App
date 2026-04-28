import * as Y from 'yjs';

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  ensureRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        doc: new Y.Doc(),
        users: new Map()
      });
    }
    return this.rooms.get(roomId);
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
        if (room.users.size === 0) {
          room.doc.destroy();
          this.rooms.delete(roomId);
        }
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
