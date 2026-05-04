<template>
  <section id="home" class="landing-grid-bg rounded-2xl border border-borderc/70 px-4 py-10 sm:px-8 sm:py-14">
    <div class="grid min-h-[78vh] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full border border-borderc bg-panel px-3 py-1">
          <span class="h-2 w-2 animate-pulse rounded-full bg-accent"></span>
          <span class="font-mono text-xs text-textmuted">v2.0 - Now in Public Beta</span>
        </div>
        <h1 class="font-display text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl">
          Code together.
          <span class="text-textmuted"> Ship faster.</span>
        </h1>
        <p class="max-w-md font-mono text-sm leading-relaxed text-textmuted">
          Realtime rooms for engineering teams to edit, review, chat, and deliver in one secure workspace.
        </p>
        <div class="flex flex-wrap gap-3">
          <RouterLink to="/app" class="ui-btn ui-btn-primary inline-flex items-center gap-2 font-mono text-xs">
            Start Building <ArrowRight class="h-4 w-4" />
          </RouterLink>
          <a href="#docs" class="ui-btn ui-btn-muted inline-flex items-center gap-2 font-mono text-xs">
            View Docs <Terminal class="h-4 w-4" />
          </a>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex -space-x-2">
            <span class="h-8 w-8 rounded-full border border-borderc bg-panel text-center font-mono text-xs leading-8 text-ink">AL</span>
            <span class="h-8 w-8 rounded-full border border-borderc bg-panel text-center font-mono text-xs leading-8 text-ink">VN</span>
            <span class="h-8 w-8 rounded-full border border-borderc bg-panel text-center font-mono text-xs leading-8 text-ink">QT</span>
            <span class="h-8 w-8 rounded-full border border-borderc bg-panel text-center font-mono text-xs leading-8 text-ink">KR</span>
          </div>
          <p class="font-mono text-xs text-textmuted">12,000+ developers</p>
        </div>
      </div>

      <aside class="relative overflow-hidden rounded-2xl border border-borderc bg-panel">
        <img :src="heroImage" alt="Abstract collaboration visual" class="aspect-square w-full object-cover" loading="lazy" />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bgmain/70 to-transparent" aria-hidden="true"></div>
        <div class="absolute bottom-4 left-4 right-4 rounded-xl border border-borderc bg-bgmain/85 p-3 backdrop-blur">
          <div class="mb-2 flex gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-amber-300"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <pre class="font-mono text-xs text-textmuted">const room = await sync.join("devsync");
room.observe("main.js", liveReview);</pre>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ArrowRight, Terminal } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

defineProps({
  heroImage: {
    type: String,
    default: ''
  }
});
</script>
