<template>
  <BaseCard title="Shared Document" status="CRDT LIVE">
    <div class="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside class="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sticker">
        <div class="mb-3 flex items-center justify-between gap-2">
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-textmuted">Explorer</p>
          <div class="flex flex-wrap gap-1.5">
            <button class="ui-btn ui-btn-muted px-2 py-1" title="Create folder" @click="$emit('create-folder', '')" aria-label="Create folder">
              <FolderPlus class="h-3.5 w-3.5" :stroke-width="2" />
            </button>
            <button class="ui-btn ui-btn-muted px-2 py-1" title="Create file" @click="$emit('create-file', '')" aria-label="Create file">
              <FilePlus2 class="h-3.5 w-3.5" :stroke-width="2" />
            </button>
          </div>
        </div>

        <ul class="max-h-[420px] space-y-1 overflow-y-auto pr-1">
          <template v-for="node in explorerTree" :key="node.id">
            <li v-if="node.type === 'folder'" class="rounded-xl border border-white/10 bg-white/[0.04] p-1.5">
              <div class="mb-1 flex items-center justify-between gap-2">
                <span class="font-mono text-xs font-semibold text-ink">{{ node.name }}</span>
                <div class="flex flex-wrap gap-1">
                  <button class="ui-btn ui-btn-muted px-1.5 py-0.5" title="Create file" @click="$emit('create-file', node.id)" aria-label="Create file">
                    <FilePlus2 class="h-3 w-3" :stroke-width="2" />
                  </button>
                  <button class="ui-btn ui-btn-muted px-1.5 py-0.5" title="Create folder" @click="$emit('create-folder', node.id)" aria-label="Create folder">
                    <FolderPlus class="h-3 w-3" :stroke-width="2" />
                  </button>
                  <button class="ui-btn ui-btn-muted px-1.5 py-0.5 text-[10px] font-bold leading-none" title="Delete folder" @click="$emit('delete-folder', node.id)" aria-label="Delete folder">x</button>
                </div>
              </div>
              <ul class="space-y-1 pl-2">
                <li v-for="file in node.children.filter((c) => c.type === 'file')" :key="file.id" class="flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-black/20 px-1.5 py-1">
                  <button class="min-w-0 flex-1 truncate text-left font-mono text-[11px] text-ink" :title="file.id" @click="$emit('select-file', file.id)">{{ file.name }}</button>
                  <div class="flex gap-1">
                    <button class="ui-btn ui-btn-muted px-1 py-0 text-[10px]" @click="$emit('rename-file', file.id)">r</button>
                    <button class="ui-btn ui-btn-muted px-1.5 py-0.5 text-[10px] font-bold leading-none" @click="$emit('delete-file', file.id)" aria-label="Delete file">x</button>
                  </div>
                </li>
              </ul>
            </li>

            <li v-else class="flex items-center justify-between gap-1 rounded-lg border px-2 py-2" :class="node.id === activeFile ? 'border-accent/60 bg-accent/15' : 'border-white/10 bg-white/[0.04]'">
              <button class="min-w-0 flex-1 truncate text-left font-mono text-xs font-semibold text-ink" :title="node.id" @click="$emit('select-file', node.id)">{{ node.name }}</button>
              <div class="flex gap-1">
                <button class="ui-btn ui-btn-muted px-1.5 py-0.5 text-[10px]" @click="$emit('rename-file', node.id)">r</button>
                <button class="ui-btn ui-btn-muted px-1.5 py-0.5 text-[10px] font-bold leading-none" @click="$emit('delete-file', node.id)" aria-label="Delete file">x</button>
              </div>
            </li>
          </template>
        </ul>
      </aside>

      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <p class="min-w-0 truncate font-mono text-xs font-semibold text-ink">{{ activeFile || 'No file selected' }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs" :class="dirty ? 'text-amber-300 font-semibold' : 'text-textmuted'">{{ dirty ? 'Unsaved changes' : 'Saved' }}</span>
            <button class="ui-btn ui-btn-primary px-3 py-1 text-xs font-semibold" @click="$emit('save-file')">Save</button>
          </div>
        </div>

        <div class="relative">
          <div v-if="activeFileCarets.length" class="mb-2 space-y-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
            <p v-for="c in activeFileCarets" :key="c.userId" class="truncate text-[11px] text-indigo-200">
              {{ c.username }} typing at L{{ c.line }}:C{{ c.column }}<span v-if="c.preview"> - "{{ c.preview }}"</span>
            </p>
          </div>
          <textarea
            :value="modelValue"
            class="editor-surface"
            placeholder="Start collaborating in real-time..."
            @beforeinput="handleBeforeInput"
            @input="handleInputFallback"
            @keyup="handleCaretChange"
            @click="handleCaretChange"
            @mousemove="handleCursorMove"
            @mouseenter="handleCursorMove"
            @mouseleave="handleLeave"
          />

          <div
            v-for="cursor in activeFileCursors"
            :key="cursor.userId"
            class="pointer-events-none absolute z-10"
            :style="{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }"
          >
            <div class="h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(94,106,210,0.2)]"></div>
            <div class="mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-panel/90 px-2 py-0.5 text-[10px] font-mono text-ink">
              {{ cursor.username }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import { FilePlus2, FolderPlus } from 'lucide-vue-next';
import BaseCard from './BaseCard.vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  explorerTree: { type: Array, default: () => [] },
  activeFile: { type: String, default: '' },
  dirty: { type: Boolean, default: false },
  remoteCursors: { type: Array, default: () => [] },
  remoteCarets: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue', 'select-file', 'create-file', 'create-folder', 'rename-file', 'delete-file', 'delete-folder', 'save-file', 'cursor-move', 'cursor-leave', 'caret-change', 'caret-leave']);

const activeFileCursors = computed(() => props.remoteCursors.filter((c) => c.fileName === props.activeFile));
const activeFileCarets = computed(() => props.remoteCarets.filter((c) => c.fileName === props.activeFile));

function handleCursorMove(event) {
  const rect = event.target.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  emit('cursor-move', {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height
  });
}

function handleCaretChange(event) {
  // Emit logical caret position so collaborators can see active typing context.
  const value = event.target.value || '';
  const index = event.target.selectionStart || 0;
  const before = value.slice(0, index);
  const lines = before.split('\n');
  const line = lines.length;
  const column = (lines[lines.length - 1] || '').length + 1;
  const currentLineText = (value.split('\n')[line - 1] || '').trim().slice(0, 60);
  emit('caret-change', { line, column, preview: currentLineText });
}

function handleBeforeInput(event) {
  const el = event.target;
  if (!el) return;

  const inputType = String(event.inputType || '');
  const supported =
    inputType.startsWith('insert') ||
    inputType.startsWith('delete') ||
    inputType === 'insertReplacementText';
  if (!supported) return;

  const start = Number(el.selectionStart || 0);
  const end = Number(el.selectionEnd || start);
  const pasted = event.dataTransfer?.getData?.('text/plain');
  const data = pasted || (event.data == null ? '' : String(event.data));

  if (event.cancelable) {
    event.preventDefault();
  }

  emit('update:modelValue', { inputType, start, end, data });
}

function handleInputFallback(event) {
  // Fallback for non-cancelable inputs (IME/autofill/spellcheck cases).
  emit('update:modelValue', event.target.value);
}

function handleLeave() {
  emit('cursor-leave');
  emit('caret-leave');
}
</script>
