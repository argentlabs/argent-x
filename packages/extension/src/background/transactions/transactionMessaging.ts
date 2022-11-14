import { number, stark } from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { HandleMessage, UnhandledMessage } from "../background"
import { calculateEstimateFeeFromL1Gas } from "./transactionExecution"

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
      const transactions = msg.data
      if (!selectedAccount) {
        throw Error("no accounts")
      }
      try {
        let txFee = "0",
          maxTxFee = "0",
          accountDeploymentFee: string | undefined,
          maxADFee: string | undefined

        if (selectedAccount.needsDeploy) {
          const { overall_fee: adFee, suggestedMaxFee: suggestedADFee } =
            await wallet.getAccountDeploymentFee(selectedAccount)

          const { overall_fee, suggestedMaxFee } =
            await calculateEstimateFeeFromL1Gas(selectedAccount, transactions)

          txFee = number.toHex(overall_fee)
          maxTxFee = number.toHex(suggestedMaxFee)
          accountDeploymentFee = number.toHex(adFee) // Here, accountDeploymentFee = estimatedFee * 1.5x
          maxADFee = number.toHex(
            stark.estimatedFeeToMaxFee(suggestedADFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
          )
        } else {
          const { overall_fee, suggestedMaxFee } =
            await starknetAccount.estimateFee(transactions)

          txFee = number.toHex(overall_fee)
          maxTxFee = number.toHex(suggestedMaxFee) // Here, maxFee = estimatedFee * 1.5x
        }

        const suggestedMaxFee = number.toHex(
          stark.estimatedFeeToMaxFee(maxTxFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
        )

        return sendToTabAndUi({
          type: "ESTIMATE_TRANSACTION_FEE_RES",
          data: {
            amount: txFee,
            suggestedMaxFee,
            accountDeploymentFee,
            maxADFee,
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

    case "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE": {
      const providedAccount = msg.data
      const account = providedAccount
        ? await wallet.getAccount(providedAccount)
        : await wallet.getSelectedAccount()

      if (!account) {
        throw Error("no accounts")
      }

      try {
        const { overall_fee, suggestedMaxFee } =
          await wallet.getAccountDeploymentFee(account)

        const maxADFee = number.toHex(
          stark.estimatedFeeToMaxFee(suggestedMaxFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
        )

        return sendToTabAndUi({
          type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES",
          data: {
            accountDeploymentFee: number.toHex(overall_fee),
            maxADFee,
          },
        })
      } catch (error) {
        console.error(error)
        return sendToTabAndUi({
          type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ",
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
