import {
  Abi,
  Account,
  Call,
  DeclareContractPayload,
  DeclareContractResponse,
  InvocationsDetails,
  ProviderInterface,
  Signature,
  defaultProvider,
  ec,
  typedData,
} from "starknet"

import { sendMessage, waitForMessage } from "./messageActions"

/**
 *  This is the latest Account Object that is imported from starknet.js.
 *  Currently, this Account Object supports transaction v1 introduced with starknet v0.10.0
 */
export class ArgentXAccount extends Account {
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
      transaction_hash: result.txHash,
    }
  }

  public override async declare(
    { classHash, contract }: DeclareContractPayload,
    _transactionsDetail?: InvocationsDetails | undefined,
  ): Promise<DeclareContractResponse> {
    sendMessage({
      type: "REQUEST_DECLARE_CONTRACT",
      data: { classHash, contract },
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
