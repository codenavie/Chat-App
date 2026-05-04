<template>
  <div class="grid min-h-[640px] gap-0 lg:grid-cols-[180px_minmax(0,1fr)]">
    <aside class="border-b border-borderc bg-panel lg:border-b-0 lg:border-r">
      <div class="flex items-center justify-between border-b border-borderc px-3 py-3">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-textmuted">Explorer</p>
        <div class="flex gap-1.5">
          <button class="rounded border border-borderc bg-panel px-2 py-1 text-textmuted hover:text-ink" title="Create folder" @click="$emit('create-folder', '')">
            <FolderPlus class="h-3.5 w-3.5" />
          </button>
          <button class="rounded border border-borderc bg-panel px-2 py-1 text-textmuted hover:text-ink" title="Create file" @click="$emit('create-file', '')">
            <FilePlus2 class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div class="px-2 py-2">
        <button class="mb-1 flex w-full items-center gap-1 font-mono text-xs text-textmuted" @click="openRoot = !openRoot">
          <ChevronDown v-if="openRoot" class="h-3 w-3" />
          <ChevronRight v-else class="h-3 w-3" />
          devSync-room
        </button>

        <ul v-if="openRoot" class="space-y-0.5 pl-4">
          <li v-for="file in flatFiles" :key="file.id">
            <div class="group flex items-center justify-between rounded px-2 py-1 text-xs" :class="file.id === activeFile ? 'border-l-2 border-accent bg-muted text-ink' : 'text-textmuted hover:bg-muted hover:text-ink'">
              <button class="flex min-w-0 flex-1 items-center gap-2 text-left font-mono" :title="file.id" @click="$emit('select-file', file.id)">
                <span class="h-2 w-2 rounded-full" :class="dotClass(file.name)"></span>
                <span class="truncate">{{ file.name }}</span>
              </button>
              <span class="ml-2 font-mono text-[10px] text-textmuted">{{ file.id === activeFile && dirty ? '+' : '' }}</span>
            </div>
          </li>
        </ul>
      </div>
    </aside>

    <section class="flex min-w-0 flex-col bg-[#0d0d0f]">
      <div class="flex h-9 items-center border-b border-borderc bg-[#0d0d0f]">
        <button
          v-for="file in tabFiles"
          :key="file.id"
          class="group inline-flex h-full items-center gap-2 border-r border-borderc px-4 font-mono text-xs"
          :class="file.id === activeFile ? 'border-t-2 border-t-accent bg-[#161618] text-ink' : 'text-textmuted hover:bg-muted'"
          @click="$emit('select-file', file.id)"
        >
          <span class="h-2 w-2 rounded-full" :class="dotClass(file.name)"></span>
          <span>{{ file.name }}</span>
          <span v-if="dirty && file.id === activeFile" class="text-[#d4a853]">●</span>
          <span v-else class="opacity-0 transition-opacity group-hover:opacity-100">×</span>
        </button>

        <div class="ml-auto mr-3 inline-flex items-center gap-2 rounded-full border border-borderc px-2 py-0.5 font-mono text-[10px] text-textmuted">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
          LIVE
        </div>
      </div>

      <div class="flex items-center justify-between border-b border-borderc bg-panel px-3 py-2">
        <p class="font-mono text-xs" :class="dirty ? 'text-[#d4a853]' : 'text-textmuted'">{{ dirty ? '● Unsaved' : 'Saved ✓' }}</p>
        <button class="ui-btn ui-btn-primary px-3 py-1 text-xs font-semibold" @click="$emit('save-file')">Save</button>
      </div>

      <div class="relative flex min-h-[520px] flex-1 overflow-hidden">
        <div class="w-12 shrink-0 border-r border-borderc/40 bg-[#0d0d0f] px-1 py-3 text-right font-mono text-xs text-textmuted/60">
          <p
            v-for="n in lineCount"
            :key="n"
            class="leading-6"
            :class="n === currentLine ? 'text-textmuted' : ''"
          >
            {{ n }}
          </p>
        </div>

        <div ref="scrollWrap" class="relative flex-1 overflow-auto bg-[#0d0d0f]" @scroll="syncScroll">
          <pre
            ref="highlightPre"
            class="pointer-events-none m-0 min-h-full whitespace-pre-wrap break-words p-3 font-mono text-sm leading-6 text-ink"
            v-html="highlightedHtml"
          ></pre>
          <textarea
            ref="textareaRef"
            :value="modelValue"
            class="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-3 font-mono text-sm leading-6 text-transparent caret-[#3b82f6] selection:bg-[#3b82f6]/30 focus:outline-none"
            placeholder="Start collaborating in real-time..."
            aria-label="Code editor"
            role="textbox"
            aria-multiline="true"
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
            <div class="h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"></div>
            <div class="mt-1 -translate-x-1/2 whitespace-nowrap rounded border border-borderc bg-panel px-2 py-0.5 text-[10px] font-mono text-ink">
              {{ cursor.username }}
            </div>
          </div>
        </div>

        <div class="relative w-[60px] shrink-0 border-l border-borderc bg-panel px-2 py-2">
          <div class="space-y-1">
            <div v-for="line in minimapRows" :key="line.id" class="h-px bg-white/15" :style="{ width: `${line.w}%` }"></div>
          </div>
          <div class="absolute left-1 right-1 rounded bg-white/20" :style="{ top: `${minimapTop}%`, height: `${minimapHeight}%` }"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ChevronDown, ChevronRight, FilePlus2, FolderPlus } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: String, default: '' },
  explorerTree: { type: Array, default: () => [] },
  activeFile: { type: String, default: '' },
  dirty: { type: Boolean, default: false },
  remoteCursors: { type: Array, default: () => [] },
  remoteCarets: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue', 'select-file', 'create-file', 'create-folder', 'rename-file', 'delete-file', 'delete-folder', 'save-file', 'cursor-move', 'cursor-leave', 'caret-change', 'caret-leave']);

const openRoot = ref(true);
const textareaRef = ref(null);
const scrollWrap = ref(null);
const highlightPre = ref(null);
const currentLine = ref(1);

function flattenFiles(nodes, list = []) {
  for (const node of nodes || []) {
    if (node.type === 'file') {
      list.push({ id: node.id, name: node.name });
    } else if (node.type === 'folder' && node.children) {
      flattenFiles(node.children, list);
    }
  }
  return list;
}

const flatFiles = computed(() => flattenFiles(props.explorerTree, []));
const tabFiles = computed(() => {
  const files = flatFiles.value;
  if (files.length === 0) return [{ id: 'main.js', name: 'main.js' }, { id: 'utils.js', name: 'utils.js' }, { id: 'styles.css', name: 'styles.css' }];
  return files.slice(0, 3);
});

const activeFileCursors = computed(() => props.remoteCursors.filter((c) => c.fileName === props.activeFile));
const lineCount = computed(() => Math.max(1, props.modelValue.split('\n').length));

const minimapRows = computed(() => Array.from({ length: Math.min(80, lineCount.value * 2) }, (_, i) => ({ id: i, w: 35 + ((i * 17) % 60) })));
const minimapTop = ref(4);
const minimapHeight = ref(28);

const highlightedHtml = computed(() => highlightCode(props.modelValue));

function dotClass(name = '') {
  if (name.endsWith('.js')) return 'bg-amber-400';
  if (name.endsWith('.ts')) return 'bg-blue-400';
  if (name.endsWith('.css')) return 'bg-rose-400';
  return 'bg-textmuted';
}

function escapeHtml(input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function highlightCode(code) {
  let html = escapeHtml(code);
  html = html.replace(/(\/\/.*)/g, '<span class="text-textmuted/70 italic">$1</span>');
  html = html.replace(/(['"`].*?['"`])/g, '<span class="text-amber-400">$1</span>');
  html = html.replace(/\b(const|let|var|function|return|import|export|await|async|if|else|for|while|class|new|this|typeof|null|undefined|true|false)\b/g, '<span class="text-blue-400">$1</span>');
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-yellow-300">$1</span>');
  html = html.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="text-emerald-400">$1</span>');
  return html || ' ';
}

function handleCursorMove(event) {
  const rect = event.target.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  emit('cursor-move', {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height
  });
}

function handleCaretChange(event) {
  const value = event.target.value || '';
  const index = event.target.selectionStart || 0;
  const before = value.slice(0, index);
  const lines = before.split('\n');
  const line = lines.length;
  const column = (lines[lines.length - 1] || '').length + 1;
  currentLine.value = line;
  const currentLineText = (value.split('\n')[line - 1] || '').trim().slice(0, 60);
  emit('caret-change', { line, column, preview: currentLineText });
}

function handleBeforeInput(event) {
  const el = event.target;
  if (!el) return;
  const inputType = String(event.inputType || '');
  const supported = inputType.startsWith('insert') || inputType.startsWith('delete') || inputType === 'insertReplacementText';
  if (!supported) return;

  const start = Number(el.selectionStart || 0);
  const end = Number(el.selectionEnd || start);
  const pasted = event.dataTransfer?.getData?.('text/plain');
  const data = pasted || (event.data == null ? '' : String(event.data));
  if (event.cancelable) event.preventDefault();
  emit('update:modelValue', { inputType, start, end, data });
}

function handleInputFallback(event) {
  emit('update:modelValue', event.target.value);
}

function syncScroll() {
  if (!scrollWrap.value || !highlightPre.value) return;
  highlightPre.value.scrollTop = scrollWrap.value.scrollTop;
  const max = Math.max(1, scrollWrap.value.scrollHeight - scrollWrap.value.clientHeight);
  const ratio = scrollWrap.value.scrollTop / max;
  minimapTop.value = 4 + ratio * 68;
  minimapHeight.value = Math.max(14, (scrollWrap.value.clientHeight / scrollWrap.value.scrollHeight) * 84);
}

function handleLeave() {
  emit('cursor-leave');
  emit('caret-leave');
}
</script>
