<template>
  <section id="docs" class="space-y-5">
    <div class="grid items-end gap-4 md:grid-cols-[1fr_auto]">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.14em] text-accent">// architecture</p>
        <h2 class="mt-2 font-display text-4xl tracking-tight text-ink sm:text-5xl">
          Every tool you need.
          <span class="text-textmuted"> Nothing you don't.</span>
        </h2>
      </div>
      <p class="max-w-md justify-self-end font-mono text-xs text-textmuted">
        Unified modules for coding teams who need speed, clarity, and secure collaboration at scale.
      </p>
    </div>

    <div class="grid gap-px rounded-2xl bg-borderc/30 md:grid-cols-2 lg:grid-cols-3">
      <article v-for="item in modules" :key="item.title" class="group border border-transparent bg-panel p-5 transition-all duration-300 hover:border-accent/35 hover:bg-muted">
        <div class="flex items-start justify-between gap-3">
          <component :is="item.icon" class="h-5 w-5 text-ink" />
          <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-textmuted">{{ item.tag }}</span>
        </div>
        <h3 class="mt-3 font-display text-2xl text-ink">{{ item.title }}</h3>
        <p class="mt-2 font-mono text-xs leading-relaxed text-textmuted">{{ item.desc }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { GitBranch, Layers, MessageCircle, Shield, Workflow, Zap } from 'lucide-vue-next';

const modules = [
  { icon: GitBranch, tag: 'Git', title: 'Version Control', desc: 'Track, review, and merge collaboration changes in one shared flow.' },
  { icon: MessageCircle, tag: 'Comms', title: 'Real-time Chat', desc: 'Coordinate instantly with contextual messages inside each room.' },
  { icon: Workflow, tag: 'CI/CD', title: 'Pipeline Hooks', desc: 'Connect your coding sessions to release pipelines and automation.' },
  { icon: Shield, tag: 'Security', title: 'Security Audit', desc: 'Private room access, credential controls, and event visibility.' },
  { icon: Zap, tag: 'Deploy', title: 'Edge Deploy', desc: 'Move from collaboration to deployment without platform switching.' },
  { icon: Layers, tag: 'Sync', title: 'Workspace Sync', desc: 'Consistent file trees and docs mirrored for every collaborator.' }
];
</script>
