<template>
  <section class="space-y-6">
    <TopNavbar :online="store.connected" />

    <div
      class="grid gap-6"
      :class="joined ? 'lg:grid-cols-[minmax(0,1fr)_290px]' : 'mx-auto max-w-xl lg:grid-cols-1'"
    >
      <RoomJoinPanel
        v-if="!joined"
        v-model:room-id="store.roomId"
        v-model:username="store.username"
        v-model:password="store.password"
        :loading="loading"
        :error="error"
        :can-join="canJoin"
        :can-create="canCreate"
        @create="createPrivateRoom"
        @generate="generateRoomId"
        @open-join="joinModalOpen = true"
      />

      <EditorPanel
        v-if="joined"
        :model-value="content"
        :explorer-tree="explorerTree"
        :active-file="activeFile"
        :dirty="dirty"
        @update:model-value="updateContent"
        @select-file="selectFile"
        @create-file="createFile"
        @create-folder="createFolder"
        @rename-file="renameFile"
        @delete-file="deleteFile"
        @delete-folder="deleteFolder"
        @save-file="saveCurrentFile"
      />

      <div v-if="joined" class="space-y-4">
        <div v-if="isCreator" class="play-card p-4">
          <h3 class="font-display text-lg font-extrabold">Room Credentials</h3>
          <div class="play-pattern my-3"></div>
          <p class="text-xs font-bold uppercase tracking-wider text-ink/70">Room ID</p>
          <div class="mb-3 flex gap-2">
            <p class="flex-1 rounded-lg border-2 border-ink bg-white px-3 py-2 font-mono text-sm">{{ creatorRoomInfo.roomId }}</p>
            <button
              class="rounded-full border-2 border-ink bg-tertiary px-3 py-2 text-xs font-bold shadow-pop active:shadow-pop-active"
              @click="copyToClipboard(creatorRoomInfo.roomId, 'Room ID copied')"
            >
              Copy
            </button>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-ink/70">Password</p>
          <div class="flex gap-2">
            <p class="flex-1 rounded-lg border-2 border-ink bg-white px-3 py-2 font-mono text-sm">{{ creatorRoomInfo.password }}</p>
            <button
              class="rounded-full border-2 border-ink bg-secondary px-3 py-2 text-xs font-bold shadow-pop active:shadow-pop-active"
              @click="copyToClipboard(creatorRoomInfo.password, 'Password copied')"
            >
              Copy
            </button>
          </div>
        </div>

        <PresencePanel :users="store.users" />
      </div>
    </div>

    <JoinRoomModal
      :open="joinModalOpen"
      :room-id="store.roomId"
      :username="store.username"
      :password="store.password"
      :loading="loading"
      :error="error"
      @close="joinModalOpen = false"
      @join="handleJoinFromModal"
    />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import EditorPanel from '../components/EditorPanel.vue';
import JoinRoomModal from '../components/JoinRoomModal.vue';
import PresencePanel from '../components/PresencePanel.vue';
import RoomJoinPanel from '../components/RoomJoinPanel.vue';
import TopNavbar from '../components/TopNavbar.vue';
import { useCollaboration } from '../composables/useCollaboration';

const {
  store,
  loading,
  error,
  joined,
  isCreator,
  creatorRoomInfo,
  content,
  explorerTree,
  activeFile,
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
} = useCollaboration();

const joinModalOpen = ref(false);

async function handleJoinFromModal(form) {
  await joinRoom(form);
  if (!error.value) {
    joinModalOpen.value = false;
  }
}

async function copyToClipboard(value, label) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  Swal.fire({
    icon: 'success',
    title: label,
    timer: 1200,
    showConfirmButton: false,
    background: '#f0f2f5',
    color: '#2d3436'
  });
}

onMounted(() => {
  bindLifecycle();
});
</script>
