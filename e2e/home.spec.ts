import { expect, test } from '@playwright/test'

test('비로그인 상태로 홈에 접속하면 로그인 화면으로 이동한다', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Honeymoon Plan' })).toBeVisible()
})
