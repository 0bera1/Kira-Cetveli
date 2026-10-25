import { expect, test } from '@playwright/test'

const ORIGIN = process.env.E2E_BASE_URL ?? 'http://localhost:4173'

test('default values give the expected result', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('new-rent')).toHaveText(/13\.149,00/)
})

test('role switch changes copy', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Kirana gelen zam')
  await page.getByRole('button', { name: 'Ev sahibiyim' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Kira artışını doğru')
  await expect(page.getByText('İsteyebileceğin yeni kira')).toBeVisible()
})

test('theme toggles and persists', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Karanlık temaya geç|Aydınlık temaya geç/ }).click()
  const t = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.reload()
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(t)
})

test('no external requests and no horizontal scroll', async ({ page }) => {
  const external: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith(ORIGIN)) external.push(r.url())
  })
  for (const w of [390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 })
    await page.goto('/')
    await page.getByLabel('Mevcut aylık kira').fill('12345')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  }
  expect(external).toEqual([])
})

test('screenshots', async ({ page }) => {
  for (const [w, h] of [
    [390, 900],
    [1280, 900],
  ]) {
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width: w, height: h })
      await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' })
      await page.goto('/')
      await page.waitForTimeout(300)
      await page.screenshot({ path: `shots/home-${w}-${theme}.png`, fullPage: true })
    }
  }
})

test('header navigation mirrors the footer and marks the current page', async ({ page }) => {
  await page.goto('/')
  const header = page.getByRole('navigation', { name: 'Ana gezinti' })
  for (const name of ['Araçlar', 'Veri kaynakları', 'Gizlilik', 'Hakkında']) {
    await expect(header.getByRole('link', { name })).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Alt bağlantılar' }).getByRole('link', { name }),
    ).toBeVisible()
  }
  await header.getByRole('link', { name: 'Gizlilik' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gizlilik')
  await expect(header.getByRole('link', { name: 'Gizlilik' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  for (const w of [390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 })
    const box = await header.getByRole('link', { name: 'Hakkında' }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)
  }
})

test('client-side navigation never requests build-hashed loader files', async ({ page }) => {
  const loaderRequests: string[] = []
  const errors: string[] = []
  page.on('request', (r) => {
    if (/static-loader/.test(r.url())) loaderRequests.push(r.url())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  const header = page.getByRole('navigation', { name: 'Ana gezinti' })
  for (const name of ['Veri kaynakları', 'Gizlilik', 'Hakkında', 'Araçlar']) {
    await header.getByRole('link', { name }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  }
  expect(loaderRequests).toEqual([])
  expect(errors).toEqual([])
})

test('home page offers the last 12 months in a drawer that applies a month and closes', async ({
  page,
}) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: /Son 12 ayın oranları/ })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('tbody tr').first()).toBeHidden()
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('tbody tr')).toHaveCount(12)
  await page.locator('tbody tr').nth(1).getByRole('button', { name: 'Kullan' }).click()
  await expect(page.getByLabel('Uygulanacak artış oranı')).toHaveValue('31,79')
  await expect(page.getByTestId('new-rent')).toHaveText('₺13.179,00')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(page.locator('tbody tr[aria-selected="true"]')).toContainText('Eylül 2026')
})

test('opening the rates drawer never causes horizontal scroll', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Son 12 ayın oranları/ }).click()
  for (const w of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width: w, height: 900 })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow, `width ${w}`).toBe(false)
  }
})

test('on a phone the drawer shows the use buttons without sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await page.getByRole('button', { name: /Son 12 ayın oranları/ }).click()
  const button = page.locator('tbody tr').first().getByRole('button', { name: 'Kullan' })
  await button.scrollIntoViewIfNeeded()
  const box = (await button.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(360)
  expect(box.height).toBeGreaterThanOrEqual(44)
})
