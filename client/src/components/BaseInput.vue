<template>
  <label class="block">
    <span class="mb-2 block text-sm font-medium">{{ label }}</span>
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      class="w-full rounded-xl border-none bg-muted px-4 py-2 font-mono text-sm text-ink shadow-recessed outline-none focus:ring-2 focus:ring-accent/50"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: 64
  }
});

defineEmits(['update:modelValue']);
</script>
