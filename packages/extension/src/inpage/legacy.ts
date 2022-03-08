import {
  Abi,
  AddTransactionResponse,
  Invocation,
  InvocationsSignerDetails,
  Provider,
  Signature,
  Transaction,
  defaultProvider,
  typedData,
} from "starknet"

import { MessageType, WindowMessageType } from "../shared/MessageType"

const extId = document
  .getElementById("argent-x-extension")
  ?.getAttribute("data-extension-id")

function sendMessage(msg: MessageType): void {
  return window.postMessage(
    { ...msg, extensionId: extId },
    window.location.origin,
  )
}

function waitForMsgOfType<
  K extends MessageType["type"],
  T extends { type: K } & MessageType,
>(
  type: K,
  timeout: number,
  predicate: (x: T) => boolean = () => true,
): Promise<T extends { data: any } ? T["data"] : undefined> {
  return new Promise((resolve, reject) => {
    const pid = setTimeout(() => reject(new Error("Timeout")), timeout)
    const handler = (event: MessageEvent<WindowMessageType>) => {
      if (event.data.type === type && predicate(event.data as any)) {
        clearTimeout(pid)
        window.removeEventListener("message", handler)
        return resolve(
          ("data" in event.data ? event.data.data : undefined) as any,
        )
      }
    }
    window.addEventListener("message", handler)
  })
}

export class LEGACY_WalletSigner extends Provider {
  public address: string

  constructor(address: string, provider?: Provider) {
    super(provider || defaultProvider)
    this.address = address
  }

  public async addTransaction(
    transaction: Transaction,
  ): Promise<AddTransactionResponse> {
    console.warn(
      "!!! THIS METHOD (window.starknet.signer.addTransaction) IS DEPRECATED AND WILL BE REMOVED IN THE NEXT RELEASE !!!\nUse the window.starknet.account API instead.",
    )
    if (transaction.type === "DEPLOY") {
      throw Error("Deploy transactions are not supported.")
    }

    if (transaction.signature?.length) {
      throw Error(
        "Adding signatures to a signer transaction currently isn't supported",
      )
    }

    sendMessage({ type: "EXECUTE_TRANSACTION_LEGACY", data: transaction })
    const { actionHash } = await waitForMsgOfType(
      "EXECUTE_TRANSACTION_LEGACY_RES",
      1000,
    )
    sendMessage({ type: "OPEN_UI" })

    const result = await Promise.race([
      waitForMsgOfType(
        "TRANSACTION_SUBMITTED",
        11 * 60 * 1000,
        (x) => x.data.actionHash === actionHash,
      ),
      waitForMsgOfType(
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
      address: this.address,
      transaction_hash: result.txHash,
    }
  }

  public async hashMessage(data: typedData.TypedData): Promise<string> {
    console.warn(
      "!!! THIS METHOD (window.starknet.signer.hashMessage) IS DEPRECATED AND WILL BE REMOVED IN THE NEXT RELEASE !!!\nUse the window.starknet.account API instead.",
    )
    return typedData.getMessageHash(data, this.address)
  }

  public async signMessage(data: typedData.TypedData): Promise<Signature> {
    console.warn(
      "!!! THIS METHOD (window.starknet.signer.signMessage) IS DEPRECATED AND WILL BE REMOVED IN THE NEXT RELEASE !!!\nUse the window.starknet.account API instead.",
    )
    sendMessage({ type: "SIGN_MESSAGE", data })
    const { actionHash } = await waitForMsgOfType("SIGN_MESSAGE_RES", 1000)
    sendMessage({ type: "OPEN_UI" })

    const result = await Promise.race([
      waitForMsgOfType(
        "SIGNATURE_SUCCESS",
        11 * 60 * 1000,
        (x) => x.data.actionHash === actionHash,
      ),
      waitForMsgOfType(
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

  getPubKey(): Promise<string> {
    throw new Error("Deprecated method not supported anymore.")
  }

  signTransaction(
    _transactions: Invocation[],
    _transactionsDetail: InvocationsSignerDetails,
    _abis?: Abi[],
  ): Promise<Signature> {
    throw new Error("Deprecated method not supported anymore.")
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  invokeFunction(
    contractAddress: string,
    entrypointSelector: string,
    calldata?: string[],
    signature?: Signature,
  ): Promise<AddTransactionResponse> {
    console.warn(
      "!!! THIS METHOD (window.starknet.signer.invokeFunction) IS DEPRECATED AND WILL BE REMOVED IN THE NEXT RELEASE !!!\nUSE THE window.starknet.account API INSTEAD.",
    )
    return this.addTransaction({
      type: "INVOKE_FUNCTION",
      contract_address: contractAddress,
      entry_point_selector: entrypointSelector,
      calldata,
      signature,
    })
  }
}
