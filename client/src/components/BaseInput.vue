<template>
  <label class="block">
    <span class="mb-2 block text-xs font-bold uppercase tracking-wider text-ink">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      class="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-accent focus:shadow-pop"
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
  },
  type: {
    type: String,
    default: 'text'
  }
});

defineEmits(['update:modelValue']);
</script>
