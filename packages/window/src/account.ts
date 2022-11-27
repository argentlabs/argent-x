import type {
  Abi,
  Call,
  DeclareSignerDetails,
  InvocationsSignerDetails,
  ProviderInterface,
  Signature,
  SignerInterface,
} from "starknet"
import { Account, typedData } from "starknet"

import type { WalletMessenger } from "./messages"

class MessageSigner implements SignerInterface {
  constructor(private readonly messager: WalletMessenger) {}

  async getPubKey(): Promise<string> {
    const dataPromise = this.messager.listenMessage("GET_PUBKEY_RESPONSE")
    this.messager.postMessage({ type: "GET_PUBKEY_REQUEST" })
    const data = await dataPromise
    return data.pubkey
  }

  async signMessage(
    typedData: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const receiptPromise = this.messager.listenMessage(
      "SIGN_MESSAGE_REQUEST_RECEIPT",
    )
    this.messager.postMessage({
      type: "SIGN_MESSAGE_REQUEST",
      data: { typedData, accountAddress },
    })
    const receipt = await receiptPromise
    const dataOrError = await Promise.race([
      this.messager.listenMessage(
        "SIGN_MESSAGE_RESPONSE",
        (message) => message.meta.forReceiptId === receipt.receiptId,
      ),
      this.messager.listenMessage(
        "SIGN_MESSAGE_FAILURE",
        (message) => message.meta.forReceiptId === receipt.receiptId,
      ),
    ])

    if ("error" in dataOrError) {
      throw Error(dataOrError.error)
    }

    return dataOrError.signature
  }

  async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[] | undefined,
  ): Promise<Signature> {
    const receiptPromise = this.messager.listenMessage(
      "SIGN_TRANSACTION_REQUEST_RECEIPT",
    )
    this.messager.postMessage({
      type: "SIGN_TRANSACTION_REQUEST",
      data: { transactions, transactionsDetail, abis },
    })
    const receipt = await receiptPromise
    const dataOrError = await Promise.race([
      this.messager.listenMessage(
        "SIGN_TRANSACTION_RESPONSE",
        (m) => m.meta.forReceiptId === receipt.receiptId,
      ),
      this.messager.listenMessage(
        "SIGN_TRANSACTION_FAILURE",
        (m) => m.meta.forReceiptId === receipt.receiptId,
      ),
    ])

    if ("error" in dataOrError) {
      throw new Error(dataOrError.error)
    }

    return dataOrError.signature
  }

  async signDeclareTransaction(
    declareContract: DeclareSignerDetails,
  ): Promise<Signature> {
    const receiptPromise = this.messager.listenMessage(
      "SIGN_DECLARE_TRANSACTION_REQUEST_RECEIPT",
    )
    this.messager.postMessage({
      type: "SIGN_DECLARE_TRANSACTION_REQUEST",
      data: { declareContract },
    })
    const receipt = await receiptPromise
    const dataOrError = await Promise.race([
      this.messager.listenMessage(
        "SIGN_DECLARE_TRANSACTION_RESPONSE",
        (m) => m.meta.forReceiptId === receipt.receiptId,
      ),
      this.messager.listenMessage(
        "SIGN_DECLARE_TRANSACTION_FAILURE",
        (m) => m.meta.forReceiptId === receipt.receiptId,
      ),
    ])

    if ("error" in dataOrError) {
      throw new Error(dataOrError.error)
    }

    return dataOrError.signature
  }

  async signDeployAccountTransaction(): Promise<Signature> {
    throw new Error(
      "Method not implemented. Account normally gets deployed by the Wallet and doesnt need to be done explicitly.",
    )
  }
}

export class MessageAccount extends Account {
  constructor(
    messenger: WalletMessenger,
    provider: ProviderInterface,
    public address: string,
    public signer = new MessageSigner(messenger),
  ) {
    super(provider, address, signer)
  }
}
