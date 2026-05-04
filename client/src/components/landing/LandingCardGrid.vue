<template>
  <section class="space-y-4">
    <p class="font-mono text-xs uppercase tracking-[0.14em] text-accent">// trust</p>
    <div class="grid gap-px rounded-2xl bg-borderc/30 md:grid-cols-3">
      <article v-for="stat in stats" :key="stat.label" class="bg-bgmain p-6">
        <p class="font-display text-4xl text-ink">{{ stat.value }}</p>
        <p class="mt-2 font-mono text-xs text-textmuted">{{ stat.label }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { value: '12k+', label: 'Active developers collaborating weekly' },
  { value: '99.95%', label: 'Realtime sync uptime across rooms' },
  { value: '< 120ms', label: 'Average live sync propagation' }
];
</script>
