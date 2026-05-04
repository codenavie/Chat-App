<template>
  <footer class="mt-auto border-t border-borderc text-sm text-textmuted">
    <div class="grid gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
      <div>
        <p class="font-display text-xl text-ink">devSync</p>
        <p class="mt-2 max-w-xs font-mono text-xs text-textmuted">Realtime collaboration workspace for modern software teams.</p>
      </div>

      <div v-for="group in groups" :key="group.title">
        <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-textmuted">{{ group.title }}</p>
        <nav class="mt-3 flex flex-col gap-2">
          <a v-for="link in group.links" :key="link" href="#" class="font-mono text-xs text-textmuted transition-colors hover:text-ink">{{ link }}</a>
        </nav>
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-borderc/60 px-4 py-4 sm:px-6 lg:px-8">
      <p class="font-mono text-xs text-textmuted">Copyright (c) {{ year }} devSync. All rights reserved.</p>
      <p class="font-mono text-xs text-textmuted">Built with obsidian logic.</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();

const groups = [
  { title: 'Product', links: ['Features', 'Integrations', 'Roadmap'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
  { title: 'Connect', links: ['GitHub', 'Discord', 'X'] }
];
</script>
