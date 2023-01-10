import path from "path"

// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test"

import config from "./src/config"

const isCI = Boolean(process.env.CI)

const playwrightConfig: PlaywrightTestConfig = {
  timeout: 5 * 60e3, // 5 minutes
  reportSlowTests: {
    threshold: 2 * 60e3, // 2 minutes
    max: 5,
  },
  expect: { timeout: 60 * 1000 }, // 1 minute
  fullyParallel: true,
  reporter: isCI
    ? [
        ["github"],
        ["json", { outputFile: path.join(config.reportsDir, "dsx.json") }],
        ["list"],
        [
          "html",
          {
            open: "never",
            outputFolder: path.join(config.reportsDir, "playwright-report"),
          },
        ],
      ]
    : "list",
  forbidOnly: isCI,
  testDir: "src/specs",
  testMatch: /\.spec.ts$/,
  retries: isCI ? 2 : 0,
  use: {
    trace: "on-first-retry",
    viewport: { width: 360, height: 600 },
    actionTimeout: 60 * 1000, // 1 minute
  },
  outputDir: config.artifactsDir,
  preserveOutput: isCI ? "failures-only" : "never",
}

export default playwrightConfig
