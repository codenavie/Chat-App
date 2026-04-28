<template>
  <BaseCard title="Secure Room Access" status="PRIVATE">
    <div class="space-y-4">
      <BaseButton :disabled="loading" @click="emit('generate')">
        Generate Room ID
      </BaseButton>
      <BaseInput v-model="roomValue" label="Room ID" placeholder="Generate above, or enter your own" :max-length="24" />
      <BaseInput v-model="nameValue" label="Your Name" placeholder="e.g. Alex" :max-length="24" />
      <BaseInput v-model="passwordValue" type="password" label="Room Password" placeholder="At least 6 characters" :max-length="64" />

      <p v-if="error" class="rounded-lg border-2 border-ink bg-secondary/25 px-3 py-2 text-xs font-medium text-ink shadow-pop">
        {{ error }}
      </p>

      <div class="grid grid-cols-1 gap-2">
        <BaseButton :disabled="loading || !canCreate" @click="submitCreate">
          {{ loading ? 'Working...' : 'Create Private Room' }}
        </BaseButton>
        <button
          class="w-full rounded-full border-2 border-ink bg-transparent px-4 py-3 font-bold text-ink transition-all duration-300 hover:bg-tertiary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop active:translate-x-0.5 active:translate-y-0.5"
          :disabled="loading"
          @click="emit('open-join')"
        >
          Join Existing Private Room
        </button>
      </div>
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
  password: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  canJoin: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false }
});

const emit = defineEmits(['update:roomId', 'update:username', 'update:password', 'join', 'create', 'generate', 'open-join']);

const roomValue = ref(props.roomId);
const nameValue = ref(props.username);
const passwordValue = ref(props.password);

watch(roomValue, (v) => emit('update:roomId', v));
watch(nameValue, (v) => emit('update:username', v));
watch(passwordValue, (v) => emit('update:password', v));
watch(() => props.roomId, (v) => { roomValue.value = v; });
watch(() => props.username, (v) => { nameValue.value = v; });
watch(() => props.password, (v) => { passwordValue.value = v; });

function submitCreate() {
  emit('create');
}
</script>
