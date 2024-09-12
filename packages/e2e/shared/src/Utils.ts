import type { Page } from "@playwright/test"

export default class Utils {
  page: Page
  constructor(page: Page) {
    this.page = page
  }

  async setClipBoardContent(text: string) {
    await this.page.evaluate(`navigator.clipboard.writeText('${text}')`)
  }

  async getClipboard() {
    return String(await this.page.evaluate(`navigator.clipboard.readText()`))
  }

  async paste() {
    const key = process.env.CI ? "Control" : "Meta"
    await this.page.keyboard.press(`${key}+KeyV`)
  }
}
