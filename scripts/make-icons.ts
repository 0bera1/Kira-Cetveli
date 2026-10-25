// One-off helper: renders public/favicon.svg to the PNG sizes the web app manifest needs.
import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const svg = readFileSync('public/favicon.svg', 'utf8')
const browser = await chromium.launch()
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(
    `<body style="margin:0"><div style="width:${size}px;height:${size}px">${svg.replace('<svg', `<svg width="${size}" height="${size}"`)}</div></body>`,
  )
  await page.screenshot({ path: `public/icons/icon-${size}.png`, omitBackground: true })
  await page.close()
}
await browser.close()
