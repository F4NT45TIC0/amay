import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        tirarCarta: resolve(import.meta.dirname, 'tirar-carta.html'),
        arcanos: resolve(import.meta.dirname, 'arcanos.html'),
      },
    },
  },
  test: { environment: 'jsdom' },
});
