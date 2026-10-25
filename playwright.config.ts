import { defineConfig } from '@playwright/test'

// E2E_BASE_URL runs the suite against an already deployed site instead of a local build.
const remote = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: remote ?? 'http://localhost:4173', locale: 'tr-TR' },
  webServer: remote
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
        timeout: 180_000,
      },
})
