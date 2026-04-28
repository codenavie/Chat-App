import { computed, onBeforeUnmount, ref, watch } from 'vue';
import Swal from 'sweetalert2';
import { useCollabStore } from '../store/collabStore';
import socketService from '../services/socketService';
import yjsService from '../services/yjsService';

const roomRegex = /^[A-Za-z0-9_-]{3,24}$/;
const roomAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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
  const error = ref('');
  const joined = ref(false);
  const isCreator = ref(false);
  const creatorRoomInfo = ref({ roomId: '', password: '' });
  const socket = ref(null);
  let stopFilesObserver = null;
  let stopFoldersObserver = null;
  let stopTextObserver = null;
  let stopSavedObserver = null;
  let lastSavedSnapshot = '';

  const explorerTree = computed(() => buildExplorerTree(folders.value, files.value));
  const canJoin = computed(() => roomRegex.test(store.roomId) && store.username.trim().length >= 2 && store.password.length >= 6);
  const canCreate = computed(() => roomRegex.test(store.roomId) && store.username.trim().length >= 2 && store.password.length >= 6);

  function bindLifecycle() {
    socket.value = socketService.connect();

    socket.value.on('connect', () => store.setConnected(true));
    socket.value.on('disconnect', () => store.setConnected(false));
    socket.value.on('presence:update', ({ users }) => store.setUsers(users));
  }

  function showSuccess(title, text) {
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'OK',
      background: '#f0f2f5',
      color: '#2d3436',
      confirmButtonColor: '#ff4757'
    });
  }

  function bindActiveFile(fileName) {
    if (!fileName) return;
    activeFile.value = fileName;

    if (stopTextObserver) stopTextObserver();
    if (stopSavedObserver) stopSavedObserver();

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

  async function createPrivateRoom() { /* unchanged */
    if (!canCreate.value || !socket.value) return;
    if (!store.connected) {
      error.value = 'Socket is not connected. Start server and refresh.';
      return;
    }

    error.value = '';
    loading.value = true;

    const payload = {
      roomId: store.roomId.trim(),
      username: store.username.trim().slice(0, 24),
      password: store.password
    };

    await new Promise((resolve) => {
      socket.value.emit('room:create', payload, (ack) => {
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
        resolve();
      });
    });

    loading.value = false;
  }

  async function joinRoom(form = null) { /* unchanged */
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
    const payload = {
      roomId: String(roomId || '').trim(),
      username: String(username || '').trim().slice(0, 24),
      password: String(password || '')
    };

    await new Promise((resolve) => {
      socket.value.emit('room:join', payload, (ack) => {
        if (ack?.ok) {
          store.setSession({ roomId: payload.roomId, username: payload.username });
          bindRoom(payload.roomId, payload.username);
          isCreator.value = false;
          creatorRoomInfo.value = { roomId: '', password: '' };
          store.password = '';
          showSuccess('Joined Room', 'You joined the room successfully.');
        } else {
          error.value = ack?.error || 'Unable to join room';
        }
        resolve();
      });
    });

    loading.value = false;
  }

  function updateContent(nextValue) {
    content.value = nextValue;
    yjsService.setFileText(activeFile.value, nextValue);
    dirty.value = nextValue !== lastSavedSnapshot;
  }

  function selectFile(fileName) {
    bindActiveFile(fileName);
  }

  async function createFile(parentFolder = '') {
    const { value } = await Swal.fire({
      title: 'Create File',
      input: 'text',
      inputLabel: 'File name',
      inputPlaceholder: 'example: app.js',
      showCancelButton: true,
      confirmButtonColor: '#8B5CF6',
      background: '#FFFDF5',
      color: '#1E293B'
    });

    if (!value) return;
    const result = yjsService.createFile(value, parentFolder);
    if (!result.ok) {
      error.value = result.error;
      return;
    }

    bindActiveFile(result.fileName);
  }

  async function createFolder(parent = '') {
    const { value } = await Swal.fire({
      title: 'Create Folder',
      input: 'text',
      inputLabel: 'Folder name',
      inputPlaceholder: 'example: src/components',
      showCancelButton: true,
      confirmButtonColor: '#34D399',
      background: '#FFFDF5',
      color: '#1E293B'
    });

    if (!value) return;
    const path = parent ? `${parent}/${value}` : value;
    const result = yjsService.createFolder(path);
    if (!result.ok) {
      error.value = result.error;
    }
  }

  async function renameFile(fileName) {
    const { value } = await Swal.fire({
      title: 'Rename File',
      input: 'text',
      inputLabel: 'New file name',
      inputValue: fileName,
      showCancelButton: true,
      confirmButtonColor: '#8B5CF6',
      background: '#FFFDF5',
      color: '#1E293B'
    });

    if (!value || value === fileName) return;
    const result = yjsService.renameFile(fileName, value);
    if (!result.ok) {
      error.value = result.error;
      return;
    }

    if (activeFile.value === fileName) bindActiveFile(result.fileName);
  }

  async function deleteFile(fileName) {
    const confirm = await Swal.fire({
      title: 'Delete File?',
      text: `This will remove ${fileName} for everyone in the room.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#F472B6',
      background: '#FFFDF5',
      color: '#1E293B'
    });

    if (!confirm.isConfirmed) return;
    const result = yjsService.deleteFile(fileName);
    if (!result.ok) {
      error.value = result.error;
      return;
    }
  }

  async function deleteFolder(folderPath) {
    const confirm = await Swal.fire({
      title: 'Delete Folder?',
      text: `This will remove ${folderPath} and its files for everyone in the room.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#F472B6',
      background: '#FFFDF5',
      color: '#1E293B'
    });

    if (!confirm.isConfirmed) return;
    const result = yjsService.deleteFolder(folderPath);
    if (!result.ok) {
      error.value = result.error;
      return;
    }
  }

  function saveCurrentFile() {
    if (!activeFile.value) return;
    const result = yjsService.saveFile(activeFile.value);
    if (!result.ok) {
      error.value = result.error;
      return;
    }
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

  onBeforeUnmount(() => {
    if (stopFilesObserver) stopFilesObserver();
    if (stopFoldersObserver) stopFoldersObserver();
    if (stopTextObserver) stopTextObserver();
    if (stopSavedObserver) stopSavedObserver();
    yjsService.dispose();
    socketService.disconnect();
  });

  return {
    store,
    loading,
    error,
    joined,
    isCreator,
    creatorRoomInfo,
    content,
    files,
    folders,
    explorerTree,
    activeFile,
    savedAt,
    dirty,
    canJoin,
    canCreate,
    bindLifecycle,
    joinRoom,
    createPrivateRoom,
    generateRoomId,
    updateContent,
    selectFile,
    createFile,
    createFolder,
    renameFile,
    deleteFile,
    deleteFolder,
    saveCurrentFile
  };
}
