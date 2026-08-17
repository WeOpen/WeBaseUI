import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  ssr: {
    noExternal: ['@lucide/svelte', '@webaseui/core', '@webaseui/svelte']
  }
});
