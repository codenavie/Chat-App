<template>
  <button
    class="w-full rounded-xl bg-panel px-4 py-2 font-medium text-ink shadow-card transition active:translate-y-[1px] active:shadow-pressed disabled:opacity-60"
    :disabled="disabled"
    type="button"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>
