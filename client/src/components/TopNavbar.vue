<template>
  <header class="w-full border-b border-borderc/70 bg-panel backdrop-blur-xl">
    <div class="mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">Real Time Playground</p>
        <h1 class="font-display text-3xl tracking-tight text-ink sm:text-4xl">Developer Collaboration Platform</h1>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <div class="status-pill flex items-center gap-2">
          <span class="relative inline-flex h-2.5 w-2.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70"></span>
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <span>ONLINE · {{ sessions }} sessions</span>
        </div>

        <span class="hidden h-6 w-px bg-borderc md:block" aria-hidden="true"></span>

        <button class="ui-btn ui-btn-muted px-2 py-1" type="button" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" class="h-4 w-4" :stroke-width="2" />
          <Moon v-else class="h-4 w-4" :stroke-width="2" />
        </button>

        <span class="hidden h-6 w-px bg-borderc md:block" aria-hidden="true"></span>

        <button
          v-if="showBackSecure"
          type="button"
          class="font-mono text-xs text-textmuted underline decoration-borderc underline-offset-4 transition-colors hover:text-ink"
          @click="$emit('back-secure')"
        >
          Back to Secure Room Access
        </button>

        <button
          v-if="showReturnLink"
          type="button"
          class="font-mono text-xs text-textmuted underline decoration-borderc underline-offset-4 transition-colors hover:text-ink"
          @click="$emit('return')"
        >
          Return to Landing Page
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { Moon, Sun } from 'lucide-vue-next';

defineEmits(['return', 'back-secure']);

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
  sessions: {
    type: Number,
    default: 14
  },
  showReturnLink: {
    type: Boolean,
    default: false
  },
  showBackSecure: {
    type: Boolean,
    default: false
  }
});
</script>
