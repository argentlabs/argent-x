import type { Page } from "@playwright/test"

export async function openExtension(page: Page) {
  await page.waitForTimeout(1000) // give the extension time to startup
  await page.goto(
    "chrome-extension://doejacbklailgdhaiolhenjojmjcgbjp/index.html",
  )
}
