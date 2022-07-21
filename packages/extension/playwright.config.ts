// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"

const config: PlaywrightTestConfig = {
  timeout: 5 * 60e3, // 5 minutes
  reportSlowTests: {
    threshold: 2 * 60e3, // 2 minutes
    max: 5,
  },
  forbidOnly: !!process.env.CI,
  testDir: "./e2e",
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "Plugin view",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 600 },
      },
    },
  ],
}

export default config
