import type { PlaywrightTestConfig } from "@playwright/test"
import { isCI, artifactsDir } from "../shared/cfg/test"

const playwrightConfig: PlaywrightTestConfig = {
  projects: [
    {
      name: "ArgentX",
      use: {
        trace: "retain-on-failure",
        viewport: { width: 1080, height: 720 },
        actionTimeout: 120 * 1000, // 2 minute
        permissions: ["clipboard-read", "clipboard-write"],
        screenshot: "only-on-failure",
      },
      timeout: 5 * 60e3, // 5 minutes
      expect: { timeout: 120 * 1000 }, // 2 minute
      testDir: "./src/specs",
      testMatch: /\.spec.ts$/,
      retries: isCI ? 1 : 0,
      outputDir: artifactsDir,
    },
  ],
  workers: isCI ? 2 : 1,
  fullyParallel: true,
  reportSlowTests: {
    threshold: 2 * 60e3, // 2 minutes
    max: 5,
  },
  reporter: isCI ? [["github"], ["blob"], ["list"]] : "list",
  forbidOnly: isCI,
  outputDir: artifactsDir,
  preserveOutput: isCI ? "failures-only" : "never",
  globalTeardown: "../shared/cfg/global.teardown.ts",
}

export default playwrightConfig
