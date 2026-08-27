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
      includeAssets: ['five.png', 'five-maskable.png'],
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
          { src: 'five.png', sizes: '1237x1272', type: 'image/png', purpose: 'any' },
          { src: 'five-maskable.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
});
