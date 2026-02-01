import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target =
    process.env.VITE_BACKEND_URL ||
    env.VITE_BACKEND_URL ||
    'http://localhost:3000';

  console.log('Proxy target:', target);

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api/chat': {
          target: 'http://chat-service:7777', // Chat microservice
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/chat/, ''),
        },
        '/api': {
          target: target, // Main backend
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
