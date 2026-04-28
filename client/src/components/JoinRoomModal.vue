<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
    <div class="play-card w-full max-w-md p-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-display text-2xl font-extrabold">Join Private Room</h3>
        <button class="rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-bold shadow-pop active:shadow-pop-active" @click="$emit('close')">Close</button>
      </div>

      <div class="play-pattern mb-4"></div>

      <div class="space-y-3">
        <BaseInput v-model="nameValue" label="Your Name" placeholder="e.g. Alex" :max-length="24" />
        <BaseInput v-model="roomValue" label="Room ID" placeholder="Enter room ID" :max-length="24" />
        <BaseInput v-model="passwordValue" type="password" label="Room Password" placeholder="Enter room password" :max-length="64" />

        <p v-if="error" class="rounded-lg border-2 border-ink bg-secondary/25 px-3 py-2 text-xs font-medium text-ink shadow-pop">
          {{ error }}
        </p>

        <BaseButton :disabled="loading || !canJoin" @click="submitJoin">
          {{ loading ? 'Joining...' : 'Join Room' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  roomId: { type: String, default: '' },
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
});

const emit = defineEmits(['close', 'join']);

const roomValue = ref('');
const nameValue = ref('');
const passwordValue = ref('');

const canJoin = computed(() => roomValue.value.trim().length >= 3 && nameValue.value.trim().length >= 2 && passwordValue.value.length >= 6);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      roomValue.value = props.roomId || '';
      nameValue.value = props.username || '';
      passwordValue.value = props.password || '';
    }
  },
  { immediate: true }
);

function submitJoin() {
  emit('join', {
    roomId: roomValue.value.trim(),
    username: nameValue.value.trim(),
    password: passwordValue.value
  });
}
</script>
