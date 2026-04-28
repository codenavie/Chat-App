<template>
  <section class="space-y-6">
    <TopNavbar :online="store.connected" />

    <div class="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_280px]">
      <RoomJoinPanel
        v-model:room-id="store.roomId"
        v-model:username="store.username"
        :loading="loading"
        @join="joinRoom"
      />

      <EditorPanel :model-value="content" @update:model-value="updateContent" />

      <PresencePanel :users="store.users" />
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import EditorPanel from '../components/EditorPanel.vue';
import PresencePanel from '../components/PresencePanel.vue';
import RoomJoinPanel from '../components/RoomJoinPanel.vue';
import TopNavbar from '../components/TopNavbar.vue';
import { useCollaboration } from '../composables/useCollaboration';

const { store, loading, content, bindLifecycle, joinRoom, updateContent } = useCollaboration();

onMounted(() => {
  bindLifecycle();
});
</script>
