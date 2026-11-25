import { defineConfig, devices } from '@playwright/test'

// 워크트리마다 PORT를 다르게 주면 다른 워크트리의 dev 서버를 재사용하지 않는다
const PORT = Number(process.env.PORT ?? 3000)
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // CI는 verify가 build를 먼저 하므로 production 서버로 띄운다
    command: `${process.env.CI ? 'pnpm start' : 'pnpm dev'} --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
})
