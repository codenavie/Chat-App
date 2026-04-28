<template>
  <BaseCard title="Presence Grid" :status="`${users.length} ACTIVE`">
    <ul class="space-y-2">
      <li
        v-for="user in users"
        :key="user.id"
        class="flex items-center justify-between rounded-lg bg-muted px-3 py-2 shadow-recessed"
      >
        <span class="text-sm font-medium">{{ user.username }}</span>
        <span class="font-mono text-xs text-ink/70">{{ user.id.slice(0, 6) }}</span>
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
  }
});
</script>
