import type { BrowserContext, Page } from "@playwright/test"

export async function openExtension(page: Page, context: BrowserContext) {
  let [background] = context.serviceWorkers()
  if (!background) {
    background = await context.waitForEvent("serviceworker")
  }
  const url = background.url().replace("/background.js", "/index.html")
  await page.goto(url)
}
