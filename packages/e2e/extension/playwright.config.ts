import type { PlaywrightTestConfig } from "@playwright/test"
import config from "./src/config"

const isCI = Boolean(process.env.CI)

const playwrightConfig: PlaywrightTestConfig = {
  projects: [
    {
      name: "ArgentX",
      use: {
        trace: "on-first-retry",
        viewport: { width: 360, height: 600 },
        actionTimeout: 60 * 1000, // 1 minute
        permissions: ["clipboard-read", "clipboard-write"],
      },
      timeout: 5 * 60e3, // 5 minutes
      expect: { timeout: 30 * 1000 }, // 30 seconds
      testDir: "./src/specs",
      testMatch: /\.spec.ts$/,
      retries: isCI ? 1 : 0,
      outputDir: config.artifactsDir,
    },
  ],
  workers: 1,
  reportSlowTests: {
    threshold: 1 * 60e3, // 1 minute
    max: 5,
  },
  reporter: isCI ? [["github"], ["blob"]] : "list",
  forbidOnly: isCI,
  outputDir: config.artifactsDir,
  preserveOutput: isCI ? "failures-only" : "never",
}

export default playwrightConfig
