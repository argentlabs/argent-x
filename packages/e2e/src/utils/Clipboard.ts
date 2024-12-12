import type { Page } from "@playwright/test"

export default class Clipboard {
  page: Page
  private static clipboards: Map<number, string> = new Map()
  private readonly workerIndex: number

  constructor(page: Page) {
    this.page = page
    this.workerIndex = Number(process.env.workerIndex)
  }

  async setClipboard(): Promise<void> {
    const text = String(
      await this.page.evaluate(`navigator.clipboard.readText()`),
    )
    Clipboard.clipboards.set(this.workerIndex, text)
  }

  async setClipboardText(text: string): Promise<void> {
    Clipboard.clipboards.set(this.workerIndex, text)
  }

  async getClipboard(): Promise<string> {
    return Clipboard.clipboards.get(this.workerIndex) || ""
  }

  async paste(): Promise<void> {
    const content = Clipboard.clipboards.get(this.workerIndex) || ""
    await this.page.evaluate(
      (text) => navigator.clipboard.writeText(text),
      content,
    )
    const key = process.platform === "darwin" ? "Meta" : "Control"
    await this.page.keyboard.press(`${key}+v`)
  }

  async clear(): Promise<void> {
    Clipboard.clipboards.delete(this.workerIndex)
  }

  // Optional: method to clear all clipboards
  static clearAll(): void {
    Clipboard.clipboards.clear()
  }
}
