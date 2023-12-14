import {
  Abi,
  Call,
  InvocationsDetails,
  ProviderInterface,
  Signature,
  defaultProvider,
  ec,
  typedData,
  Account,
  AccountInterface,
} from "starknet4"

import { sendMessage, waitForMessage } from "./messageActions"
import { stark } from "starknet"
import { StarknetMethodArgumentsSchemas } from "@argent/x-window"
import { SignMessageOptions } from "../shared/messages/ActionMessage"

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
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
  ): ReturnType<Account["execute"]> {
    const [parsedTransactions, parseAbis, parsedTransactionsDetail] =
      await StarknetMethodArgumentsSchemas.execute.parseAsync([
        transactions,
        abis,
        transactionsDetail,
      ])

    sendMessage({
      type: "EXECUTE_TRANSACTION",
      data: {
        transactions: parsedTransactions,
        abis: parseAbis,
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
    typedData: typedData.TypedData,
    options: SignMessageOptions = { skipDeploy: false },
  ): Promise<Signature> {
    sendMessage({ type: "SIGN_MESSAGE", data: { typedData, options } })
    const { actionHash } = await waitForMessage("SIGN_MESSAGE_RES", 1000)
    sendMessage({ type: "OPEN_UI" })

    const result = await Promise.race([
      waitForMessage(
        "SIGNATURE_SUCCESS",
        11 * 60 * 1000,
        (x) => x.data.actionHash === actionHash,
      ),
      waitForMessage(
        "SIGNATURE_FAILURE",
        10 * 60 * 1000,
        (x) => x.data.actionHash === actionHash,
      )
        .then((x) => x)
        .catch((e) => {
          sendMessage({
            type: "SIGNATURE_FAILURE",
            data: { actionHash, error: e.message }, // this error will be thrown by waitForMessage after the timeout
          })
          return "timeout" as const
        }),
    ])

    if (result === "timeout") {
      throw Error("User action timed out")
    }

    if ("error" in result) {
      throw Error(result.error)
    }

    return stark.formatSignature(result.signature)
  }
}
