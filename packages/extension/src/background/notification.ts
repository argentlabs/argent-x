import { Status } from "starknet"
import browser from "webextension-polyfill"

import { TransactionMeta } from "../shared/transactions"

export async function sentTransactionNotification(
  hash: string,
  status: Status,
  meta?: TransactionMeta,
) {
  const id = `TX:${hash}`
  const title = `${meta?.title || "Transaction"} ${
    ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2", "PENDING"].includes(status)
      ? "succeeded"
      : "rejected"
  }`
  return browser.notifications.create(id, {
    type: "basic",
    title,
    message: `${hash}\nStatus: ${status}`,
    iconUrl: "./assets/logo.png",
    eventTime: Date.now(),
  })
}
