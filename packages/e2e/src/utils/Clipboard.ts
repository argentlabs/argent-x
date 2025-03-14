import type { Page } from "@playwright/test"
import { v4 as uuid } from "uuid"

export default class Clipboard {
  public page: Page
  private static clipboardContents = new Map<string, string>()
  private readonly clipboardId: string

  constructor(page: Page) {
    this.page = page
    this.clipboardId = `${process.env.workerIndex || "0"}-${uuid()}`
  }

  private getContent(): string {
    return Clipboard.clipboardContents.get(this.clipboardId) || ""
  }

  private setContent(content: string): void {
    Clipboard.clipboardContents.set(this.clipboardId, content)
  }

  async getSystemClipboard(): Promise<string> {
    try {
      const clipText = await this.page.evaluate(async () => {
        try {
          // Try Clipboard API first
          if (navigator.clipboard?.readText) {
            return await navigator.clipboard.readText()
          }

          // Fallback to execCommand
          const textarea = document.createElement("textarea")
          textarea.style.position = "fixed"
          textarea.style.opacity = "0"
          document.body.appendChild(textarea)
          textarea.focus()

          try {
            document.execCommand("paste")
            return textarea.value
          } finally {
            textarea.remove()
          }
        } catch (e) {
          return ""
        }
      })

      if (clipText) {
        this.setContent(clipText)
      }
      return clipText
    } catch (error) {
      console.warn("Failed to read system clipboard:", error)
      return this.getContent()
    }
  }

  async setClipboardText(text: string): Promise<void> {
    this.setContent(String(text))

    try {
      // Try using the Clipboard API first
      await this.page.evaluate(async (text) => {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          return
        }

        // Fallback to execCommand
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()

        try {
          document.execCommand("copy")
        } finally {
          textarea.remove()
        }
      }, text)
    } catch (error) {
      console.warn("Failed to write to system clipboard:", error)
      // Continue since we've already updated internal clipboard state
    }

    await this.page.waitForTimeout(100)
  }

  async getClipboard(): Promise<string> {
    return this.getContent()
  }

  async paste(): Promise<void> {
    const key = process.platform === "darwin" ? "Meta" : "Control"
    await this.page.keyboard.press(`${key}+v`)
    await this.page.waitForTimeout(100)
  }

  async clear(): Promise<void> {
    Clipboard.clipboardContents.delete(this.clipboardId)
  }

  // For debugging purposes
  logClipboard(): void {
    console.log(`[Clipboard ${this.clipboardId}] Content:`, this.getContent())
  }
}
