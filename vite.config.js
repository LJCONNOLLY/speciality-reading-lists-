import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path matches the GitHub Pages project site URL (repo name).
export default defineConfig({
  plugins: [react()],
  base: '/speciality-reading-lists-/',
});
