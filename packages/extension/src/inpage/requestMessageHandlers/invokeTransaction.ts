import {
  AddInvokeTransactionParameters,
  AddInvokeTransactionResult,
  BigNumberishSchema,
} from "@argent/x-window"
import { sendMessage, waitForMessage } from "../messageActions"
import { z } from "zod"

const CallSchema = z
  .object({
    contract_address: z.string(),
    entrypoint: z.string(),
    calldata: z.array(BigNumberishSchema).optional(),
  })
  .transform(({ contract_address, entrypoint, calldata }) => ({
    contractAddress: contract_address,
    entrypoint,
    calldata: calldata || [],
  }))

const CallsArraySchema = z.array(CallSchema).nonempty()

export async function addInvokeTransactionHandler(
  params: AddInvokeTransactionParameters,
): Promise<AddInvokeTransactionResult> {
  const parsedTransaction = CallsArraySchema.safeParse(params.calls)

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
    throw Error("User abort")
  }
  if (result === "timeout") {
    throw Error("User action timed out")
  }

  return {
    transaction_hash: result.txHash,
  }
}
