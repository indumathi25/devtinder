import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Given the backend routes don't seem to be prefixed with /api in app.js, 
      // but usually it's good practice. 
      // However, looking at app.js: app.use('/', authRouter);
      // The routes are at root level e.g. /login, /signup.
      // So I should probably proxy everything that is not a static asset?
      // Or just specific paths.
      // Let's proxy specific paths for now to avoid conflict with frontend routes.
      // Actually, since it's a separate port, we can proxy context.
      '/login': 'http://localhost:3000',
      '/signup': 'http://localhost:3000',
      '/logout': 'http://localhost:3000',
      '/profile': 'http://localhost:3000',
      '/request': 'http://localhost:3000',
      '/user': 'http://localhost:3000',
      '/feed': 'http://localhost:3000',
    },
  },
})
