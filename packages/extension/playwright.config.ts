import path from "path"

import type { PlaywrightTestConfig } from "@playwright/test"

import config from "./e2e/src/config"

const isCI = Boolean(process.env.CI)

const playwrightConfig: PlaywrightTestConfig = {
  workers: 1,
  timeout: 5 * 60e3, // 5 minutes
  reportSlowTests: {
    threshold: 1 * 60e3, // 1 minute
    max: 5,
  },
  expect: { timeout: 90 * 1000 }, // 90 seconds
  reporter: isCI
    ? [
        ["github"],
        [
          "json",
          { outputFile: path.join(config.reportsDir, "extension.json") },
        ],
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
  testDir: "e2e/src/specs",
  testMatch: /\.spec.ts$/,
  retries: isCI ? 2 : 0,
  use: {
    trace: "on-first-retry",
    viewport: { width: 360, height: 600 },
    actionTimeout: 60 * 1000, // 1 minute
    permissions: ["clipboard-read", "clipboard-write"],
  },
  outputDir: config.artifactsDir,
  preserveOutput: isCI ? "failures-only" : "never",
}

export default playwrightConfig
