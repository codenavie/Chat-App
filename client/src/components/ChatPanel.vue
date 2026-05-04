<template>
  <section class="flex h-[420px] flex-col bg-panel">
    <div class="flex items-center justify-between border-b border-borderc px-3 py-2">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-textmuted">Room Chat</p>
      <span class="inline-flex items-center gap-1 rounded-full border border-borderc px-2 py-0.5 font-mono text-[10px] text-textmuted">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>LIVE
      </span>
    </div>

    <div ref="messageBox" class="flex-1 space-y-2 overflow-y-auto bg-[#0d0d0f] px-3 py-3">
      <p v-if="messages.length === 0" class="mt-8 text-center font-mono text-xs italic text-textmuted">No messages yet. Start collaborating.</p>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="group rounded-lg border border-borderc bg-panel p-2 text-xs"
      >
        <div class="flex items-center gap-2">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] text-white" :style="{ backgroundColor: avatarColor(msg.username) }">{{ initials(msg.username) }}</span>
          <p class="font-mono text-xs text-ink">{{ msg.username }}</p>
          <span class="font-mono text-[10px] text-textmuted">{{ formatTime(msg.createdAt) }}</span>
          <div class="ml-auto hidden gap-1 text-[10px] group-hover:flex">
            <button>👍</button><button>❤️</button><button>🚀</button>
          </div>
        </div>
        <p class="mt-1 break-words font-mono text-xs text-ink/90">{{ msg.message }}</p>
      </div>
    </div>

    <div class="sticky bottom-0 border-t border-borderc bg-panel px-3 py-2">
      <div class="flex items-center gap-2">
        <input
          :value="modelValue"
          class="ui-input flex-1 rounded-lg px-3 py-2 font-mono text-sm"
          placeholder="Message the room"
          aria-label="Message the room"
          @input="$emit('update:modelValue', $event.target.value)"
          @keydown.enter.prevent="$emit('send')"
        />
        <button class="rounded bg-accent px-3 py-2 font-mono text-xs text-white transition hover:brightness-110" @click="$emit('send')">Send</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, watch, ref } from 'vue';

const props = defineProps({
  messages: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
  currentUsername: { type: String, default: '' }
});

defineEmits(['update:modelValue', 'send']);

const messageBox = ref(null);
const palette = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

function avatarColor(name = '') {
  const seed = (name.charCodeAt(0) || 65) + (name.charCodeAt(1) || 0);
  return palette[seed % palette.length];
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    if (messageBox.value) {
      messageBox.value.scrollTop = messageBox.value.scrollHeight;
    }
  }
);
</script>
