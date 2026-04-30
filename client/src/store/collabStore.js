import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCollabStore = defineStore('collab', () => {
  const roomId = ref('');
  const username = ref('');
  const password = ref('');
  const connected = ref(false);
  const users = ref([]);

  const activeCount = computed(() => users.value.length);

  function setSession(payload) {
    // Partial updates let flows update only roomId or username.
    roomId.value = payload.roomId || roomId.value;
    username.value = payload.username || username.value;
  }

  function setUsers(nextUsers) {
    users.value = Array.isArray(nextUsers) ? nextUsers : [];
  }

  function setConnected(value) {
    connected.value = Boolean(value);
  }

  return {
    roomId,
    username,
    password,
    connected,
    users,
    activeCount,
    setSession,
    setUsers,
    setConnected
  };
});
