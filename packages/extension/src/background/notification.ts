import { Status } from "starknet"
import browser from "webextension-polyfill"

import { ArrayStorage } from "../shared/storage"
import { TransactionMeta } from "../shared/transactions"

const notificationsStorage = new ArrayStorage<string>(
  [],
  "core:notifications:seenTransactions",
)

export async function hasShownNotification(hash: string) {
  const [hit] = await notificationsStorage.get((h) => h === hash)
  return !!hit
}

export async function addToAlreadyShown(hash: string) {
  await notificationsStorage.push(hash)
}

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
