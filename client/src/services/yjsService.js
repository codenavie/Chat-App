import * as Y from 'yjs';
import socketService from './socketService';

class YjsRoomBinding {
  constructor() {
    this.doc = null;
    this.text = null;
    this.socket = null;
    this.roomId = null;
    this.unsubscribe = null;
    this.updatingFromRemote = false;
  }

  init(roomId) {
    this.dispose();

    this.roomId = roomId;
    this.socket = socketService.connect();
    this.doc = new Y.Doc();
    this.text = this.doc.getText('content');

    this.doc.on('update', (update, origin) => {
      if (origin === 'remote') return;
      this.socket.emit('doc:update', { roomId: this.roomId, update: Array.from(update) });
    });

    this.socket.on('doc:sync', ({ update }) => {
      this.updatingFromRemote = true;
      Y.applyUpdate(this.doc, Uint8Array.from(update), 'remote');
      this.updatingFromRemote = false;
    });

    this.socket.on('doc:state', ({ update }) => {
      this.updatingFromRemote = true;
      Y.applyUpdate(this.doc, Uint8Array.from(update), 'remote');
      this.updatingFromRemote = false;
    });

    this.socket.emit('doc:request-state', { roomId: this.roomId });

    return this.text;
  }

  onTextChange(callback) {
    const observer = () => callback(this.text.toString());
    this.text.observe(observer);
    callback(this.text.toString());

    this.unsubscribe = () => {
      if (this.text) {
        this.text.unobserve(observer);
      }
    };

    return () => {
      this.text.unobserve(observer);
    };
  }

  setText(nextText) {
    if (!this.text || this.updatingFromRemote) return;

    const current = this.text.toString();
    if (current === nextText) return;

    this.doc.transact(() => {
      this.text.delete(0, this.text.length);
      this.text.insert(0, nextText);
    }, 'local');
  }

  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (this.socket) {
      this.socket.off('doc:sync');
      this.socket.off('doc:state');
    }

    if (this.doc) {
      this.doc.destroy();
    }

    this.doc = null;
    this.text = null;
    this.roomId = null;
    this.updatingFromRemote = false;
  }
}

export default new YjsRoomBinding();
