<template>
  <header class="industrial-card mb-6 px-6 py-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.2em] text-ink/70">Real-Time Control Deck</p>
        <h1 class="text-xl font-semibold">Industrial Collaboration Platform</h1>
      </div>
      <div class="flex items-center gap-2 rounded-full bg-muted px-3 py-1 shadow-recessed">
        <span :class="['led-dot', { online: online }]" />
        <span class="font-mono text-xs">{{ online ? 'ONLINE' : 'OFFLINE' }}</span>
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
