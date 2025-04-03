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
        target: 'http://localhost:3040',
        changeOrigin: true,
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
