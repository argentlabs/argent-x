import browser from "webextension-polyfill"

import { ArrayStorage } from "../shared/storage"
import {
  ExtendedTransactionStatus,
  TransactionMeta,
} from "../shared/transactions"

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

export function sendTransactionNotification(
  hash: string,
  status: ExtendedTransactionStatus,
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

export function sendMultisigAccountReadyNotification(address: string) {
  const id = `MS:READY:${address}`
  const title = "Multisig is ready!"
  return browser.notifications.create(id, {
    type: "basic",
    title,
    message: "Your multisig account is ready to use",
    iconUrl: "./assets/logo.png",
    eventTime: Date.now(),
  })
}

export function sendMultisigTransactionNotification(hash: string) {
  const id = `MS:${hash}`
  const title = "Multisig Transaction"
  return browser.notifications.create(id, {
    type: "basic",
    title,
    message: `New multisig transaction is waiting for your approval`,
    iconUrl: "./assets/logo.png",
    eventTime: Date.now(),
  })
}
