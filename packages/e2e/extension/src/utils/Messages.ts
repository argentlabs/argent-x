import type { Page } from "@playwright/test"

export default class Messages {
  constructor(private page: Page) {}

  sendMessage = (message: any) =>
    this.page.evaluate(`window.sendMessage(${JSON.stringify(message)})`)
  waitForMessage = (message: string) =>
    this.page.evaluate(`window.waitForMessage(${JSON.stringify(message)})`)

  resetExtension() {
    return Promise.all([
      this.sendMessage({ type: "RESET_ALL" }),
      this.waitForMessage("DISCONNECT_ACCOUNT"),
    ])
  }
}
