import { expect, test } from '@playwright/test'

const pages = [
  ['/rehber/kiraci-haklari', 'Kiracı hakları'],
  ['/rehber/ev-sahibi-yukumlulukleri', 'Ev sahibi yükümlülükleri'],
  ['/veri-kaynaklari', 'Veri kaynakları'],
  ['/gizlilik', 'Gizlilik'],
  ['/hakkinda', 'Hakkında'],
  ['/araclar/bolge-kira-karsilastirma', 'Bölge kira karşılaştırma'],
]

for (const [path, heading] of pages) {
  test(`${path} renders with title, description and no overflow`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    await expect(page).toHaveTitle(new RegExp(`${heading}.*Kira Cetveli`))
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy()
    for (const w of [390, 768, 1280]) {
      await page.setViewportSize({ width: w, height: 900 })
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(overflow, `${path} @${w}`).toBe(false)
    }
  })
}

test('guides cite statutes, carry the review note and FAQ JSON-LD', async ({ page }) => {
  await page.goto('/rehber/kiraci-haklari')
  await expect(page.getByText('Türk Borçlar Kanunu madde 344').first()).toBeVisible()
  await expect(page.getByText('hukuki incelemeden geçmelidir')).toBeVisible()
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
  expect(JSON.parse(ld!)['@type']).toBe('FAQPage')
})

test('prerendered HTML contains content without JavaScript', async ({ request }) => {
  const html = await (await request.get('/rehber/kiraci-haklari/')).text()
  expect(html).toContain('Kiracı hakları')
  expect(html).toContain('application/ld+json')
})

test('unknown shell renders the not-found page', async ({ page }) => {
  await page.goto('/404.html')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sayfa bulunamadı')
})

test('the coming-soon tool does not pretend to work', async ({ page }) => {
  await page.goto('/araclar/bolge-kira-karsilastirma')
  await expect(page.getByText('Bu araç henüz çalışmıyor')).toBeVisible()
  await expect(page.locator('main input')).toHaveCount(0)
})

test('privacy claim: every tool page makes only same-origin requests', async ({ page }) => {
  const external: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4173')) external.push(r.url())
  })
  for (const p of ['/', '/araclar', '/veri-kaynaklari', '/gizlilik', '/rehber/kiraci-haklari']) {
    await page.goto(p)
  }
  expect(external).toEqual([])
})
