import {
  AddDeclareTransactionParameters,
  AddDeclareTransactionResult,
} from "@argent/x-window"
import { sendMessage, waitForMessage } from "../messageActions"
import { json } from "starknet"

export async function addDeclareTransactionHandler(
  params: AddDeclareTransactionParameters,
): Promise<AddDeclareTransactionResult> {
  const { contract_class, compiled_class_hash } = params

  if (!contract_class.abi) {
    throw new Error("Missing ABI")
  }

  sendMessage({
    type: "REQUEST_DECLARE_CONTRACT",
    data: {
      payload: {
        contract: json.stringify(contract_class), // FIXME: this is a hack. It won't work
        compiledClassHash: compiled_class_hash,
      },
    },
  })
  const { actionHash } = await waitForMessage(
    "REQUEST_DECLARE_CONTRACT_RES",
    1000,
  )
  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "DECLARE_CONTRACT_ACTION_SUBMITTED",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "DECLARE_CONTRACT_ACTION_FAILED",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
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
    class_hash: result.classHash,
  }
}
