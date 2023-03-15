import { difference } from "lodash-es"
import browser from "webextension-polyfill"

import { PreAuthorisationMessage } from "../shared/messages/PreAuthorisationMessage"
import { isPreAuthorized, preAuthorizeStore } from "../shared/preAuthorizations"
import { addTab, sendMessageToHost } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"

export function getOriginFromSender(
  sender: browser.runtime.MessageSender,
): string {
  const url = sender.origin ?? sender.url
  if (!url) {
    throw new Error("Message sender has no origin or url")
  }
  const { origin } = new URL(url) // Firefox uses url, Chrome uses origin
  return origin
}

preAuthorizeStore.subscribe(async (_, changeSet) => {
  const removed = difference(changeSet.oldValue ?? [], changeSet.newValue ?? [])
  for (const preAuthorization of removed) {
    await sendMessageToHost(
      { type: "DISCONNECT_ACCOUNT" },
      preAuthorization.host,
    )
  }
})

export const handlePreAuthorizationMessage: HandleMessage<
  PreAuthorisationMessage
> = async ({
  msg,
  sender,
  port,
  background: { wallet, actionQueue },
  respond,
}) => {
  async function addSenderTab() {
    const origin = getOriginFromSender(sender)
    if (sender.tab?.id && port) {
      await addTab({
        id: sender.tab?.id,
        host: origin,
        port,
      })
    }
  }

  switch (msg.type) {
    case "ARGENT_CONNECT_DAPP": {
      const selectedAccount = await wallet.getSelectedAccount()
      if (!selectedAccount) {
        openUi()
        return
      }
      const origin = getOriginFromSender(sender)
      const isAuthorized = await isPreAuthorized(selectedAccount, origin)
      await addSenderTab()

      if (!isAuthorized) {
        await actionQueue.push({
          type: "CONNECT_DAPP",
          payload: { host: origin },
        })
      }

      if (isAuthorized && selectedAccount?.address) {
        return respond({
          type: "CONNECT_DAPP_RES",
          data: selectedAccount,
        })
      }

      return openUi()
    }

    case "IS_PREAUTHORIZED": {
      const selectedAccount = await wallet.getSelectedAccount()
      await addSenderTab()

      if (!selectedAccount) {
        return respond({ type: "IS_PREAUTHORIZED_RES", data: false })
      }

      const origin = getOriginFromSender(sender)
      const valid = await isPreAuthorized(selectedAccount, origin)

      return respond({ type: "IS_PREAUTHORIZED_RES", data: valid })
    }
  }

  throw new UnhandledMessage()
}
