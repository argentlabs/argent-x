import type { BrowserContext, Page } from "@playwright/test"

export async function openExtension(page: Page, context: BrowserContext) {
  const extension = context.backgroundPages()[0]
  const url = await extension.evaluate(() =>
    chrome.runtime.getURL("index.html"),
  )
  await page.goto(url)
}
