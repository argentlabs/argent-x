import type { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { DAPP_TRANSACTION_TITLE } from "../../shared/transactions/utils"
import type { HandleMessage } from "../background"
import { UnhandledMessage } from "../background"

export const handleTransactionMessage: HandleMessage<
  TransactionMessage
> = async ({ msg, origin, background: { actionService }, respond }) => {
  switch (msg.type) {
    case "EXECUTE_TRANSACTION": {
      const { meta } = await actionService.add(
        {
          type: "TRANSACTION",
          payload: msg.data,
        },
        {
          origin,
          title: DAPP_TRANSACTION_TITLE,
          icon: "NetworkSecondaryIcon",
        },
      )
      return respond({
        type: "EXECUTE_TRANSACTION_RES",
        data: { actionHash: meta.hash },
      })
    }

    case "TRANSACTION_FAILED": {
      return await actionService.remove(msg.data.actionHash)
    }
  }
  throw new UnhandledMessage()
}
