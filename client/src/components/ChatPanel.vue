<template>
  <div class="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-sticker backdrop-blur-md">
    <div class="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-2">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-full bg-accent/40"></div>
        <div>
          <p class="text-sm font-semibold text-ink">Room Chat</p>
          <p class="text-[10px] text-textmuted">Live collaboration</p>
        </div>
      </div>
      <span class="status-pill">LIVE</span>
    </div>

    <div ref="messageBox" class="h-64 space-y-2 overflow-y-auto bg-black/20 px-3 py-3">
      <p v-if="messages.length === 0" class="text-xs text-textmuted">No messages yet.</p>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="max-w-[85%] rounded-xl border px-3 py-2 text-xs"
        :class="msg.username === currentUsername ? 'ml-auto border-accent/40 bg-accent/20 text-ink' : 'border-white/10 bg-white/[0.08] text-ink'"
      >
        <p class="mb-1 text-[10px] font-semibold" :class="msg.username === currentUsername ? 'text-indigo-200' : 'text-textmuted'">
          {{ msg.username }}
        </p>
        <p class="break-words leading-5">{{ msg.message }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2 border-t border-white/10 bg-white/[0.04] px-3 py-2">
      <input
        :value="modelValue"
        class="ui-input flex-1 rounded-full px-3 py-2 text-sm"
        placeholder="Message the room"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.enter.prevent="$emit('send')"
      />
      <button class="ui-btn ui-btn-primary px-3 py-1.5 text-xs font-semibold" @click="$emit('send')">Send</button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';

const props = defineProps({
  messages: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
  currentUsername: { type: String, default: '' }
});

defineEmits(['update:modelValue', 'send']);

const messageBox = ref(null);

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
