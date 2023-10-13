import type { PlaywrightTestConfig } from "@playwright/test"
import config from "./src/config"

const isCI = Boolean(process.env.CI)

const playwrightConfig: PlaywrightTestConfig = {
  projects: [
    {
      name: "WebWallet - Chrome",
      use: {
        browserName: "chromium",
      },
    },
    {
      name: "WebWallet - Firefox",
      use: {
        browserName: "firefox",
      },
    },
    {
      name: "WebWallet - WebKit",
      use: {
        browserName: "webkit",
      },
    },
  ],
  expect: {
    timeout: 20 * 1000, // 20 seconds
  },
  timeout: 1 * 60e3, // 1 minutes
  retries: isCI ? 2 : 0,
  workers: 1,
  reportSlowTests: {
    threshold: 2 * 60e3, // 2 minute
    max: 5,
  },
  reporter: isCI ? [["github"], ["blob"]] : "list",

  forbidOnly: isCI,
  outputDir: config.artifactsDir,
  preserveOutput: isCI ? "failures-only" : "never",
}

export default playwrightConfig
