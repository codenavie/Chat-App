<template>
  <section class="relative isolate mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-borderc/80 bg-panel backdrop-blur-xl">
    <canvas ref="canvasRef" class="pointer-events-none absolute inset-0 z-0" aria-hidden="true"></canvas>
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-[#d4a853] to-transparent" aria-hidden="true"></div>
    <div class="relative z-10 grid min-h-[520px] md:grid-cols-[0.4fr_0.6fr]">
      <aside class="border-b border-borderc/70 bg-muted p-6 md:border-b-0 md:border-r">
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-textmuted">Secure Access</p>
        <div class="mt-5 flex h-14 w-14 items-center justify-center rounded-xl border border-accent/40 bg-panel shadow-[0_0_20px_rgba(59,130,246,0.22)]">
          <Shield class="h-8 w-8 text-accent" />
        </div>

        <div class="mt-8 space-y-4">
          <div class="border-t border-borderc/60 pt-4">
            <p class="font-mono text-2xl font-semibold text-ink">24</p>
            <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-textmuted">Active Rooms</p>
          </div>
          <div class="border-t border-borderc/60 pt-4">
            <p class="font-mono text-2xl font-semibold text-ink">138</p>
            <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-textmuted">Devs Online</p>
          </div>
          <div class="border-t border-borderc/60 pt-4">
            <p class="font-mono text-2xl font-semibold text-ink">99.9%</p>
            <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-textmuted">Uptime</p>
          </div>
        </div>

        <div class="mt-8 border-t border-borderc/60 pt-4">
          <p class="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-textmuted">Recently joined</p>
          <div class="flex -space-x-2">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-borderc bg-panel font-mono text-[10px] text-ink">AL</span>
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-borderc bg-panel font-mono text-[10px] text-ink">VN</span>
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-borderc bg-panel font-mono text-[10px] text-ink">QT</span>
          </div>
        </div>
      </aside>

      <div class="space-y-4 p-6">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-display text-2xl font-medium text-ink">Secure Room Access</h2>
          <span class="rounded-full border border-borderc px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-textmuted">Private</span>
        </div>

        <button class="ui-btn w-full border border-transparent bg-gradient-to-r from-[#d4a853] to-[#b8922e] font-mono text-sm font-medium tracking-wide text-[#111] transition hover:brightness-110 hover:shadow-[0_0_18px_rgba(212,168,83,0.3)] disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#111]" :disabled="loading || generating" @click="handleGenerate">
          <Loader2 v-if="generating" class="mr-2 inline h-4 w-4 animate-spin" />
          {{ generating ? 'Generating...' : 'Generate Room ID' }}
        </button>

        <label class="block">
          <span class="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-textmuted">Room ID</span>
          <div class="relative">
            <input v-model="roomValue" maxlength="24" placeholder="Generate above, or enter your own" class="ui-input pr-10 font-mono text-sm" @input="emit('update:roomId', roomValue)" />
            <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-textmuted hover:text-ink" aria-label="Copy room id" @click="copyRoomId">
              <Copy class="h-4 w-4" />
            </button>
          </div>
        </label>

        <label class="block">
          <span class="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-textmuted">Your Name</span>
          <input v-model="nameValue" maxlength="24" placeholder="e.g. Alex" class="ui-input font-mono text-sm" @input="emit('update:username', nameValue)" />
        </label>

        <label class="block">
          <span class="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-textmuted">Room Password</span>
          <div class="relative">
            <input v-model="passwordValue" :type="showPassword ? 'text' : 'password'" maxlength="64" placeholder="At least 6 characters" class="ui-input pr-10 font-mono text-sm" @input="emit('update:password', passwordValue)" />
            <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-textmuted hover:text-ink" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
          <div v-if="passwordValue.length > 0" class="mt-2 grid grid-cols-4 gap-1">
            <span v-for="n in 4" :key="n" class="h-1.5 rounded-full" :class="segmentClass(n)"></span>
          </div>
        </label>

        <p v-if="error" class="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{{ error }}</p>

        <button class="ui-btn w-full border border-transparent bg-gradient-to-r from-[#d4a853] to-[#b8922e] font-mono text-sm font-medium tracking-wide text-[#111] transition hover:brightness-110 hover:shadow-[0_0_18px_rgba(212,168,83,0.3)] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#111]" :disabled="loading || !canCreate" @click="emit('create')">
          <Loader2 v-if="loading" class="mr-2 inline h-4 w-4 animate-spin" />
          {{ loading ? 'Initializing room...' : 'Create Private Room' }}
        </button>

        <button class="ui-btn ui-btn-muted w-full font-mono text-sm text-textmuted transition hover:border-accent/50 hover:bg-panel hover:text-ink" :disabled="loading" @click="emit('open-join')">
          Join Existing Private Room
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Swal from 'sweetalert2';
import { Copy, Eye, EyeOff, Loader2, Shield } from 'lucide-vue-next';

const props = defineProps({
  roomId: { type: String, default: '' },
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  canCreate: { type: Boolean, default: false }
});

const emit = defineEmits(['update:roomId', 'update:username', 'update:password', 'create', 'generate', 'open-join']);

const roomValue = ref(props.roomId);
const nameValue = ref(props.username);
const passwordValue = ref(props.password);
const showPassword = ref(false);
const generating = ref(false);
const canvasRef = ref(null);
let rafId = 0;
let particles = [];

const strength = computed(() => {
  const pwd = passwordValue.value;
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score += 1;
  return score;
});

function segmentClass(index) {
  if (index > strength.value) return 'bg-borderc';
  if (strength.value <= 1) return 'bg-red-500';
  if (strength.value === 2) return 'bg-orange-500';
  if (strength.value === 3) return 'bg-yellow-400';
  return 'bg-green-500';
}

function getSwalTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return { background: isDark ? '#1a1a19' : '#ffffff', color: isDark ? '#f3f1ed' : '#1a1a1a', confirmButtonColor: '#d4a853' };
}

function copyRoomId() {
  if (!roomValue.value) return;
  navigator.clipboard.writeText(roomValue.value);
  Swal.fire({ icon: 'success', title: 'Room ID copied', timer: 1200, showConfirmButton: false, ...getSwalTheme() });
}

async function handleGenerate() {
  generating.value = true;
  await new Promise((r) => setTimeout(r, 300));
  emit('generate');
  setTimeout(() => {
    if (generating.value) generating.value = false;
  }, 2200);
}

function runTypewriter(nextValue) {
  if (!nextValue) return;
  roomValue.value = '';
  let i = 0;
  const tick = () => {
    i += 1;
    roomValue.value = nextValue.slice(0, i);
    emit('update:roomId', roomValue.value);
    if (i < nextValue.length) {
      setTimeout(tick, 40);
    } else {
      generating.value = false;
    }
  };
  tick();
}

function initParticles() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  const count = 24;
  resize();
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35
  }));

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x <= 0 || p.x >= canvas.width) p.vx *= -1;
      if (p.y <= 0 || p.y >= canvas.height) p.vy *= -1;
      ctx.fillStyle = 'rgba(59,130,246,0.22)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.18;
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resize);
  animate();
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize);
  });
}

watch(() => props.roomId, (next, prev) => {
  if (generating.value && next && next !== prev) {
    runTypewriter(next);
  } else if (!generating.value) {
    roomValue.value = next;
  }
});
watch(() => props.username, (v) => { nameValue.value = v; });
watch(() => props.password, (v) => { passwordValue.value = v; });

onMounted(() => {
  initParticles();
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>
