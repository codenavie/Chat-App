import { createRouter, createWebHistory } from 'vue-router';
import LandingView from './views/LandingView.vue';
import HomeView from './views/HomeView.vue';

const routes = [
  { path: '/', name: 'landing', component: LandingView },
  { path: '/app', name: 'home', component: HomeView }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
