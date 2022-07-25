import { PreAuthorisationMessage } from "../shared/messages/PreAuthorisationMessage"
import { isPreAuthorized } from "../shared/preAuthorizations"
import { addTab } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"

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
      if (!selectedAccount) {
        openUi()
        return
      }
      const isAuthorized = await isPreAuthorized(selectedAccount, msg.data.host)

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

    case "IS_PREAUTHORIZED": {
      const selectedAccount = await wallet.getSelectedAccount()

      if (!selectedAccount) {
        return sendToTabAndUi({ type: "IS_PREAUTHORIZED_RES", data: false })
      }

      const valid = await isPreAuthorized(selectedAccount, msg.data)
      return sendToTabAndUi({ type: "IS_PREAUTHORIZED_RES", data: valid })
    }
  }

  throw new UnhandledMessage()
}
