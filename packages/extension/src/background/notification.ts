import { Status } from "starknet"
import browser from "webextension-polyfill"

import { Storage } from "./storage"

const notificationsStorage = new Storage({
  notificationsShown: [] as string[],
})

export async function sentTransactionNotification(
  hash: string,
  status: Status,
) {
  const id = `TX:${hash}`
  const displayedText = status === "ACCEPTED_ON_L2" ? "succeeded" : "rejected"
  const alreadyShownTransactions = await notificationsStorage.getItem(
    "notificationsShown",
  )
  if (!alreadyShownTransactions.includes(hash)) {
    notificationsStorage.setItem("notificationsShown", [
      ...alreadyShownTransactions,
      hash,
    ])
    return browser.notifications.create(id, {
      type: "basic",
      title: `Transaction ${displayedText}`,
      message: `Transaction: ${hash} \nStatus: ${status}`,
      iconUrl: "./assets/logo.png",
      eventTime: Date.now(),
    })
  }
}
