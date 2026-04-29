<template>
  <BaseCard title="Presence" :status="`${users.length} ACTIVE`">
    <div v-if="activityFeed.length" class="mb-3 space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
      <p v-if="activityFeed[0]" class="text-xs text-textmuted">
        {{ activityFeed[0].username }} {{ activityFeed[0].action }} <span class="font-mono">{{ activityFeed[0].target }}</span>
      </p>
    </div>
    <ul class="space-y-2">
      <li
        v-for="user in users"
        :key="user.id"
        class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 shadow-sticker"
      >
        <span class="text-sm font-medium text-ink">{{ user.username }}</span>
        <span class="font-mono text-xs text-textmuted">{{ user.id.slice(0, 6) }}</span>
      </li>
    </ul>
  </BaseCard>
</template>

<script setup>
import BaseCard from './BaseCard.vue';

defineProps({
  users: {
    type: Array,
    default: () => []
  },
  activityFeed: {
    type: Array,
    default: () => []
  }
});
</script>
