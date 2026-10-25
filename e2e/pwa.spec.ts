import { expect, test } from '@playwright/test'

test('manifest is linked and the site works offline after the first visit', async ({
  page,
  context,
}) => {
  await page.goto('/')
  expect(await page.locator('link[rel="manifest"]').getAttribute('href')).toContain('manifest')
  await page.evaluate(() => navigator.serviceWorker.ready)
  // let the worker finish precaching, then take a fresh load under its control
  await page.reload()
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  await page.goto('/araclar/kira-artis-hesabi')
  await expect(page.getByLabel('Uygulanacak artış oranı')).toHaveValue('31,49')

  await context.setOffline(true)
  await page.goto('/araclar/kira-artis-hesabi')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kira artış hesabı')
  await expect(page.getByLabel('Uygulanacak artış oranı')).toHaveValue('31,49')
  await context.setOffline(false)
})
