<template>
  <section id="sync" class="space-y-5">
    <p class="font-mono text-xs uppercase tracking-[0.14em] text-accent">// sync-stream</p>
    <h2 class="font-display text-4xl tracking-tight text-ink sm:text-5xl">Collaboration at the speed of thought</h2>

    <div class="relative overflow-hidden rounded-2xl border border-borderc bg-panel">
      <img :src="featureImage" alt="Abstract glass fiber network" class="h-72 w-full object-cover sm:h-96" loading="lazy" />
      <span class="absolute left-4 top-4 rounded-full border border-borderc bg-panel/80 px-3 py-1 font-mono text-xs text-ink backdrop-blur">2 devs editing</span>
      <span class="absolute right-4 top-4 rounded-full border border-borderc bg-panel/80 px-3 py-1 font-mono text-xs text-ink backdrop-blur">auto-synced</span>
    </div>

    <div class="grid gap-px rounded-2xl bg-borderc/30 md:grid-cols-3">
      <article v-for="item in items" :key="item.title" class="group border border-transparent bg-panel p-5 transition-all duration-300 hover:border-accent/35 hover:bg-muted">
        <component :is="item.icon" class="h-5 w-5 text-textmuted transition-colors group-hover:text-accent" />
        <h3 class="mt-3 font-display text-2xl text-ink">{{ item.title }}</h3>
        <p class="mt-2 font-mono text-xs leading-relaxed text-textmuted">{{ item.desc }}</p>
        <p class="mt-3 font-mono text-xs text-accent">{{ item.code }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { GitMerge, GitPullRequest, MessageSquare } from 'lucide-vue-next';

defineProps({
  featureImage: {
    type: String,
    default: ''
  }
});

const items = [
  { icon: GitMerge, title: 'Instant Merge', desc: 'Conflicts resolved in real-time while both contributors type in parallel.', code: 'git sync --live' },
  { icon: MessageSquare, title: 'Inline Threads', desc: 'Comment on any line and keep technical decisions pinned to context.', code: 'thread.attach(L:42)' },
  { icon: GitPullRequest, title: 'Live Reviews', desc: 'Review PR-ready changes together without waiting for async handoffs.', code: 'pr.review --sync' }
];
</script>
