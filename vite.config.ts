import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps in production
  },
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/v1': {
        // Nu nog alleen gebruik vanuit de devcontainer mogelijk. Wellicht dynamisch maken bijv met env vars en Zod
        // https://www.raulmelo.me/en/blog/best-practices-for-handling-per-environment-config-js-ts-applications
        target: 'http://host.docker.internal:3045', 
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      },
    },
  },
  preview: {
    port: 3030,
    host: true,
  }
});
