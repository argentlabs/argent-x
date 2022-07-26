import { number } from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { HandleMessage, UnhandledMessage } from "../background"

export const handleTransactionMessage: HandleMessage<
  TransactionMessage
> = async ({ msg, background: { wallet, actionQueue }, sendToTabAndUi }) => {
  switch (msg.type) {
    case "EXECUTE_TRANSACTION": {
      const { meta } = await actionQueue.push({
        type: "TRANSACTION",
        payload: msg.data,
      })
      return sendToTabAndUi({
        type: "EXECUTE_TRANSACTION_RES",
        data: { actionHash: meta.hash },
      })
    }

    case "ESTIMATE_TRANSACTION_FEE": {
      const selectedAccount = await wallet.getSelectedAccount()
      const starknetAccount = await wallet.getSelectedStarknetAccount()
      if (!selectedAccount) {
        throw Error("no accounts")
      }
      console.log(starknetAccount)
      try {
        const { amount, unit, suggestedMaxFee } =
          await starknetAccount.estimateFee(msg.data)

        return sendToTabAndUi({
          type: "ESTIMATE_TRANSACTION_FEE_RES",
          data: {
            amount: number.toHex(amount),
            unit,
            suggestedMaxFee: number.toHex(suggestedMaxFee),
          },
        })
      } catch (error) {
        console.error(error)
        return sendToTabAndUi({
          type: "ESTIMATE_TRANSACTION_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString?.() ??
              (error as any)?.toString?.() ??
              "Unkown error",
          },
        })
      }
    }

    case "TRANSACTION_FAILED": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
