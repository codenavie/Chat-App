<template>
  <footer class="mt-auto border-t border-borderc text-sm text-textmuted">
    <div class="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
      <p class="font-display text-lg text-ink">DevCollab</p>
      <nav class="flex gap-4">
        <a href="#" class="hover:text-ink">Contact</a>
        <a href="#" class="hover:text-ink">Privacy</a>
      </nav>
    </div>
    <p class="w-full border-t border-borderc/60 px-4 py-4 text-xs text-textmuted sm:px-6 lg:px-8">
      Copyright (c) {{ year }} DevCollab. All rights reserved.
    </p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>
