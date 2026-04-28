<template>
  <BaseCard title="Presence" :status="`${users.length} ACTIVE`">
    <ul class="space-y-2">
      <li
        v-for="(user, index) in users"
        :key="user.id"
        class="flex items-center justify-between rounded-lg border-2 border-ink bg-white px-3 py-2"
        :class="index % 3 === 0 ? 'shadow-[4px_4px_0px_0px_#F472B6]' : index % 3 === 1 ? 'shadow-[4px_4px_0px_0px_#FBBF24]' : 'shadow-[4px_4px_0px_0px_#34D399]'"
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
