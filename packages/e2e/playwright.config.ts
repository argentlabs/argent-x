import type { PlaywrightTestConfig } from "@playwright/test"
import config from "./src/config"

const playwrightConfig: PlaywrightTestConfig = {
  projects: [
    {
      name: "ArgentX",
      use: {
        trace: "retain-on-failure",
        actionTimeout: 120 * 1000, // 2 minute
        permissions: ["clipboard-read", "clipboard-write"],
        screenshot: "only-on-failure",
      },
      timeout: config.isCI ? 5 * 60e3 : 1 * 60e3,
      expect: { timeout: 2 * 60e3 }, // 2 minute
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
