<template>
  <BaseCard title="Join Room" status="ACCESS">
    <div class="space-y-4">
      <BaseInput v-model="roomValue" label="Room ID" placeholder="e.g. TEAM-01" :max-length="24" />
      <BaseInput v-model="nameValue" label="Your Name" placeholder="e.g. Alex" :max-length="24" />
      <BaseButton :disabled="loading" @click="submitJoin">
        {{ loading ? 'Joining...' : 'Join Workspace' }}
      </BaseButton>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseCard from './BaseCard.vue';
import BaseInput from './BaseInput.vue';

const props = defineProps({
  roomId: { type: String, default: '' },
  username: { type: String, default: '' },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:roomId', 'update:username', 'join']);

const roomValue = ref(props.roomId);
const nameValue = ref(props.username);

watch(roomValue, (v) => emit('update:roomId', v));
watch(nameValue, (v) => emit('update:username', v));
watch(() => props.roomId, (v) => { roomValue.value = v; });
watch(() => props.username, (v) => { nameValue.value = v; });

function submitJoin() {
  emit('join');
}
</script>
