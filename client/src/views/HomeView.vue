<template>
  <section class="space-y-6">
    <TopNavbar
      :online="store.connected"
      :is-creator="isCreator"
      :creator-room-info="creatorRoomInfo"
      @copy-room-id="copyToClipboard($event, 'Room ID copied')"
      @copy-password="copyToClipboard($event, 'Password copied')"
    />

    <div
      class="grid gap-6"
      :class="joined ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'mx-auto max-w-xl lg:grid-cols-1'"
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
        :remote-cursors="remoteCursors"
        :remote-carets="remoteCarets"
        @update:model-value="updateContent"
        @select-file="selectFile"
        @create-file="createFile"
        @create-folder="createFolder"
        @rename-file="renameFile"
        @delete-file="deleteFile"
        @delete-folder="deleteFolder"
        @save-file="saveCurrentFile"
        @cursor-move="updateCursorPosition"
        @cursor-leave="hideCursorPresence"
        @caret-change="updateCaretPosition"
        @caret-leave="hideCaretPresence"
      />

      <div v-if="joined" class="space-y-4">
        <PresencePanel :users="store.users" :activity-feed="activityFeed" />

        <ChatPanel v-model="chatInput" :messages="chatMessages" :current-username="store.username" @send="sendChatMessage" />
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
import ChatPanel from '../components/ChatPanel.vue';
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
  chatMessages,
  chatInput,
  activityFeed,
  remoteCursors,
  remoteCarets,
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
  saveCurrentFile,
  sendChatMessage,
  updateCursorPosition,
  hideCursorPresence,
  updateCaretPosition,
  hideCaretPresence
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
