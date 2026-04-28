<template>
  <div class="industrial-card p-5">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-semibold">{{ title }}</h2>
      <span v-if="status" class="font-mono text-xs uppercase tracking-wide">{{ status }}</span>
    </div>
    <div class="vent-strip mb-4"></div>
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
