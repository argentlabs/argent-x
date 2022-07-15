import { PreAuthorisationMessage } from "../shared/messages/PreAuthorisationMessage"
import { addTab, removeTabOfHost, sendMessageToHost } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"
import {
  getPreAuthorizations,
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
      const isAuthorized = await isPreAuthorized({
        host: msg.data.host,
        accountAddress: selectedAccount?.address,
      })

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

    case "PREAUTHORIZE": {
      return actionQueue.push({
        type: "CONNECT_DAPP",
        payload: { host: msg.data },
      })
    }

    case "IS_PREAUTHORIZED": {
      const selectedAccount = await wallet.getSelectedAccount()
      const valid = await isPreAuthorized({
        host: msg.data,
        accountAddress: selectedAccount?.address,
      })
      return sendToTabAndUi({ type: "IS_PREAUTHORIZED_RES", data: valid })
    }

    case "REMOVE_PREAUTHORIZATION": {
      const { host, accountAddress } = msg.data
      await removePreAuthorization({ host, accountAddress })
      await sendToTabAndUi({ type: "REMOVE_PREAUTHORIZATION_RES" })
      await sendMessageToHost({ type: "DISCONNECT_ACCOUNT" }, host)
      removeTabOfHost(host)
      break
    }

    case "RESET_PREAUTHORIZATIONS": {
      await resetPreAuthorizations()
      await sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
      return sendToTabAndUi({ type: "RESET_PREAUTHORIZATIONS_RES" })
    }

    case "REJECT_PREAUTHORIZATION": {
      /** FIXME: this action type is never received here, but is received by the UI */
      return await actionQueue.remove(msg.data.actionHash)
    }

    case "GET_PRE_AUTHORIZATIONS": {
      const data = await getPreAuthorizations()
      return sendToTabAndUi({ type: "GET_PRE_AUTHORIZATIONS_RES", data })
    }
  }

  throw new UnhandledMessage()
}
