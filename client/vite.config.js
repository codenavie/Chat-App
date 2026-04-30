import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    // Allow Cloudflare Tunnel domains during remote preview.
    allowedHosts: ['.trycloudflare.com']
  }
});
