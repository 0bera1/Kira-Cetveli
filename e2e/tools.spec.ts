import { expect, test } from '@playwright/test'

const ORIGIN = process.env.E2E_BASE_URL ?? 'http://localhost:4173'

test('rate month selector fills the rate field', async ({ page }) => {
  await page.goto('/araclar/kira-artis-hesabi')
  await expect(page.getByLabel('Uygulanacak artış oranı')).toHaveValue('31,49')
  await page.getByLabel('Sözleşme yıldönümü (yenileme ayı)').selectOption({ index: 3 })
  await expect(page.getByLabel('Uygulanacak artış oranı')).toHaveValue('32,03')
  await expect(page.getByTestId('result')).toHaveText('₺13.203,00')
  await expect(page.getByText('hukuki danışmanlık değildir').first()).toBeVisible()
  await expect(page.getByText('Veri son güncelleme').first()).toBeVisible()
})

test('last-12-months table lists twelve rows and can pick a month', async ({ page }) => {
  await page.goto('/araclar/kira-artis-hesabi')
  await expect(page.locator('tbody tr')).toHaveCount(12)
  await page.locator('tbody tr').nth(1).getByRole('button', { name: 'Kullan' }).click()
  await expect(page.getByLabel('Uygulanacak artış oranı')).toHaveValue('31,79')
})

test('late interest uses days/365', async ({ page }) => {
  await page.goto('/araclar/gecikme-faizi')
  await page.getByLabel('Gecikmiş kira tutarı').fill('10000')
  await page.getByLabel('Gecikme süresi').fill('365')
  await page.getByLabel('Yıllık faiz oranı').fill('24')
  await expect(page.getByTestId('result')).toHaveText('₺2.400,00')
})

test('deposit refund and invalid input', async ({ page }) => {
  await page.goto('/araclar/depozito-iadesi')
  await page.getByLabel('Yıllık faiz oranı').fill('10')
  await expect(page.getByTestId('result')).toContainText('₺')
  await page.getByLabel('Depozito tutarı').fill('abc')
  await expect(page.getByText('Tutar, faiz oranı ve tarihleri girin')).toBeVisible()
})

test('tax tool warns about missing yearly data', async ({ page }) => {
  await page.goto('/araclar/stopaj-ve-vergi')
  await page.getByLabel('Vergi yılı').selectOption('2026')
  await expect(page.getByRole('alert')).toContainText('2026')
  await page.getByLabel('Vergi yılı').selectOption('2025')
  await expect(page.getByTestId('result')).toContainText('₺')
})

test('back-pay tool computes a total', async ({ page }) => {
  await page.goto('/araclar/gecmis-donem-farki')
  await expect(page.getByTestId('result')).toContainText('₺')
})

test('tools hub filters by search and category', async ({ page }) => {
  await page.goto('/araclar')
  await expect(page.locator('ol > li').first()).toBeVisible()
  await page.getByLabel('Araç ara').fill('depozito')
  await expect(page.locator('ol > li')).toHaveCount(2)
  await page.getByLabel('Araç ara').fill('zzzz')
  await expect(page.getByText('Eşleşen araç bulunamadı.')).toBeVisible()
})

test('no horizontal scroll and no external requests on tool pages', async ({ page }) => {
  const external: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith(ORIGIN)) external.push(r.url())
  })
  for (const slug of [
    'kira-artis-hesabi',
    'gecikme-faizi',
    'gecmis-donem-farki',
    'depozito-iadesi',
    'stopaj-ve-vergi',
  ]) {
    for (const w of [390, 768, 1280]) {
      await page.setViewportSize({ width: w, height: 900 })
      await page.goto(`/araclar/${slug}`)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(overflow, `${slug} @${w}`).toBe(false)
    }
  }
  expect(external).toEqual([])
})
