import { PreAuthorisationMessage } from "../shared/messages/PreAuthorisationMessage"
import { addTab, removeTabOfHost, sendMessageToHost } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"
import {
  isPreAuthorized,
  removePreAuthorization,
  resetPreAuthorizations,
} from "./preAuthorizations"

export const handlePreAuthorizationMessage: HandleMessage<
  PreAuthorisationMessage
> = async ({
  msg,
  sender,
  background: { wallet, actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "CONNECT_DAPP": {
      const selectedAccount = await wallet.getSelectedAccount()
      const isAuthorized = await isPreAuthorized(msg.data.host)

      if (sender.tab?.id) {
        addTab({
          id: sender.tab?.id,
          host: msg.data.host,
        })
      }

      if (!isAuthorized) {
        await actionQueue.push({
          type: "CONNECT_DAPP",
          payload: { host: msg.data.host },
        })
      }

      if (isAuthorized && selectedAccount?.address) {
        return sendToTabAndUi({
          type: "CONNECT_DAPP_RES",
          data: selectedAccount,
        })
      }

      return openUi()
    }

    case "REJECT_PREAUTHORIZATION": {
      // case "REJECT_REQUEST_TOKEN":
      // case "REJECT_REQUEST_ADD_CUSTOM_NETWORK":
      // case "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK":
      // case "TRANSACTION_FAILED": {
      return await actionQueue.remove(msg.data.actionHash)
    }

    case "PREAUTHORIZE": {
      return actionQueue.push({
        type: "CONNECT_DAPP",
        payload: { host: msg.data },
      })
    }

    case "IS_PREAUTHORIZED": {
      const valid = await isPreAuthorized(msg.data)
      return sendToTabAndUi({ type: "IS_PREAUTHORIZED_RES", data: valid })
    }

    case "REMOVE_PREAUTHORIZATION": {
      const host = msg.data
      await removePreAuthorization(host)
      await sendToTabAndUi({ type: "REMOVE_PREAUTHORIZATION_RES" })
      await sendMessageToHost(
        {
          type: "DISCONNECT_ACCOUNT",
        },
        host,
      )
      removeTabOfHost(host)
      break
    }

    case "RESET_PREAUTHORIZATIONS": {
      await resetPreAuthorizations()
      return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
    }
  }

  throw new UnhandledMessage()
}
