import {
  AddInvokeTransactionParameters,
  AddInvokeTransactionResult,
} from "@starknet-io/types-js"
import { RpcCallsArraySchema } from "starknetkit/window"
import { sendMessage, waitForMessage } from "../messageActions"
import { WalletRPCError, WalletRPCErrorCodes } from "./errors"

export async function addInvokeTransactionHandler(
  params: AddInvokeTransactionParameters,
): Promise<AddInvokeTransactionResult> {
  const parsedTransaction = RpcCallsArraySchema.safeParse(params.calls)

  if (!parsedTransaction.success) {
    throw Error(`Invalid transaction: ${parsedTransaction.error.message}`)
  }

  sendMessage({
    type: "EXECUTE_TRANSACTION",
    data: {
      transactions: parsedTransaction.data,
    },
  })
  const { actionHash } = await waitForMessage("EXECUTE_TRANSACTION_RES", 1000)
  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "TRANSACTION_SUBMITTED",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "TRANSACTION_FAILED",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({ type: "TRANSACTION_FAILED", data: { actionHash } })
        return "timeout" as const
      }),
  ])

  if (result === "error") {
    throw new WalletRPCError({ code: WalletRPCErrorCodes.UserAborted })
  }
  if (result === "timeout") {
    throw new WalletRPCError({ code: WalletRPCErrorCodes.Unknown })
  }

  return {
    transaction_hash: result.txHash,
  }
}
