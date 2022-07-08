import type { Page } from "@playwright/test"

export async function disableNetworkIssuesWarning(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "seenNetworkStatusState",
      `{"state":{"lastSeen":${Date.now()}},"version":0}`, // tricks the extension into not showing the warning as it thinks it's been seen
    )
  })
}
