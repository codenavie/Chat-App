<template>
  <button
    class="w-full rounded-full border-2 border-ink bg-accent px-4 py-3 font-bold text-white shadow-pop transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active disabled:opacity-60"
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
