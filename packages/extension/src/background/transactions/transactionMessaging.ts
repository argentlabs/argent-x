import { Account, EstimateFeeResponse, number } from "starknet"
import { ZERO } from "starknet/src/constants"
import { Sequencer } from "starknet/src/types/api/index"
import { InvocationsSignerDetails } from "starknet/src/types/index"
import {
  feeTransactionVersion,
  getSelectorFromName,
} from "starknet/src/utils/hash"
import { fromCallsToExecuteCalldataWithNonce } from "starknet/src/utils/transaction"
import {
  bigNumberishArrayToDecimalStringArray,
  toBN,
  toHex,
} from "starknet/utils/number"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { HandleMessage, UnhandledMessage } from "../background"

async function fetch_trace(starknetAccount: Account, calls: any) {
  const provider: any = (starknetAccount as any).provider

  const transactions = Array.isArray(calls) ? calls : [calls]
  const nonce = await starknetAccount.getNonce()
  const version = toBN(feeTransactionVersion)

  const signerDetails: InvocationsSignerDetails = {
    walletAddress: starknetAccount.address,
    nonce: toBN(nonce),
    maxFee: ZERO,
    version,
    chainId: starknetAccount.chainId,
  }

  const signature = await starknetAccount.signer.signTransaction(
    transactions,
    signerDetails,
  )

  const calldata = fromCallsToExecuteCalldataWithNonce(transactions, nonce)

  const functionInvocation = {
    contractAddress: starknetAccount.address,
    entrypoint: "__execute__",
    calldata,
    signature,
  }

  provider.getFetchMethod = (endpoint: any) => {
    const postMethodEndpoints = [
      "add_transaction",
      "call_contract",
      "estimate_fee",
      "simulate_transaction",
    ]
    return postMethodEndpoints.includes(endpoint) ? "POST" : "GET"
  }

  const result = await provider.fetchEndpoint(
    "simulate_transaction",
    undefined,
    {
      contract_address: functionInvocation.contractAddress,
      entry_point_selector: getSelectorFromName(functionInvocation.entrypoint),
      calldata: bigNumberishArrayToDecimalStringArray(
        functionInvocation.calldata ?? [],
      ),
      signature: bigNumberishArrayToDecimalStringArray(
        functionInvocation.signature ?? [],
      ),
      // nonce: toHex(toBN(signerDetails.nonce)),
      // max_fee: toHex(toBN(signerDetails.maxFee || 0)),
      version: toHex(toBN(signerDetails.version || 1)),
    },
  )

  console.log("=====================================================")
  console.log("trace", result)
  console.log("======================================================")

  return result
}

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
      try {
        const trace = await fetch_trace(starknetAccount, msg.data)
        const { overall_fee, suggestedMaxFee } =
          await starknetAccount.estimateFee(msg.data)

        return sendToTabAndUi({
          type: "ESTIMATE_TRANSACTION_FEE_RES",
          data: {
            amount: number.toHex(overall_fee),
            suggestedMaxFee: number.toHex(suggestedMaxFee),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            trace,
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
