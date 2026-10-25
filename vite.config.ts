import type {} from 'vite-react-ssg'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: 'Kira Cetveli',
        short_name: 'Kira Cetveli',
        description: 'Kira artışı, belge ve takip araçları. Verileriniz cihazınızdan çıkmaz.',
        lang: 'tr',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#EDF1EC',
        theme_color: '#C23813',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        // The data files are cached at runtime with a freshness check instead of being precached.
        globIgnores: ['data/**', 'static-loader-data/**', '404.html'],
        // postbuild writes 404.html after the worker is generated, so it is listed explicitly.
        // Unmatched navigations get this empty app shell and the client router renders the page.
        additionalManifestEntries: [{ url: '404.html', revision: String(Date.now()) }],
        navigateFallback: '404.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.json') && url.pathname.includes('/data/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-json',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
    }),
  ],
  ssgOptions: { dirStyle: 'nested' },
})
