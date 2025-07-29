import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps in production
  },
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['localhost', 'mini'],
    proxy: {
      '/api/v1': {
        target: process.env.REMOTE_CONTAINERS
          ? 'http://host.docker.internal:3045'
          : 'http://localhost:3045',
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      },
    },
  },
  preview: {
    port: 3030,
    host: true,
  },
});
