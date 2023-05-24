import {
  Abi,
  Account,
  Call,
  InvocationsDetails,
  Provider,
  ProviderInterface,
  Signature,
  defaultProvider,
  ec,
  typedData,
} from "starknet3"

import type { Network } from "../shared/network"
import { sendMessage, waitForMessage } from "./messageActions"

/**
 *  This is Account Object is imported from starknet v3.
 *  It is used for very old accounts which are now deprecated and needs to be upgraded to v4.
 */
export class ArgentXAccount3 extends Account {
  constructor(address: string, provider?: ProviderInterface) {
    // since account constructor is taking a KeyPair,
    // we set a dummy one (never used anyway)
    const keyPair = ec.getKeyPair(0)
    super(provider || defaultProvider, address, keyPair)
  }

  public override async execute(
    transactions: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
  ): ReturnType<Account["execute"]> {
    sendMessage({
      type: "EXECUTE_TRANSACTION",
      data: { transactions, abis, transactionsDetail },
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
      code: "TRANSACTION_RECEIVED",
      transaction_hash: result.txHash,
    }
  }

  public override async signMessage(
    data: typedData.TypedData,
  ): Promise<Signature> {
    sendMessage({ type: "SIGN_MESSAGE", data })
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
        .then(() => "error" as const)
        .catch(() => {
          sendMessage({ type: "SIGNATURE_FAILURE", data: { actionHash } })
          return "timeout" as const
        }),
    ])

    if (result === "error") {
      throw Error("User abort")
    }
    if (result === "timeout") {
      throw Error("User action timed out")
    }

    return result.signature
  }
}

export function getProvider3(network: Network) {
  return new Provider({ baseUrl: network.baseUrl })
}
