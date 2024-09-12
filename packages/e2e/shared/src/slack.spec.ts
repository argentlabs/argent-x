import { test } from "@playwright/test"
import { getBalances, notifyLowBalance } from "./assets"
import { isCI } from "../cfg/test"

test("Slack notifications - Low Balance", async () => {
  await notifyLowBalance()
})
test("Slack notifications - balances", async () => {
  test.skip(isCI)
  await getBalances()
})
