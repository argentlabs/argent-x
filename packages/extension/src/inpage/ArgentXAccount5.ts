import {
  Abi,
  Account,
  AccountInterface,
  Call,
  DeclareContractPayload,
  DeclareContractResponse,
  InvocationsDetails,
  ProviderInterface,
  Signature,
  defaultProvider,
  ec,
} from "starknet5"

import { sendMessage, waitForMessage } from "./messageActions"
import { StarknetMethodArgumentsSchemas } from "starknetkit/window"
import { SignMessageOptions } from "../shared/messages/ActionMessage"
import { TypedData } from "@starknet-io/types-js"
import { signTypedDataHandler } from "./requestMessageHandlers/signTypedData"

/**
 *  This is the latest Account Object that is imported from starknet.js.
 *  Currently, this Account Object supports transaction v1 introduced with starknet v0.10.0
 */
export class ArgentXAccount5 extends Account implements AccountInterface {
  constructor(address: string, provider?: ProviderInterface) {
    // since account constructor is taking a KeyPair,
    // we set a dummy one (never used anyway)
    const pk = ec.starkCurve.utils.randomPrivateKey()
    super(provider || defaultProvider, address, pk)
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

  public async declare(
    { contract, classHash, casm, compiledClassHash }: DeclareContractPayload,
    _transactionsDetail?: InvocationsDetails | undefined,
  ): Promise<DeclareContractResponse> {
    sendMessage({
      type: "REQUEST_DECLARE_CONTRACT",
      data: {
        payload: {
          contract,
          classHash,
          casm,
          compiledClassHash,
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
