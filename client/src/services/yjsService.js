import * as Y from 'yjs';
import socketService from './socketService';

function normalizePath(input) {
  return String(input || '')
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('/');
}

function parentFolder(path) {
  const normalized = normalizePath(path);
  const parts = normalized.split('/');
  parts.pop();
  return parts.join('/');
}

class YjsRoomBinding {
  constructor() {
    this.doc = null;
    this.filesMap = null;
    this.foldersMap = null;
    this.savedMap = null;
    this.socket = null;
    this.roomId = null;
    this.unsubscribers = [];
  }

  init(roomId) {
    this.dispose();

    this.roomId = roomId;
    this.socket = socketService.connect();
    this.doc = new Y.Doc();
    this.filesMap = this.doc.getMap('files');
    this.foldersMap = this.doc.getMap('folders');
    this.savedMap = this.doc.getMap('savedAt');

    this.doc.on('update', (update, origin) => {
      if (origin === 'remote') return;
      this.socket.emit('doc:update', { roomId: this.roomId, update: Array.from(update) });
    });

    this.socket.on('doc:sync', ({ update }) => {
      Y.applyUpdate(this.doc, Uint8Array.from(update), 'remote');
    });

    this.socket.on('doc:state', ({ update }) => {
      Y.applyUpdate(this.doc, Uint8Array.from(update), 'remote');
      this.ensureWorkspace();
    });

    this.ensureWorkspace();
    this.socket.emit('doc:request-state', { roomId: this.roomId });
  }

  ensureWorkspace() {
    if (!this.filesMap || this.filesMap.size > 0) return;
    const main = new Y.Text();
    main.insert(0, '// Start collaborating in real-time...\n');
    this.filesMap.set('main.js', main);
    this.savedMap.set('main.js', Date.now());
  }

  listFiles() {
    if (!this.filesMap) return [];
    return Array.from(this.filesMap.keys()).sort((a, b) => a.localeCompare(b));
  }

  listFolders() {
    if (!this.foldersMap) return [];
    return Array.from(this.foldersMap.keys()).sort((a, b) => a.localeCompare(b));
  }

  createFolder(path) {
    if (!this.foldersMap) return { ok: false, error: 'Workspace is not ready' };
    const folderPath = normalizePath(path);
    if (!folderPath) return { ok: false, error: 'Folder name is required' };
    if (this.foldersMap.has(folderPath)) return { ok: false, error: 'Folder already exists' };

    const parts = folderPath.split('/');
    let current = '';
    parts.forEach((part) => {
      current = current ? `${current}/${part}` : part;
      if (!this.foldersMap.has(current)) this.foldersMap.set(current, true);
    });

    return { ok: true, folderPath };
  }

  createFile(name, folderPath = '') {
    if (!this.filesMap) return { ok: false, error: 'Workspace is not ready' };
    const fileName = normalizePath(name);
    if (!fileName) return { ok: false, error: 'File name is required' };

    const parent = normalizePath(folderPath);
    const fullPath = parent ? `${parent}/${fileName}` : fileName;

    if (this.filesMap.has(fullPath)) return { ok: false, error: 'File already exists' };

    if (parent) {
      this.createFolder(parent);
    }

    const text = new Y.Text();
    text.insert(0, '');
    this.filesMap.set(fullPath, text);
    this.savedMap.set(fullPath, Date.now());
    return { ok: true, fileName: fullPath };
  }

  renameFile(oldName, newName) {
    if (!this.filesMap) return { ok: false, error: 'Workspace is not ready' };
    const from = normalizePath(oldName);
    const to = normalizePath(newName);
    if (!this.filesMap.has(from)) return { ok: false, error: 'File not found' };
    if (!to) return { ok: false, error: 'New file name is required' };
    if (this.filesMap.has(to)) return { ok: false, error: 'File already exists' };

    const text = this.filesMap.get(from);
    const savedAt = this.savedMap.get(from) || Date.now();
    this.filesMap.set(to, text);
    this.savedMap.set(to, savedAt);
    this.filesMap.delete(from);
    this.savedMap.delete(from);
    return { ok: true, fileName: to };
  }

  deleteFile(name) {
    if (!this.filesMap) return { ok: false, error: 'Workspace is not ready' };
    const fileName = normalizePath(name);
    if (!this.filesMap.has(fileName)) return { ok: false, error: 'File not found' };

    this.filesMap.delete(fileName);
    this.savedMap.delete(fileName);
    return { ok: true };
  }

  deleteFolder(path) {
    if (!this.foldersMap || !this.filesMap) return { ok: false, error: 'Workspace is not ready' };
    const folderPath = normalizePath(path);
    if (!folderPath) return { ok: false, error: 'Folder not found' };
    if (!this.foldersMap.has(folderPath)) return { ok: false, error: 'Folder not found' };

    const prefix = `${folderPath}/`;
    for (const filePath of this.filesMap.keys()) {
      if (filePath === folderPath || filePath.startsWith(prefix)) {
        this.filesMap.delete(filePath);
        this.savedMap.delete(filePath);
      }
    }

    for (const existingFolder of this.foldersMap.keys()) {
      if (existingFolder === folderPath || existingFolder.startsWith(prefix)) {
        this.foldersMap.delete(existingFolder);
      }
    }

    return { ok: true };
  }

  getFileText(fileName) {
    if (!this.filesMap) return '';
    const text = this.filesMap.get(normalizePath(fileName));
    return text instanceof Y.Text ? text.toString() : '';
  }

  setFileText(fileName, nextText) {
    if (!this.filesMap) return;
    const text = this.filesMap.get(normalizePath(fileName));
    if (!(text instanceof Y.Text)) return;

    const current = text.toString();
    if (current === nextText) return;

    this.doc.transact(() => {
      text.delete(0, text.length);
      text.insert(0, nextText);
    }, 'local');
  }

  saveFile(fileName) {
    const key = normalizePath(fileName);
    if (!this.savedMap || !this.filesMap?.has(key)) return { ok: false, error: 'File not found' };
    const timestamp = Date.now();
    this.savedMap.set(key, timestamp);
    return { ok: true, savedAt: timestamp };
  }

  getSavedAt(fileName) {
    return this.savedMap?.get(normalizePath(fileName)) || null;
  }

  onFilesChange(callback) {
    if (!this.filesMap) return () => {};
    const observer = () => callback(this.listFiles());
    this.filesMap.observe(observer);
    callback(this.listFiles());

    const unsub = () => this.filesMap.unobserve(observer);
    this.unsubscribers.push(unsub);
    return unsub;
  }

  onFoldersChange(callback) {
    if (!this.foldersMap) return () => {};
    const observer = () => callback(this.listFolders());
    this.foldersMap.observe(observer);
    callback(this.listFolders());

    const unsub = () => this.foldersMap.unobserve(observer);
    this.unsubscribers.push(unsub);
    return unsub;
  }

  onFileTextChange(fileName, callback) {
    if (!this.filesMap) return () => {};
    const text = this.filesMap.get(normalizePath(fileName));
    if (!(text instanceof Y.Text)) {
      callback('');
      return () => {};
    }

    const observer = () => callback(text.toString());
    text.observe(observer);
    callback(text.toString());

    const unsub = () => text.unobserve(observer);
    this.unsubscribers.push(unsub);
    return unsub;
  }

  onSavedAtChange(fileName, callback) {
    if (!this.savedMap) return () => {};
    const key = normalizePath(fileName);
    const observer = () => callback(this.getSavedAt(key));
    this.savedMap.observe(observer);
    callback(this.getSavedAt(key));

    const unsub = () => this.savedMap.unobserve(observer);
    this.unsubscribers.push(unsub);
    return unsub;
  }

  dispose() {
    this.unsubscribers.forEach((unsub) => {
      try { unsub(); } catch {}
    });
    this.unsubscribers = [];

    if (this.socket) {
      this.socket.off('doc:sync');
      this.socket.off('doc:state');
    }

    if (this.doc) {
      this.doc.destroy();
    }

    this.doc = null;
    this.filesMap = null;
    this.foldersMap = null;
    this.savedMap = null;
    this.roomId = null;
  }

  getParentFolder(path) {
    return parentFolder(path);
  }
}

export default new YjsRoomBinding();
