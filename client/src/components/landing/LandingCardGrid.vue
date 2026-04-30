<template>
  <section class="w-full space-y-5" id="features">
    <div class="flex items-center gap-4">
      <span class="h-px flex-1 bg-borderc"></span>
      <span class="font-mono text-xs uppercase tracking-[0.15em] text-accent">Product Highlights</span>
      <span class="h-px flex-1 bg-borderc"></span>
    </div>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article class="play-card overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
        <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80" alt="Realtime coding" class="h-40 w-full object-cover" loading="lazy" />
        <div class="p-4">
          <h3 class="font-display text-2xl text-ink">Realtime Editing</h3>
          <p class="mt-2 text-sm text-textmuted">Conflict-free collaboration powered by Y.js CRDT synchronization.</p>
        </div>
      </article>

      <article class="play-card overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
        <img src="https://images.unsplash.com/photo-1522252234503-e356532cafd5?auto=format&fit=crop&w=900&q=80" alt="Private room access" class="h-40 w-full object-cover" loading="lazy" />
        <div class="p-4">
          <h3 class="font-display text-2xl text-ink">Private Rooms</h3>
          <p class="mt-2 text-sm text-textmuted">Password-protected sessions for focused and secure team workflows.</p>
        </div>
      </article>

      <article class="play-card overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" alt="Shared file explorer" class="h-40 w-full object-cover" loading="lazy" />
        <div class="p-4">
          <h3 class="font-display text-2xl text-ink">Shared Explorer</h3>
          <p class="mt-2 text-sm text-textmuted">Create and manage files/folders collaboratively in one synchronized project tree.</p>
        </div>
      </article>
    </div>
  </section>
</template>
