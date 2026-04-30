<template>
  <div class="min-h-screen flex flex-col">
    <LandingNavbar :theme="theme" @toggle-theme="toggleTheme" />
    <main class="flex w-full flex-1 flex-col gap-8 px-4 pb-8 pt-6 sm:px-6 md:gap-10 lg:px-8">
      <LandingHero />
      <LandingCardGrid />
      <LandingHowItWorks />
      <LandingBenefits />
      <LandingCTA />
    </main>
    <LandingFooter />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import LandingBenefits from '../components/landing/LandingBenefits.vue';
import LandingCardGrid from '../components/landing/LandingCardGrid.vue';
import LandingCTA from '../components/landing/LandingCTA.vue';
import LandingFooter from '../components/landing/LandingFooter.vue';
import LandingHero from '../components/landing/LandingHero.vue';
import LandingHowItWorks from '../components/landing/LandingHowItWorks.vue';
import LandingNavbar from '../components/landing/LandingNavbar.vue';

const THEME_KEY = 'collab-theme';
const theme = ref('light');

function applyTheme(nextTheme) {
  // Keep CSS theme tokens aligned with the active mode.
  document.documentElement.setAttribute('data-theme', nextTheme);
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
}

onMounted(() => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') {
    theme.value = saved;
  } else {
    // First load fallback to the system preference.
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme.value);
});

watch(theme, (nextTheme) => {
  applyTheme(nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
});
</script>
