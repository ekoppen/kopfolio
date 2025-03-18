import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost',
      'www.wouterkoppen.com',
      'wouterkoppen.com'
    ],
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://backend:3000',
        changeOrigin: true
      },
      '/patterns': {
        target: 'http://backend:3000',
        changeOrigin: true
      },
      '/fonts': {
        target: 'http://backend:3000',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    exclude: [
      'chunk-MX2ZZMPV',
      'chunk-N4MPQGFL'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}); 