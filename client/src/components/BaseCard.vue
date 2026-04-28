<template>
  <div class="play-card p-5">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-display text-lg font-extrabold">{{ title }}</h2>
      <span v-if="status" class="status-pill bg-muted">{{ status }}</span>
    </div>
    <div class="play-pattern mb-4"></div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: ''
  }
});
</script>
