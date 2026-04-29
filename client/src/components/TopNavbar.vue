<template>
  <header class="play-card mb-6 overflow-hidden px-6 py-5">
    <div class="relative flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.15em] text-accent">Real-Time Playground</p>
        <h1 class="font-display text-4xl font-normal tracking-tight text-ink">
          Developer Collaboration Platform
        </h1>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <div
          v-if="isCreator && creatorRoomInfo?.roomId && creatorRoomInfo?.password"
          class="flex flex-wrap items-center gap-2 rounded-md border border-borderc bg-muted px-3 py-1.5"
        >
          <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-textmuted">Room</span>
          <span class="rounded-md border border-borderc bg-panel px-2 py-1 font-mono text-xs text-ink">{{ creatorRoomInfo.roomId }}</span>
          <button class="ui-btn ui-btn-muted px-2 py-1 text-[10px] font-semibold uppercase" @click="$emit('copy-room-id', creatorRoomInfo.roomId)">Copy ID</button>
          <span class="rounded-md border border-borderc bg-panel px-2 py-1 font-mono text-xs text-ink">{{ creatorRoomInfo.password }}</span>
          <button class="ui-btn ui-btn-muted px-2 py-1 text-[10px] font-semibold uppercase" @click="$emit('copy-password', creatorRoomInfo.password)">Copy PW</button>
        </div>

        <div class="status-pill flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :class="online ? 'bg-green-600' : 'bg-slate-400'" />
          <span>{{ online ? 'ONLINE' : 'OFFLINE' }}</span>
        </div>
        <button class="ui-btn ui-btn-muted px-2 py-1" type="button" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" class="h-4 w-4" :stroke-width="2" />
          <Moon v-else class="h-4 w-4" :stroke-width="2" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { Moon, Sun } from 'lucide-vue-next';

defineEmits(['copy-room-id', 'copy-password']);

const theme = ref('light');

function applyTheme(nextTheme) {
  document.documentElement.setAttribute('data-theme', nextTheme);
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
}

onMounted(() => {
  const saved = localStorage.getItem('collab-theme');
  if (saved === 'dark' || saved === 'light') {
    theme.value = saved;
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme.value);
});

watch(theme, (nextTheme) => {
  applyTheme(nextTheme);
  localStorage.setItem('collab-theme', nextTheme);
});

defineProps({
  online: {
    type: Boolean,
    default: false
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  creatorRoomInfo: {
    type: Object,
    default: () => ({
      roomId: '',
      password: ''
    })
  }
});
</script>
