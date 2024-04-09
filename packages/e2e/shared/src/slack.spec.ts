import { test } from "@playwright/test"
import { notifyLowBalance } from "./assets"

test("Slack notifications", async () => {
  await notifyLowBalance()
})
