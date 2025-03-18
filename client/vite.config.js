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
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/uploads': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/patterns': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/fonts': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
        ws: true
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