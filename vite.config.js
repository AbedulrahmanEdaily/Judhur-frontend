import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false, // backend uses a self-signed dev certificate
      },
      // The SignalR hub (the project guide 6.17): WebSockets go through the proxy too.
      '/hubs': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
