<template>
  <BaseCard title="Shared Document" status="CRDT LIVE">
    <textarea
      :value="modelValue"
      class="min-h-[420px] w-full resize-y rounded-xl border-none bg-muted p-4 font-mono text-sm leading-6 text-ink shadow-recessed outline-none focus:ring-2 focus:ring-accent/50"
      placeholder="Start collaborating in real-time..."
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </BaseCard>
</template>

<script setup>
import BaseCard from './BaseCard.vue';

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>
