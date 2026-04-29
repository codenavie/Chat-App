<template>
  <label class="block">
    <span class="mb-2 block text-xs font-mono uppercase tracking-[0.16em] text-textmuted">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      class="ui-input text-sm"
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
