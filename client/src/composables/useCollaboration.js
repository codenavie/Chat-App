import { computed, onBeforeUnmount, ref, watch } from 'vue';
import Swal from 'sweetalert2';
import { useCollabStore } from '../store/collabStore';
import socketService from '../services/socketService';
import yjsService from '../services/yjsService';

const roomRegex = /^[A-Za-z0-9_-]{3,24}$/;
const roomAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_CHAT_MESSAGES = 100;
const MAX_ACTIVITY_ITEMS = 8;
const CURSOR_EMIT_DELAY_MS = 90;
const CURSOR_HIDE_DELAY_MS = 2200;
const CARET_EMIT_DELAY_MS = 120;
const CARET_HIDE_DELAY_MS = 2500;
const ACTIVITY_EMIT_DELAY_MS = 120;

function buildExplorerTree(folders, files) {
  const root = { id: '', name: '', type: 'folder', children: [] };
  const folderMap = new Map([['', root]]);

  folders.forEach((folderPath) => {
    const parts = folderPath.split('/');
    let current = '';
    let parent = root;
    parts.forEach((part) => {
      current = current ? `${current}/${part}` : part;
      if (!folderMap.has(current)) {
        const node = { id: current, name: part, type: 'folder', children: [] };
        folderMap.set(current, node);
        parent.children.push(node);
      }
      parent = folderMap.get(current);
    });
  });

  files.forEach((filePath) => {
    const parts = filePath.split('/');
    const fileName = parts.pop();
    const folderPath = parts.join('/');
    const parent = folderMap.get(folderPath) || root;
    parent.children.push({ id: filePath, name: fileName, type: 'file' });
  });

  function sortNode(node) {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNode);
  }

  sortNode(root);
  return root.children;
}

export function useCollaboration() {
  const store = useCollabStore();
  const loading = ref(false);
  const content = ref('');
  const files = ref([]);
  const folders = ref([]);
  const activeFile = ref('');
  const savedAt = ref(null);
  const dirty = ref(false);
  const chatMessages = ref([]);
  const chatInput = ref('');
  const error = ref('');
  const joined = ref(false);
  const isCreator = ref(false);
  const creatorRoomInfo = ref({ roomId: '', password: '' });
  const activityFeed = ref([]);
  const remoteCursors = ref([]);
  const remoteCarets = ref([]);
  const socket = ref(null);
  let activityTimer = null;
  let stopFilesObserver = null;
  let stopFoldersObserver = null;
  let stopTextObserver = null;
  let stopSavedObserver = null;
  let lastSavedSnapshot = '';
  let cursorEmitTimer = null;
  let cursorHideTimer = null;
  let caretEmitTimer = null;
  let caretHideTimer = null;
  let lastCursorPoint = null;
  let unbindSocketEvents = () => {};

  function emitWithAck(eventName, payload) {
    return new Promise((resolve) => {
      socket.value?.emit(eventName, payload, (ack) => resolve(ack));
    });
  }

  const explorerTree = computed(() => buildExplorerTree(folders.value, files.value));
  const canJoin = computed(() => roomRegex.test(store.roomId) && store.username.trim().length >= 2 && store.password.length >= 6);
  const canCreate = computed(() => roomRegex.test(store.roomId) && store.username.trim().length >= 2 && store.password.length >= 6);

  function getSwalTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      background: isDark ? '#1a1a19' : '#ffffff',
      color: isDark ? '#f3f1ed' : '#1a1a1a',
      confirmButtonColor: '#b8860b'
    };
  }

  function bindLifecycle() {
    // One shared socket connection for all real-time channels.
    socket.value = socketService.connect();
    unbindSocketEvents();

    const onConnect = () => store.setConnected(true);
    const onDisconnect = () => store.setConnected(false);
    const onPresenceUpdate = ({ users }) => {
      store.setUsers(users);
      const activeIds = new Set((users || []).map((u) => u.id));
      activityFeed.value = activityFeed.value.filter((a) => activeIds.has(a.userId)).slice(0, MAX_ACTIVITY_ITEMS);
      remoteCursors.value = remoteCursors.value.filter((c) => activeIds.has(c.userId));
      remoteCarets.value = remoteCarets.value.filter((c) => activeIds.has(c.userId));
    };
    const onChatHistory = ({ messages }) => {
      chatMessages.value = Array.isArray(messages) ? messages : [];
    };
    const onChatNew = (message) => {
      chatMessages.value = [...chatMessages.value, message].slice(-MAX_CHAT_MESSAGES);
    };
    const onUserJoined = ({ username }) => {
      if (isCreator.value && username && username !== store.username) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: `${username} joined your room`,
          timer: 1800,
          showConfirmButton: false,
          ...getSwalTheme()
        });
      }
    };
    const onPresenceActivity = ({ userId, username, action, target, ts }) => {
      activityFeed.value = [{ userId, username, action, target, ts }, ...activityFeed.value].slice(0, 8);
    };
    const onPresenceCaret = ({ userId, username, fileName, line, column, preview, visible, ts }) => {
      remoteCarets.value = remoteCarets.value.filter((c) => c.userId !== userId);
      if (visible) {
        remoteCarets.value.push({ userId, username, fileName, line, column, preview, ts });
      }
    };
    const onPresenceCursor = ({ userId, username, fileName, x, y, visible, ts }) => {
      remoteCursors.value = remoteCursors.value.filter((c) => c.userId !== userId);
      if (visible) {
        remoteCursors.value.push({ userId, username, fileName, x, y, ts });
      }
    };

    socket.value.on('connect', onConnect);
    socket.value.on('disconnect', onDisconnect);
    socket.value.on('presence:update', onPresenceUpdate);
    socket.value.on('chat:history', onChatHistory);
    socket.value.on('chat:new', onChatNew);
    socket.value.on('room:user-joined', onUserJoined);
    socket.value.on('presence:activity', onPresenceActivity);
    socket.value.on('presence:caret', onPresenceCaret);
    socket.value.on('presence:cursor', onPresenceCursor);

    unbindSocketEvents = () => {
      if (!socket.value) return;
      socket.value.off('connect', onConnect);
      socket.value.off('disconnect', onDisconnect);
      socket.value.off('presence:update', onPresenceUpdate);
      socket.value.off('chat:history', onChatHistory);
      socket.value.off('chat:new', onChatNew);
      socket.value.off('room:user-joined', onUserJoined);
      socket.value.off('presence:activity', onPresenceActivity);
      socket.value.off('presence:caret', onPresenceCaret);
      socket.value.off('presence:cursor', onPresenceCursor);
    };
  }

  function showSuccess(title, text) {
    Swal.fire({ icon: 'success', title, text, confirmButtonText: 'OK', ...getSwalTheme() });
  }

  function bindActiveFile(fileName) {
    if (!fileName) return;
    activeFile.value = fileName;

    if (stopTextObserver) stopTextObserver();
    if (stopSavedObserver) stopSavedObserver();

    // CRDT text updates from local and remote peers flow through here.
    stopTextObserver = yjsService.onFileTextChange(fileName, (value) => {
      content.value = value;
      dirty.value = value !== lastSavedSnapshot;
    });

    stopSavedObserver = yjsService.onSavedAtChange(fileName, (timestamp) => {
      savedAt.value = timestamp;
      lastSavedSnapshot = yjsService.getFileText(fileName);
      dirty.value = content.value !== lastSavedSnapshot;
    });
  }

  function bindRoom(roomId, username) {
    store.setSession({ roomId, username });
    yjsService.init(roomId);

    if (stopFilesObserver) stopFilesObserver();
    if (stopFoldersObserver) stopFoldersObserver();

    stopFilesObserver = yjsService.onFilesChange((nextFiles) => {
      files.value = nextFiles;
      if (!activeFile.value || !nextFiles.includes(activeFile.value)) {
        if (nextFiles.length > 0) {
          bindActiveFile(nextFiles[0]);
        } else {
          activeFile.value = '';
          content.value = '';
          savedAt.value = null;
          dirty.value = false;
          lastSavedSnapshot = '';
        }
      }
    });

    stopFoldersObserver = yjsService.onFoldersChange((nextFolders) => {
      folders.value = nextFolders;
    });

    joined.value = true;
  }

  function resetRoomState() {
    if (stopFilesObserver) stopFilesObserver();
    if (stopFoldersObserver) stopFoldersObserver();
    if (stopTextObserver) stopTextObserver();
    if (stopSavedObserver) stopSavedObserver();
    stopFilesObserver = null;
    stopFoldersObserver = null;
    stopTextObserver = null;
    stopSavedObserver = null;
    files.value = [];
    folders.value = [];
    content.value = '';
    activeFile.value = '';
    savedAt.value = null;
    dirty.value = false;
    lastSavedSnapshot = '';
    chatMessages.value = [];
    chatInput.value = '';
    activityFeed.value = [];
    remoteCursors.value = [];
    remoteCarets.value = [];
    joined.value = false;
    isCreator.value = false;
    creatorRoomInfo.value = { roomId: '', password: '' };
    yjsService.dispose();
  }

  async function createPrivateRoom() {
    if (!canCreate.value || !socket.value) return;
    if (!store.connected) {
      error.value = 'Socket is not connected. Start server and refresh.';
      return;
    }

    error.value = '';
    loading.value = true;
    const payload = { roomId: store.roomId.trim(), username: store.username.trim().slice(0, 24), password: store.password };

    const ack = await emitWithAck('room:create', payload);
    if (ack?.ok) {
      if (ack.roomId !== payload.roomId) {
        error.value = 'Server returned a different Room ID. Restart server and try again.';
      } else {
        bindRoom(payload.roomId, payload.username);
        isCreator.value = true;
        creatorRoomInfo.value = { roomId: payload.roomId, password: payload.password };
        showSuccess('Room Created', `Room ${payload.roomId} created successfully.`);
      }
    } else {
      error.value = ack?.error || 'Unable to create room';
    }

    loading.value = false;
  }

  async function joinRoom(form = null) {
    const roomId = form?.roomId ?? store.roomId;
    const username = form?.username ?? store.username;
    const password = form?.password ?? store.password;
    const canJoinNow = roomRegex.test(String(roomId || '').trim()) && String(username || '').trim().length >= 2 && String(password || '').length >= 6;

    if (!canJoinNow || !socket.value) return;
    if (!store.connected) {
      error.value = 'Socket is not connected. Start server and refresh.';
      return;
    }

    error.value = '';
    loading.value = true;
    const payload = { roomId: String(roomId || '').trim(), username: String(username || '').trim().slice(0, 24), password: String(password || '') };

    const ack = await emitWithAck('room:join', payload);
    if (ack?.ok) {
      bindRoom(payload.roomId, payload.username);
      isCreator.value = false;
      creatorRoomInfo.value = { roomId: '', password: '' };
      store.password = '';
      showSuccess('Joined Room', 'You joined the room successfully.');
    } else {
      error.value = ack?.error || 'Unable to join room';
    }

    loading.value = false;
  }

  async function leaveRoom() {
    if (joined.value && socket.value && store.roomId) {
      await emitWithAck('room:leave', { roomId: store.roomId });
    }
    hideCursorPresence();
    hideCaretPresence();
    store.setUsers([]);
    resetRoomState();
  }

  function sendChatMessage() {
    if (!socket.value || !joined.value) return;
    const msg = chatInput.value.trim();
    if (!msg) return;
    socket.value.emit('chat:send', { roomId: store.roomId, message: msg });
    chatInput.value = '';
  }

  function updateContent(payload) {
    if (!activeFile.value) return;

    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'inputType')) {
      const applied = yjsService.applyTextInput(activeFile.value, payload);
      if (applied) return;
    }

    const nextValue = typeof payload === 'string' ? payload : String(payload?.value ?? '');
    content.value = nextValue;
    yjsService.setFileText(activeFile.value, nextValue);
    dirty.value = nextValue !== lastSavedSnapshot;
  }

  function updateCursorPosition(payload) {
    if (!socket.value || !joined.value) return;
    if (!activeFile.value) return;
    if (lastCursorPoint) {
      const dx = Math.abs(payload.x - lastCursorPoint.x);
      const dy = Math.abs(payload.y - lastCursorPoint.y);
      if (dx < 0.015 && dy < 0.015) return;
    }
    lastCursorPoint = payload;
    if (cursorEmitTimer) clearTimeout(cursorEmitTimer);
    cursorEmitTimer = setTimeout(() => {
      socket.value?.emit('presence:cursor', {
        roomId: store.roomId,
        fileName: activeFile.value,
        x: payload.x,
        y: payload.y,
        visible: true
      });
    }, CURSOR_EMIT_DELAY_MS);
    if (cursorHideTimer) clearTimeout(cursorHideTimer);
    cursorHideTimer = setTimeout(() => {
      hideCursorPresence();
    }, CURSOR_HIDE_DELAY_MS);
  }

  function hideCursorPresence() {
    if (!socket.value || !joined.value) return;
    lastCursorPoint = null;
    socket.value.emit('presence:cursor', {
      roomId: store.roomId,
      fileName: activeFile.value,
      x: 0,
      y: 0,
      visible: false
    });
  }

  function updateCaretPosition(payload) {
    if (!socket.value || !joined.value || !activeFile.value) return;
    if (caretEmitTimer) clearTimeout(caretEmitTimer);
    caretEmitTimer = setTimeout(() => {
      socket.value?.emit('presence:caret', {
        roomId: store.roomId,
        fileName: activeFile.value,
        line: payload.line,
        column: payload.column,
        preview: payload.preview,
        visible: true
      });
    }, CARET_EMIT_DELAY_MS);
    if (caretHideTimer) clearTimeout(caretHideTimer);
    caretHideTimer = setTimeout(() => {
      hideCaretPresence();
    }, CARET_HIDE_DELAY_MS);
  }

  function hideCaretPresence() {
    if (!socket.value || !joined.value) return;
    socket.value.emit('presence:caret', {
      roomId: store.roomId,
      fileName: activeFile.value,
      line: 1,
      column: 1,
      preview: '',
      visible: false
    });
  }

  function selectFile(fileName) { bindActiveFile(fileName); }

  async function createFile(parentFolder = '') {
    const { value } = await Swal.fire({ title: 'Create File', input: 'text', inputLabel: 'File name', inputPlaceholder: 'example: app.js', showCancelButton: true, ...getSwalTheme() });
    if (!value) return;
    const result = yjsService.createFile(value, parentFolder);
    if (!result.ok) { error.value = result.error; return; }
    bindActiveFile(result.fileName);
    emitActivity('created file', result.fileName);
  }

  async function createFolder(parent = '') {
    const { value } = await Swal.fire({ title: 'Create Folder', input: 'text', inputLabel: 'Folder name', inputPlaceholder: 'example: src/components', showCancelButton: true, ...getSwalTheme() });
    if (!value) return;
    const path = parent ? `${parent}/${value}` : value;
    const result = yjsService.createFolder(path);
    if (!result.ok) error.value = result.error;
    if (result.ok) emitActivity('created folder', path);
  }

  async function renameFile(fileName) {
    const { value } = await Swal.fire({ title: 'Rename File', input: 'text', inputLabel: 'New file name', inputValue: fileName, showCancelButton: true, ...getSwalTheme() });
    if (!value || value === fileName) return;
    const result = yjsService.renameFile(fileName, value);
    if (!result.ok) { error.value = result.error; return; }
    if (activeFile.value === fileName) bindActiveFile(result.fileName);
    emitActivity('renamed file', `${fileName} -> ${result.fileName}`);
  }

  async function deleteFile(fileName) {
    const confirm = await Swal.fire({ title: 'Delete File?', text: `This will remove ${fileName} for everyone in the room.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', ...getSwalTheme() });
    if (!confirm.isConfirmed) return;
    const result = yjsService.deleteFile(fileName);
    if (!result.ok) { error.value = result.error; }
    if (result.ok) emitActivity('deleted file', fileName);
  }

  async function deleteFolder(folderPath) {
    const confirm = await Swal.fire({ title: 'Delete Folder?', text: `This will remove ${folderPath} and its files for everyone in the room.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', ...getSwalTheme() });
    if (!confirm.isConfirmed) return;
    const result = yjsService.deleteFolder(folderPath);
    if (!result.ok) { error.value = result.error; }
    if (result.ok) emitActivity('deleted folder', folderPath);
  }

  function saveCurrentFile() {
    if (!activeFile.value) return;
    const result = yjsService.saveFile(activeFile.value);
    if (!result.ok) { error.value = result.error; return; }
    savedAt.value = result.savedAt;
    lastSavedSnapshot = content.value;
    dirty.value = false;
    showSuccess('Saved', `${activeFile.value} saved.`);
  }

  function generateRoomId() {
    const nextId = Array.from({ length: 8 }, () => roomAlphabet[Math.floor(Math.random() * roomAlphabet.length)]).join('');
    store.setSession({ roomId: nextId });
  }

  watch(() => store.roomId, (value) => {
    store.setSession({ roomId: value.toUpperCase().replace(/\s+/g, '-') });
  });

  function emitActivity(action, target) {
    if (!socket.value || !joined.value) return;
    if (activityTimer) clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
      socket.value?.emit('presence:activity', {
        roomId: store.roomId,
        action,
        target
      });
    }, ACTIVITY_EMIT_DELAY_MS);
  }

  onBeforeUnmount(() => {
    unbindSocketEvents();
    hideCursorPresence();
    hideCaretPresence();
    if (cursorEmitTimer) clearTimeout(cursorEmitTimer);
    if (cursorHideTimer) clearTimeout(cursorHideTimer);
    if (caretEmitTimer) clearTimeout(caretEmitTimer);
    if (caretHideTimer) clearTimeout(caretHideTimer);
    if (activityTimer) clearTimeout(activityTimer);
    if (stopFilesObserver) stopFilesObserver();
    if (stopFoldersObserver) stopFoldersObserver();
    if (stopTextObserver) stopTextObserver();
    if (stopSavedObserver) stopSavedObserver();
    yjsService.dispose();
    socketService.disconnect();
  });

  return {
    store, loading, error, joined, isCreator, creatorRoomInfo,
    content, files, folders, explorerTree, activeFile, savedAt, dirty,
    chatMessages, chatInput, activityFeed, remoteCursors, remoteCarets,
    canJoin, canCreate, bindLifecycle, joinRoom, createPrivateRoom, generateRoomId,
    leaveRoom,
    updateContent, selectFile, createFile, createFolder, renameFile, deleteFile, deleteFolder, saveCurrentFile,
    sendChatMessage, updateCursorPosition, hideCursorPresence, updateCaretPosition, hideCaretPresence
  };
}
