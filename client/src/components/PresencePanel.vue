<template>
  <section class="border-b border-borderc bg-panel">
    <div class="flex items-center justify-between border-b border-borderc px-3 py-2">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-textmuted">Presence</p>
      <span class="inline-flex items-center gap-1 rounded-full border border-borderc px-2 py-0.5 font-mono text-[10px] text-textmuted">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{{ users.length }} ACTIVE
      </span>
    </div>

    <ul class="space-y-1 p-2">
      <li v-for="user in users" :key="user.id" class="rounded border border-borderc bg-panel px-2 py-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] text-white" :style="{ backgroundColor: avatarColor(user.username) }">{{ initials(user.username) }}</span>
            <div>
              <p class="font-mono text-xs text-ink">{{ user.username }}</p>
              <p class="font-mono text-[10px] text-textmuted">editing {{ activeFile || 'main.js' }} · Ln {{ lineFor(user.id) }}</p>
            </div>
          </div>
          <span class="font-mono text-[10px] text-textmuted">{{ user.id.slice(0, 6) }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
const props = defineProps({
  users: { type: Array, default: () => [] },
  activityFeed: { type: Array, default: () => [] },
  activeFile: { type: String, default: '' }
});

const palette = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

function avatarColor(name = '') {
  const seed = (name.charCodeAt(0) || 65) + (name.charCodeAt(1) || 0);
  return palette[seed % palette.length];
}

function lineFor(userId) {
  const entry = props.activityFeed.find((a) => a.userId === userId);
  if (!entry) return 1;
  return ((entry.ts || 0) % 40) + 1;
}
</script>
