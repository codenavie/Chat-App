<template>
  <BaseCard title="Shared Document" status="CRDT LIVE">
    <div class="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside class="rounded-lg border-2 border-ink bg-white p-3">
        <div class="mb-3 flex items-center justify-between">
          <p class="font-mono text-xs font-bold uppercase tracking-wider text-ink/70">Explorer</p>
          <div class="flex gap-1">
            <button class="rounded-full border-2 border-ink bg-quaternary px-2.5 py-1 text-xs font-bold" title="Add folder" @click="$emit('create-folder', '')">+</button>
            <button class="rounded-full border-2 border-ink bg-tertiary px-2.5 py-1 text-xs font-bold" title="Add file" @click="$emit('create-file', '')">+</button>
          </div>
        </div>

        <ul class="max-h-[420px] space-y-1 overflow-y-auto pr-1">
          <template v-for="node in explorerTree" :key="node.id">
            <li v-if="node.type === 'folder'" class="rounded-md border border-slate-200 bg-muted/50 p-1">
              <div class="mb-1 flex items-center justify-between">
                <span class="font-mono text-xs font-semibold">{{ node.name }}</span>
                <div class="flex gap-1">
                  <button class="rounded border border-ink bg-white px-1.5 py-0.5 text-[10px]" title="Add file" @click="$emit('create-file', node.id)">+</button>
                  <button class="rounded border border-ink bg-white px-1.5 py-0.5 text-[10px]" title="Add folder" @click="$emit('create-folder', node.id)">+</button>
                  <button class="rounded border border-ink bg-white px-1.5 py-0.5 text-[10px]" title="Delete folder" @click="$emit('delete-folder', node.id)">x</button>
                </div>
              </div>
              <ul class="space-y-1 pl-2">
                <li v-for="file in node.children.filter((c) => c.type === 'file')" :key="file.id" class="flex items-center justify-between gap-1 rounded bg-white px-1 py-1">
                  <button class="min-w-0 flex-1 truncate text-left font-mono text-[11px]" :title="file.id" @click="$emit('select-file', file.id)">{{ file.name }}</button>
                  <div class="flex gap-1">
                    <button class="rounded border border-ink px-1 py-0.5 text-[10px]" @click="$emit('rename-file', file.id)">r</button>
                    <button class="rounded border border-ink px-1 py-0.5 text-[10px]" @click="$emit('delete-file', file.id)">x</button>
                  </div>
                </li>
              </ul>
            </li>

            <li v-else class="flex items-center justify-between gap-1 rounded-md border-2 px-2 py-2" :class="node.id === activeFile ? 'border-accent bg-accent/10' : 'border-slate-200 bg-muted/70'">
              <button class="min-w-0 flex-1 truncate text-left font-mono text-xs font-semibold" :title="node.id" @click="$emit('select-file', node.id)">{{ node.name }}</button>
              <div class="flex gap-1">
                <button class="rounded border border-ink bg-white px-1.5 py-0.5 text-[10px]" @click="$emit('rename-file', node.id)">r</button>
                <button class="rounded border border-ink bg-white px-1.5 py-0.5 text-[10px]" @click="$emit('delete-file', node.id)">x</button>
              </div>
            </li>
          </template>
        </ul>
      </aside>

      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-md border-2 border-ink bg-white px-3 py-2">
          <p class="min-w-0 truncate font-mono text-xs font-semibold">{{ activeFile || 'No file selected' }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs" :class="dirty ? 'text-secondary font-bold' : 'text-ink/70'">
              {{ dirty ? 'Unsaved changes' : 'Saved' }}
            </span>
            <button class="rounded-full border-2 border-ink bg-tertiary px-3 py-1 text-xs font-bold shadow-pop active:shadow-pop-active" @click="$emit('save-file')">Save</button>
          </div>
        </div>

        <textarea
          :value="modelValue"
          class="min-h-[420px] w-full resize-y rounded-lg border-2 border-ink bg-white p-4 font-mono text-sm leading-6 text-ink shadow-[4px_4px_0px_0px_#E2E8F0] outline-none transition-all focus:shadow-pop"
          placeholder="Start collaborating in real-time..."
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from './BaseCard.vue';

defineProps({
  modelValue: { type: String, default: '' },
  explorerTree: { type: Array, default: () => [] },
  activeFile: { type: String, default: '' },
  dirty: { type: Boolean, default: false }
});

defineEmits(['update:modelValue', 'select-file', 'create-file', 'create-folder', 'rename-file', 'delete-file', 'delete-folder', 'save-file']);
</script>
