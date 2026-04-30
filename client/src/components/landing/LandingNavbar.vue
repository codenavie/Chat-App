<template>
  <header class="sticky top-0 z-40 border-b border-borderc/60 bg-bgmain/90 backdrop-blur">
    <div class="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="font-display text-2xl text-ink">DevCollab</RouterLink>

      <nav class="hidden items-center gap-5 md:flex">
        <a href="#home" class="text-sm text-textmuted transition-colors hover:text-ink">Home</a>
        <a href="#features" class="text-sm text-textmuted transition-colors hover:text-ink">Features</a>
        <a href="#about" class="text-sm text-textmuted transition-colors hover:text-ink">About</a>
      </nav>

      <div class="flex items-center gap-2">
        <button class="ui-btn ui-btn-muted px-2 py-1" type="button" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="$emit('toggle-theme')">
          <Sun v-if="theme === 'dark'" class="h-4 w-4" :stroke-width="2" />
          <Moon v-else class="h-4 w-4" :stroke-width="2" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Moon, Sun } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

defineProps({
  theme: {
    type: String,
    default: 'light'
  }
});

defineEmits(['toggle-theme']);
</script>
