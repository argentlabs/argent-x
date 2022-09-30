import {
  Abi,
  Account,
  Call,
  InvocationsDetails,
  ProviderInterface,
  Signature,
  defaultProvider,
  ec,
  typedData,
} from "starknet4"

import { sendMessage, waitForMessage } from "./messageActions"

/**
 *  This is Account Object is imported from pre-starknet v4.5 update.
 *  As a result, this Account Object is still on transaction v0 which is backwards compatible until starknet v0.11.
 *  The main reason to use this Account Object is to "upgrade" old Accounts which supported transaction v0 to new Accounts with transaction v1
 *  This class becomes deprecated and should be removed once all accounts are on transaction v1 or when starknet v0.11 is introduced breaking the support
 *  for transaction v0
 */
export class ArgentXAccount4 extends Account {
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

    return [result.r, result.s]
  }
}
