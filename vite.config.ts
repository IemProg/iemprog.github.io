import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:         resolve(__dirname, 'index.html'),
        about:        resolve(__dirname, 'about/index.html'),
        publications: resolve(__dirname, 'publications/index.html'),
        blog:         resolve(__dirname, 'blog/index.html'),
        projects:     resolve(__dirname, 'projects/index.html'),
      },
    },
  },
});
