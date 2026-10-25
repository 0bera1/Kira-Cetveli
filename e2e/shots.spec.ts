import { test } from '@playwright/test'

const pages = [
  ['hub', '/araclar'],
  ['artis', '/araclar/kira-artis-hesabi'],
  ['belge', '/araclar/artis-ihtarnamesi'],
  ['takvim', '/araclar/sozlesme-takvimi'],
  ['rehber', '/rehber/kiraci-haklari'],
  ['veri', '/veri-kaynaklari'],
]

// Screenshots for manual review; written to shots/ (git-ignored).
test('page screenshots in both themes and sizes', async ({ page }) => {
  for (const [name, path] of pages) {
    for (const [w, h] of [
      [390, 900],
      [1280, 900],
    ]) {
      for (const theme of ['light', 'dark'] as const) {
        await page.setViewportSize({ width: w, height: h })
        await page.emulateMedia({ colorScheme: theme })
        await page.goto(path)
        await page.waitForTimeout(150)
        await page.screenshot({ path: `shots/${name}-${w}-${theme}.png`, fullPage: true })
      }
    }
  }
})
