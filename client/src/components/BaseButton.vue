<template>
  <button
    class="ui-btn ui-btn-primary w-full font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
