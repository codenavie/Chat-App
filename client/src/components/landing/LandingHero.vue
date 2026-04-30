<template>
  <section id="home" class="play-card px-4 py-10 sm:px-8 sm:py-14">
    <div class="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-5">
        <p class="font-mono text-xs uppercase tracking-[0.15em] text-accent">Realtime Developer Workspace</p>
        <h1 class="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl">Code together faster with secure, live collaboration.</h1>
        <p class="max-w-2xl text-lg leading-relaxed text-textmuted">One room for shared editing, file workflows, and teammate awareness. Built to keep distributed teams aligned and shipping.</p>
        <div class="flex flex-wrap gap-3">
          <RouterLink to="/app" class="ui-btn ui-btn-primary min-w-[200px] text-center font-semibold">Get Started</RouterLink>
          <a href="#features" class="ui-btn ui-btn-muted min-w-[170px] text-center font-semibold">View Features</a>
        </div>
      </div>

      <aside class="rounded-md border border-borderc bg-panel p-4">
        <p class="font-mono text-[11px] uppercase tracking-[0.13em] text-textmuted">Live Workspace Preview</p>
        <div class="play-pattern my-3"></div>
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80"
          alt="Developer collaboration workspace"
          class="h-72 w-full rounded-md object-cover"
          loading="lazy"
        />
      </aside>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>
