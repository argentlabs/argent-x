import { number } from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { HandleMessage, UnhandledMessage } from "../background"

export const handleTransactionMessage: HandleMessage<TransactionMessage> =
  async ({ msg, background: { wallet, actionQueue }, sendToTabAndUi }) => {
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
        try {
          let overallFee: string, suggestedFee: string

          if (selectedAccount.needsDeploy) {
            const { overall_fee, suggestedMaxFee } =
              await wallet.getAccountDeploymentFee(selectedAccount)

            overallFee = number.toHex(overall_fee)
            suggestedFee = number.toHex(suggestedMaxFee)
          } else {
            const { overall_fee, suggestedMaxFee } =
              await starknetAccount.estimateFee(msg.data)
            overallFee = number.toHex(overall_fee)
            suggestedFee = number.toHex(suggestedMaxFee)
          }

          return sendToTabAndUi({
            type: "ESTIMATE_TRANSACTION_FEE_RES",
            data: {
              amount: overallFee,
              suggestedMaxFee: suggestedFee,
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
