<template>
  <section
    class="space-y-6 pb-6"
    :class="!joined ? 'min-h-screen bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_60%)]' : ''"
  >
    <TopNavbar
      :sessions="sessionCount"
      :show-return-link="!joined"
      :show-back-secure="joined"
      @return="goToLanding"
      @back-secure="backToSecureAccess"
    />

    <div
      class="grid gap-6"
      :class="joined ? 'lg:grid-cols-1' : 'mx-auto max-w-3xl lg:grid-cols-1'"
    >
      <RoomJoinPanel
        v-if="!joined"
        v-model:room-id="store.roomId"
        v-model:username="store.username"
        v-model:password="store.password"
        :loading="loading"
        :error="error"
        :can-create="canCreate"
        @create="createPrivateRoom"
        @generate="generateRoomId"
        @open-join="joinModalOpen = true"
      />

      <div v-if="joined" class="overflow-hidden rounded-xl border border-borderc bg-panel">
        <div class="flex h-10 items-center justify-between border-b border-borderc bg-[#0d0d0f] px-3">
          <div class="flex items-center gap-1.5" aria-hidden="true">
            <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
          </div>
          <p class="font-mono text-[11px] text-textmuted">devSync / {{ store.roomId || 'room' }} / {{ activeFile || 'main.js' }}</p>
          <div class="flex items-center gap-2">
            <button class="rounded border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-xs text-emerald-300">Run</button>
            <span class="h-5 w-px bg-borderc"></span>
            <div class="status-pill flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>ONLINE</span>
            </div>
          </div>
        </div>

        <div class="flex h-7 items-center justify-between border-b border-borderc bg-panel px-3">
          <div class="flex items-center gap-3 font-mono text-[11px] text-textmuted">
            <span class="cursor-default hover:text-ink">File</span>
            <span class="cursor-default hover:text-ink">Edit</span>
            <span class="cursor-default hover:text-ink">View</span>
            <span class="cursor-default hover:text-ink">Run</span>
            <span class="cursor-default hover:text-ink">Collaborate</span>
          </div>
          <span class="rounded border border-borderc px-2 py-0.5 font-mono text-[10px] text-textmuted">{{ store.roomId || 'ROOM' }}</span>
        </div>

        <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
          <EditorPanel
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
            @caret-change="handleLocalCaret"
            @caret-leave="hideCaretPresence"
          />

          <div class="border-t border-borderc lg:border-l lg:border-t-0">
            <PresencePanel :users="store.users" :activity-feed="activityFeed" :active-file="activeFile" />
            <ChatPanel v-model="chatInput" :messages="chatMessages" :current-username="store.username" @send="sendChatMessage" />
          </div>
        </div>

        <div class="flex h-7 items-center justify-between border-t border-borderc bg-panel px-3" aria-live="polite">
          <div class="flex items-center gap-4 font-mono text-[10px] text-textmuted">
            <span>main</span>
            <span>0 errors</span>
            <span>0 warnings</span>
          </div>
          <span class="font-mono text-[10px] text-textmuted">{{ store.roomId || 'ROOM' }}</span>
          <div class="flex items-center gap-4 font-mono text-[10px] text-textmuted">
            <span>JavaScript</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>Ln {{ localLine }}, Col {{ localColumn }}</span>
            <span>Spaces: 2</span>
          </div>
        </div>
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
import { onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
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
  content,
  explorerTree,
  activeFile,
  dirty,
  chatMessages,
  chatInput,
  activityFeed,
  remoteCursors,
  remoteCarets,
  canCreate,
  bindLifecycle,
  joinRoom,
  leaveRoom,
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
const router = useRouter();
const sessionCount = ref(14);
const localLine = ref(1);
const localColumn = ref(1);

function goToLanding() {
  router.push('/');
}

async function backToSecureAccess() {
  await leaveRoom();
}

function handleLocalCaret(payload) {
  localLine.value = payload?.line || 1;
  localColumn.value = payload?.column || 1;
  updateCaretPosition(payload);
}

watchEffect(() => {
  sessionCount.value = Math.max(14, (store.activeCount || 0) * 7);
});

async function handleJoinFromModal(form) {
  await joinRoom(form);
  if (!error.value) {
    joinModalOpen.value = false;
  }
}

onMounted(() => {
  // Attach all socket listeners once when the workspace view loads.
  bindLifecycle();
});
</script>

