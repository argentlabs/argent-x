import { TokenMessage } from "../shared/messages/TokenMessage"
import { defaultNetwork } from "../shared/network"
import { hasToken } from "../shared/token/storage"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleTokenMessaging: HandleMessage<TokenMessage> = async ({
  msg,
  background: { actionQueue, wallet },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "REQUEST_TOKEN": {
      const selectedAccount = await wallet.getSelectedAccount()
      const exists = await hasToken({
        networkId:
          selectedAccount?.networkId ?? msg.data.networkId ?? defaultNetwork.id,
        ...msg.data,
      })

      if (!exists) {
        const { meta } = await actionQueue.push({
          type: "REQUEST_TOKEN",
          payload: msg.data,
        })

        return sendToTabAndUi({
          type: "REQUEST_TOKEN_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      return sendToTabAndUi({
        type: "REQUEST_TOKEN_RES",
        data: {},
      })
    }

    case "REJECT_REQUEST_TOKEN": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
