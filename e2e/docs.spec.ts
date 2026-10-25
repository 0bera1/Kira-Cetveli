import { readFileSync } from 'node:fs'

const ORIGIN = process.env.E2E_BASE_URL ?? 'http://localhost:4173'
import { expect, test } from '@playwright/test'

test('increase notice downloads a non-empty PDF', async ({ page }) => {
  await page.goto('/araclar/artis-ihtarnamesi')
  await page.getByLabel('Gönderen (ad soyad)').fill('Ayşe Yıldız')
  await page.getByLabel('Alıcı (ad soyad)').fill('Mehmet Öztürk')
  await page.getByLabel('Yeni kiranın geçerli olacağı tarih').fill('2026-11-01')
  await expect(page.getByLabel(/Belge metni/)).toContainText('₺13.149,00')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'PDF indir' }).click(),
  ])
  const path = await download.path()
  const bytes = readFileSync(path)
  expect(bytes.length).toBeGreaterThan(5000)
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
  await expect(page.getByRole('status')).toHaveText('PDF indirildi.')
})

test('document text is editable and can be reset', async ({ page }) => {
  await page.goto('/araclar/tahliye-ve-depozito-yazisi')
  const box = page.getByLabel(/Belge metni/)
  await expect(box).toContainText('Tahliye bildirimi')
  await box.fill('Özel metin')
  await page.getByRole('button', { name: 'Şablona dön' }).click()
  await expect(box).toContainText('Tahliye bildirimi')
  await page.getByLabel('Şablon').selectOption('depozito')
  await expect(box).toContainText('Depozito iade talebi')
})

test('calendar page creates an ics download and keeps nothing without consent', async ({
  page,
}) => {
  await page.goto('/araclar/sozlesme-takvimi')
  await page.getByLabel('Sözleşme başlangıç tarihi').fill('2025-03-15')
  await page.getByLabel(/Sözleşme bitiş tarihi/).fill('2027-03-15')
  await expect(page.locator('ol li')).toHaveCount(3)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Takvim dosyası indir/ }).click(),
  ])
  const text = readFileSync(await download.path(), 'utf8')
  expect(text).toContain('BEGIN:VCALENDAR')
  expect(await page.evaluate(() => localStorage.getItem('reminders-v1'))).toBeNull()
  await page.getByLabel(/Tarihleri yalnızca bu tarayıcıda/).check()
  await page.getByRole('button', { name: 'Listeyi bu cihaza kaydet' }).click()
  expect(await page.evaluate(() => localStorage.getItem('reminders-v1'))).not.toBeNull()
  await page.getByRole('button', { name: 'Kayıtlı listeyi sil' }).click()
  expect(await page.evaluate(() => localStorage.getItem('reminders-v1'))).toBeNull()
})

test('contract checklist counts ticks', async ({ page }) => {
  await page.goto('/araclar/sozlesme-kontrol-listesi')
  await page.locator('main button[aria-pressed]').first().click()
  await expect(page.getByText(/^1\/\d+/)).toBeVisible()
})

test('user input never leaves the browser', async ({ page }) => {
  const requests: { url: string; body: string | null; method: string; type: string }[] = []
  page.on('request', (r) =>
    requests.push({ url: r.url(), body: r.postData(), method: r.method(), type: r.resourceType() }),
  )
  await page.goto('/araclar/artis-ihtarnamesi')
  await page.getByLabel('Gönderen (ad soyad)').fill('GizliAd Soyad')
  await page.getByLabel('Kiralanan taşınmazın adresi').fill('GizliAdres 12')
  await page.getByLabel('Mevcut aylık kira').fill('77777')
  await page.getByRole('button', { name: 'PDF indir' }).click()
  await page.waitForTimeout(500)
  for (const r of requests) {
    expect(r.url.startsWith(ORIGIN), r.url).toBe(true)
    expect(r.method, r.url).toBe('GET')
    expect(r.url).not.toMatch(/GizliAd|77777/)
    expect(r.body).toBeNull()
  }
  const nonStatic = requests.filter(
    (r) =>
      !['document', 'script', 'stylesheet', 'font', 'image'].includes(r.type) &&
      !/.(json|woff2)$/.test(r.url),
  )
  expect(nonStatic.map((r) => r.url)).toEqual([])
})
