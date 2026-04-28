<template>
  <header class="play-card mb-6 overflow-hidden px-6 py-5">
    <div class="absolute -left-10 -top-10 h-24 w-24 rounded-full border-2 border-ink bg-tertiary"></div>
    <div class="absolute -bottom-8 right-4 h-16 w-16 rounded-[24px] border-2 border-ink bg-secondary"></div>
    <div class="relative flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.2em] text-ink/70">Real-Time Playground</p>
        <h1 class="font-display text-2xl font-extrabold">Developer Collaboration Platform</h1>
      </div>
      <div class="status-pill flex items-center gap-2 bg-white">
        <span class="h-2.5 w-2.5 rounded-full" :class="online ? 'bg-quaternary' : 'bg-slate-400'" />
        <span>{{ online ? 'ONLINE' : 'OFFLINE' }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  online: {
    type: Boolean,
    default: false
  }
});
</script>
