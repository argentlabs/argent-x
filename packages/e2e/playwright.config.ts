import type { PlaywrightTestConfig } from "@playwright/test"
import config from "./src/config"

const playwrightConfig: PlaywrightTestConfig = {
  projects: [
    {
      name: "ArgentX",
      use: {
        actionTimeout: 30000, // Maximum time for individual actions (clicks, navigation, etc)
        navigationTimeout: 30000, // Maximum time to wait for navigation
        permissions: ["clipboard-read", "clipboard-write"],
        launchOptions: {
          slowMo: 500,
        },
      },
      timeout: config.isCI ? 10 * 60e3 : 3 * 60e3,
      expect: { timeout: config.isCI ? 2 * 60e3 : 1 * 60e3 }, // 1 minute
      testDir: "./src/specs",
      testMatch: /\.spec.ts$/,
      retries: config.isCI ? 1 : 0,
      outputDir: config.artifactsDir,
    },
  ],
  workers: config.isCI ? 2 : 1,
  fullyParallel: true,
  reportSlowTests: {
    threshold: 2 * 60e3, // 2 minutes
    max: 5,
  },
  reporter: config.isCI ? [["github"], ["blob"], ["list"]] : "list",
  forbidOnly: config.isCI,
  outputDir: config.artifactsDir,
  preserveOutput: "failures-only",
  globalTeardown: "./src/utils/global.teardown.ts",
}

export default playwrightConfig
