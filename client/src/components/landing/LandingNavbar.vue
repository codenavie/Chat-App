<template>
  <header :class="['fixed inset-x-0 top-0 z-50 transition-all duration-300', scrolled ? 'border-b border-borderc bg-bgmain/80 backdrop-blur-xl' : 'bg-transparent']">
    <div class="mx-auto flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-2">
        <span class="rounded-md border border-borderc bg-panel px-2 py-1 font-mono text-xs text-ink">/&gt;</span>
        <span class="font-display text-xl text-ink">devSync</span>
      </RouterLink>

      <nav class="hidden items-center gap-6 md:flex">
        <a href="#features" class="font-mono text-xs text-textmuted transition-colors hover:text-ink">Features</a>
        <a href="#sync" class="font-mono text-xs text-textmuted transition-colors hover:text-ink">Sync</a>
        <a href="#docs" class="font-mono text-xs text-textmuted transition-colors hover:text-ink">Docs</a>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <RouterLink to="/app" class="ui-btn ui-btn-primary px-3 py-2 font-mono text-xs">Get Started</RouterLink>
        <button class="ui-btn ui-btn-muted px-2 py-1" type="button" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="$emit('toggle-theme')">
          <Sun v-if="theme === 'dark'" class="h-4 w-4" :stroke-width="2" />
          <Moon v-else class="h-4 w-4" :stroke-width="2" />
        </button>
      </div>

      <button class="ui-btn ui-btn-muted px-2 py-1 md:hidden" type="button" :aria-label="open ? 'Close menu' : 'Open menu'" @click="open = !open">
        <X v-if="open" class="h-4 w-4" />
        <Menu v-else class="h-4 w-4" />
      </button>
    </div>

    <div v-if="open" class="border-t border-borderc bg-bgmain/95 px-4 py-3 backdrop-blur md:hidden">
      <nav class="flex flex-col gap-2">
        <a href="#features" class="font-mono text-xs text-textmuted hover:text-ink" @click="open = false">Features</a>
        <a href="#sync" class="font-mono text-xs text-textmuted hover:text-ink" @click="open = false">Sync</a>
        <a href="#docs" class="font-mono text-xs text-textmuted hover:text-ink" @click="open = false">Docs</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Menu, Moon, Sun, X } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

defineProps({
  theme: {
    type: String,
    default: 'light'
  }
});

defineEmits(['toggle-theme']);

const scrolled = ref(false);
const open = ref(false);

function onScroll() {
  scrolled.value = window.scrollY > 20;
}

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>
