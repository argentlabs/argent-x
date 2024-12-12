import type {
  Abi,
  Call,
  InvocationsDetails,
  ProviderInterface,
  Signature,
  AccountInterface,
} from "starknet4"
import { defaultProvider, ec, Account } from "starknet4"

import { sendMessage, waitForMessage } from "./messageActions"
import type { TypedData } from "starknet"
import { StarknetMethodArgumentsSchemas } from "@argent/x-window"
import type { SignMessageOptions } from "../shared/messages/ActionMessage"
import { signTypedDataHandler } from "./requestMessageHandlers/signTypedData"

/**
 *  This is Account Object is imported from starknet v4.
 *  It is used for backward compatibility with dapps that still uses starknetjs v4.
 *  It is injected into the window object by the extension when get-starknet calls enable on StarknetWindowObject
 *  with starknetJsVersion = "v4".
 */
export class ArgentXAccount4 extends Account implements AccountInterface {
  constructor(address: string, provider?: ProviderInterface) {
    // since account constructor is taking a KeyPair,
    // we set a dummy one (never used anyway)
    const keyPair = ec.getKeyPair(0)
    super(provider || defaultProvider, address, keyPair)
  }

  public async execute(
    transactions: Call | Call[],
    _?: Abi[],
    transactionsDetail?: InvocationsDetails,
  ): ReturnType<Account["execute"]> {
    const [parsedTransactions, parsedTransactionsDetail] =
      await StarknetMethodArgumentsSchemas.execute.parseAsync([
        transactions,
        transactionsDetail,
      ])

    sendMessage({
      type: "EXECUTE_TRANSACTION",
      data: {
        transactions: parsedTransactions,
        transactionsDetail: parsedTransactionsDetail,
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

  public async signMessage(
    typedData: TypedData,
    options: SignMessageOptions = { skipDeploy: false },
  ): Promise<Signature> {
    return signTypedDataHandler({
      ...typedData,
      skipDeploy: options.skipDeploy, // Required because it's a custom field
    } as TypedData)
  }
}
