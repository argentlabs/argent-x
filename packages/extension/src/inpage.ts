import {
  AddTransactionResponse,
  Provider,
  SignerInterface,
  Transaction,
} from "starknet"

import { EmitFn, Messenger } from "./utils/Messenger"

const extId = document
  .getElementById("argent-x-extension")
  ?.getAttribute("data-extension-id")

const allowedSender = ["INJECT", "UI", "BACKGROUND"]
const messenger = new Messenger(
  (emit) => {
    window.addEventListener("message", function (event) {
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

// window.ethereum like
;(window as any).starknet = {
  signer: undefined,
  selectedAddress: undefined,
  isConnected: false,
  enable: () =>
    new Promise((res) => {
      messenger.emit("CONNECT", {})
      messenger.listen((type, data) => {
        console.log("INPAGE", type, data)
        if (type === "WALLET_CONNECTED" && typeof data === "string") {
          ;(window as any).starknet.signer = new WalletSigner(data)
          ;(window as any).starknet.selectedAddress = data
          ;(window as any).starknet.isConnected = true
          res([data])
        }
      })
    }),
}

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
    return new Promise((res, rej) => {
      const pid = setTimeout(() => rej("Timeout"), timeout)
      const handler: EmitFn = (eType, eData) => {
        if (eType === type) {
          clearTimeout(pid)
          messenger.unlisten(handler)
          return res(eData)
        }
      }
      messenger.listen(handler)
    })
  }

  public async addTransaction(
    tx: Transaction,
  ): Promise<AddTransactionResponse> {
    if (tx.type === "DEPLOY") return super.addTransaction(tx)

    console.assert(
      !tx.signature,
      "Adding signatures to a signer tx currently isn't supported",
    )

    this.sendMsg("ADD_TRANSACTION", tx)
    this.sendMsg("OPEN_UI", {})

    const res: any = await Promise.race([
      this.waitForMsgOfType("SUBMITTED_TX"),
      this.waitForMsgOfType("FAILED_TX").finally(() => "error"),
    ])

    if (res === "error") throw Error("User abort")

    return {
      code: "TRANSACTION_RECEIVED",
      address: tx.contract_address,
      transaction_hash: res.txHash,
    }
  }
}
