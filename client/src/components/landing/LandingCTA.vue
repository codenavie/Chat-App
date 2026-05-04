<template>
  <section id="initialize" class="relative overflow-hidden rounded-2xl border border-borderc bg-panel p-8">
    <img :src="ctaImage" alt="Abstract light grid in dark space" class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10" loading="lazy" />
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-bgmain/80 via-bgmain/60 to-bgmain"></div>

    <div class="relative mx-auto max-w-3xl text-center">
      <p class="font-mono text-xs uppercase tracking-[0.14em] text-accent">// initialize</p>
      <h2 class="mt-3 font-display text-5xl text-ink">Build in the open, together.</h2>

      <div class="mx-auto mt-6 max-w-2xl rounded-xl border border-borderc bg-panel/60 transition-colors focus-within:border-accent/60 focus-within:bg-panel">
        <div class="flex items-center gap-2 border-b border-borderc px-4 py-2">
          <span class="h-2 w-2 rounded-full bg-red-400"></span>
          <span class="h-2 w-2 rounded-full bg-amber-300"></span>
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span class="ml-2 font-mono text-[11px] text-textmuted">terminal</span>
        </div>
        <form class="flex flex-wrap items-center gap-2 px-4 py-3 sm:flex-nowrap" @submit.prevent>
          <span class="font-mono text-xs text-textmuted">$ contributor@devSync:~</span>
          <input class="ui-input h-9 flex-1 px-3 py-1.5 font-mono text-xs" type="text" placeholder="Share your GitHub handle" />
          <button class="ui-btn ui-btn-primary inline-flex h-9 items-center justify-center px-3 py-1.5" type="submit" aria-label="Join collaboration">
            <ArrowRight class="h-4 w-4" />
          </button>
        </form>
      </div>
      <p class="mt-4 font-mono text-xs text-textmuted">
        Open source first - Free for everyone - Community maintained
      </p>
    </div>
  </section>
</template>

<script setup>
import { ArrowRight } from 'lucide-vue-next';

defineProps({
  ctaImage: {
    type: String,
    default: ''
  }
});
</script>
