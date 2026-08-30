import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
const BASE = process.env.NODE_ENV === 'production' ? './' : '/';
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || process.env.npm_package_version || '1.0.0') },
  base: BASE,
  server: {
    host: true, // expose on the local network (0.0.0.0), not just localhost
    port: 5174,
    strictPort: false,
    hmr: { overlay: false },
  },
  preview: {
    host: true, // same for the production preview server
    port: 4173,
    strictPort: false,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png', 'mascot.json', 'owl.json', 'mascot.svg'],
      manifest: {
        name: 'Часики — учим время',
        short_name: 'Часики',
        description: 'Учи время играя — часы, минуты, аналоговые и цифровые',
        lang: 'ru',
        theme_color: '#FFF8EC',
        background_color: '#FFF8EC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: true, type: 'module' },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'gfonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } } },
        ],
      },
    }),
  ],
});
