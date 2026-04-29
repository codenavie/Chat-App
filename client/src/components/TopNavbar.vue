<template>
  <header class="play-card mb-6 overflow-hidden px-6 py-5">
    <div class="pointer-events-none absolute -left-20 -top-24 h-60 w-60 rounded-full bg-accent/25 blur-3xl"></div>
    <div class="pointer-events-none absolute -right-20 -bottom-24 h-60 w-60 rounded-full bg-indigo-400/20 blur-3xl"></div>

    <div class="relative flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.22em] text-textmuted">Real-Time Playground</p>
        <h1 class="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text font-display text-2xl font-semibold tracking-tight text-transparent">
          Developer Collaboration Platform
        </h1>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <div
          v-if="isCreator && creatorRoomInfo?.roomId && creatorRoomInfo?.password"
          class="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
        >
          <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-textmuted">Room</span>
          <span class="rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">{{ creatorRoomInfo.roomId }}</span>
          <button class="ui-btn ui-btn-muted px-2 py-1 text-[10px] font-semibold uppercase" @click="$emit('copy-room-id', creatorRoomInfo.roomId)">Copy ID</button>
          <span class="rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">{{ creatorRoomInfo.password }}</span>
          <button class="ui-btn ui-btn-muted px-2 py-1 text-[10px] font-semibold uppercase" @click="$emit('copy-password', creatorRoomInfo.password)">Copy PW</button>
        </div>

        <div class="status-pill flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :class="online ? 'bg-emerald-400' : 'bg-slate-500'" />
          <span>{{ online ? 'ONLINE' : 'OFFLINE' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['copy-room-id', 'copy-password']);

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
