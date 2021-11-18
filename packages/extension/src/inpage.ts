import {
  AddTransactionResponse,
  Provider,
  Signer,
  SignerInterface,
  Transaction,
  defaultProvider,
} from "starknet"

import { RpcMessage } from "./app/utils/messaging.model"
import { EmitFn, Messenger } from "./utils/Messenger"

const allowedSender = ["INJECT", "UI", "BACKGROUND"]
const messenger = new Messenger(
  (emit) => {
    window.addEventListener("message", (event) => {
      if (
        event.data.from &&
        event.data.type &&
        allowedSender.includes(event.data.from)
      ) {
        const { type, data } = event.data
        emit(type, data)
      }
    })
  },
  (type, data) => {
    window.postMessage({ from: "INPAGE", type, data }, "*")
  },
)

type StarknetWindowObject =
  | {
      request: (call: RpcMessage) => Promise<unknown>
      enable: () => Promise<string[]>
      signer: Signer
      provider: Provider
      selectedAddress: string
      isConnected: true
    }
  | {
      request: (call: RpcMessage) => Promise<unknown>
      enable: () => Promise<string[]>
      signer?: Signer
      provider: Provider
      selectedAddress?: string
      isConnected: false
    }

// window.ethereum like
const starknetWindowObject: StarknetWindowObject = {
  signer: undefined,
  provider: defaultProvider,
  selectedAddress: undefined,
  isConnected: false,
  request: (call) =>
    new Promise((resolve) => {
      messenger.emit("RPC", call)
      messenger.listen((type, data) => {
        if (type === "RPC_RES") {
          resolve(data)
        }
      })
    }),
  enable: () =>
    new Promise((resolve) => {
      messenger.emit("CONNECT", {
        host: window.location.hostname,
      })
      messenger.listen((type, data) => {
        if (type === "CONNECT_RES" && typeof data === "string") {
          ;(window as any).starknet.signer = new WalletSigner(data)
          ;(window as any).starknet.selectedAddress = data
          ;(window as any).starknet.isConnected = true
          resolve([data])
        }
      })
    }),
}

;(window as any).starknet = starknetWindowObject

export class WalletSigner extends Provider implements SignerInterface {
  public address: string

  constructor(address: string) {
    super()
    this.address = address
  }

  private sendMsg(type: string, data: any) {
    return messenger.emit(type, data)
  }

  private waitForMsgOfType(type: string, timeout = 5 * 60 * 1000) {
    return new Promise((resolve, reject) => {
      const pid = setTimeout(() => reject("Timeout"), timeout)
      const handler: EmitFn = (eType, eData) => {
        if (eType === type) {
          clearTimeout(pid)
          messenger.unlisten(handler)
          return resolve(eData)
        }
      }
      messenger.listen(handler)
    })
  }

  public async addTransaction(
    transaction: Transaction,
  ): Promise<AddTransactionResponse> {
    if (transaction.type === "DEPLOY") return super.addTransaction(transaction)

    if (transaction.signature?.length)
      throw Error("Adding signatures to a signer tx currently isn't supported")

    this.sendMsg("ADD_TRANSACTION", transaction)
    this.sendMsg("OPEN_UI", {})

    const res: any = await Promise.race([
      this.waitForMsgOfType("SUBMITTED_TX", 11 * 60 * 1000),
      this.waitForMsgOfType("FAILED_TX", 10 * 60 * 1000)
        .then(() => "error")
        .catch(() => {
          this.sendMsg("FAILED_TX", { tx: transaction })
          return "timeout"
        }),
    ])

    if (res === "error") throw Error("User abort")
    if (res === "timeout") throw Error("User action timed out")

    return {
      code: "TRANSACTION_RECEIVED",
      address: transaction.contract_address,
      transaction_hash: res.txHash,
    }
  }
}
