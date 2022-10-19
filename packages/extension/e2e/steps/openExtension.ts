import type { BrowserContext, Page, Worker } from "@playwright/test"

// supports manifest v2 and v3
export async function openExtension(page: Page, context: BrowserContext) {
  let background: Page | Worker | undefined
  const [bp] = context.backgroundPages()
  const [sw] = context.serviceWorkers()
  background = bp || sw
  if (!background) {
    background = await Promise.race([
      context.waitForEvent("backgroundpage"),
      context.waitForEvent("serviceworker"),
    ])
  }
  const url = new URL(background.url())
  url.pathname = "/index.html"
  await page.goto(url.toString())
  await page.bringToFront()
}
