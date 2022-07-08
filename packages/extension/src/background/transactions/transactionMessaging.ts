import { number } from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { HandleMessage, UnhandledMessage } from "../background"

export const handleTransactionMessage: HandleMessage<
  TransactionMessage
> = async ({
  msg,
  background: { wallet, transactionTracker, actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_TRANSACTIONS": {
      const transactions = await transactionTracker.getAll()

      return sendToTabAndUi({
        type: "GET_TRANSACTIONS_RES",
        data: transactions,
      })
    }

    case "GET_TRANSACTION": {
      const tracked = await transactionTracker.get({
        hash: msg.data.hash,
        account: { networkId: msg.data.network },
      })
      if (tracked) {
        return sendToTabAndUi({ type: "GET_TRANSACTION_RES", data: tracked })
      }

      return sendToTabAndUi({ type: "GET_TRANSACTION_REJ" })
    }

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

    case "UPDATE_TRANSACTION_FEE": {
      const { actionHash } = msg.data
      await actionQueue.override(actionHash, {
        maxFee: msg.data.maxFee,
      })

      return sendToTabAndUi({
        type: "UPDATE_TRANSACTION_FEE_RES",
        data: { actionHash },
      })
    }

    case "TRANSACTION_FAILED": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
