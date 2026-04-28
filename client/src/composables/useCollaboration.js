import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useCollabStore } from '../store/collabStore';
import socketService from '../services/socketService';
import yjsService from '../services/yjsService';

const roomRegex = /^[A-Za-z0-9_-]{3,24}$/;

export function useCollaboration() {
  const store = useCollabStore();
  const loading = ref(false);
  const content = ref('');
  const socket = ref(null);
  let stopObserver = null;

  const canJoin = computed(() => roomRegex.test(store.roomId) && store.username.trim().length >= 2);

  function bindLifecycle() {
    socket.value = socketService.connect();

    socket.value.on('connect', () => store.setConnected(true));
    socket.value.on('disconnect', () => store.setConnected(false));
    socket.value.on('presence:update', ({ users }) => store.setUsers(users));
  }

  async function joinRoom() {
    if (!canJoin.value || !socket.value) return;

    loading.value = true;
    const payload = { roomId: store.roomId.trim(), username: store.username.trim().slice(0, 24) };

    await new Promise((resolve) => {
      socket.value.emit('room:join', payload, (ack) => {
        if (ack?.ok) {
          store.setSession(payload);
          const yText = yjsService.init(payload.roomId);
          if (stopObserver) stopObserver();
          stopObserver = yjsService.onTextChange((value) => {
            content.value = value;
          });
          content.value = yText.toString();
        }
        resolve();
      });
    });

    loading.value = false;
  }

  function updateContent(nextValue) {
    content.value = nextValue;
    yjsService.setText(nextValue);
  }

  watch(() => store.roomId, (value) => {
    store.setSession({ roomId: value.toUpperCase().replace(/\s+/g, '-') });
  });

  onBeforeUnmount(() => {
    if (stopObserver) stopObserver();
    yjsService.dispose();
    socketService.disconnect();
  });

  return {
    store,
    loading,
    content,
    canJoin,
    bindLifecycle,
    joinRoom,
    updateContent
  };
}
