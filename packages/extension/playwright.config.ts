// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  testDir: "./e2e",
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "Extended view",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Extended view",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 600 },
      },
    },
  ],
}

export default config
