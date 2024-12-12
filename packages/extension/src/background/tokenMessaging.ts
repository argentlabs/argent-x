import type { TokenMessage } from "../shared/messages/TokenMessage"
import { defaultNetwork } from "../shared/network"
import { tokenService } from "../shared/token/__new/service"
import type { HandleMessage } from "./background"
import { UnhandledMessage } from "./background"

export const handleTokenMessaging: HandleMessage<TokenMessage> = async ({
  msg,
  origin,
  background: { wallet, actionService },
  respond,
}) => {
  switch (msg.type) {
    case "REQUEST_TOKEN": {
      const selectedAccount = await wallet.getSelectedAccount()
      const token = await tokenService.getToken({
        address: msg.data.address,
        networkId:
          selectedAccount?.networkId ?? msg.data.networkId ?? defaultNetwork.id,
      })
      const exists = Boolean(token)
      let actionHash: string | undefined

      if (!exists) {
        const { meta } = await actionService.add(
          {
            type: "REQUEST_TOKEN",
            payload: msg.data,
          },
          {
            origin,
          },
        )

        actionHash = meta.hash
      }

      return respond({
        type: "REQUEST_TOKEN_RES",
        data: {
          exists,
          actionHash,
        },
      })
    }

    case "REJECT_REQUEST_TOKEN": {
      return await actionService.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
