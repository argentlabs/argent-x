import {
  AddTransactionResponse,
  Provider,
  SignerInterface,
  Transaction,
  defaultProvider,
} from "starknet"

import { MessageType, WindowMessageType } from "../shared/MessageType"

const extId = document
  .getElementById("argent-x-extension")
  ?.getAttribute("data-extension-id")

type StarknetWindowObject =
  | {
      enable: () => Promise<string[]>
      signer: SignerInterface
      provider: Provider
      selectedAddress: string
      isConnected: true
    }
  | {
      enable: () => Promise<string[]>
      signer?: SignerInterface
      provider: Provider
      selectedAddress?: string
      isConnected: false
    }

declare global {
  interface Window {
    starknet?: StarknetWindowObject
  }
}

function sendMessage(msg: MessageType): void {
  return window.postMessage(
    { ...msg, extensionId: extId },
    window.location.origin,
  )
}

// window.ethereum like
const starknetWindowObject: StarknetWindowObject = {
  signer: undefined,
  provider: defaultProvider,
  selectedAddress: undefined,
  isConnected: false,
  enable: () =>
    new Promise((resolve) => {
      const handler = ({ data }: MessageEvent<WindowMessageType>) => {
        const { starknet } = window
        if (!starknet) {
          return
        }

        if (data.type === "CONNECT_RES" && typeof data.data === "string") {
          window.removeEventListener("message", handler)
          starknet.signer = new WalletSigner(data.data)
          starknet.selectedAddress = data.data
          starknet.isConnected = true
          resolve([data.data])
        } else if (data.type === "CHANGE_NETWORK") {
          console.warn("network changed")
        }
      }
      window.addEventListener("message", handler)

      sendMessage({ type: "CONNECT", data: { host: window.location.host } })
    }),
}
window.starknet = starknetWindowObject

export class WalletSigner extends Provider implements SignerInterface {
  public address: string

  constructor(address: string) {
    super()
    this.address = address
  }

  private waitForMsgOfType(type: string, timeout = 5 * 60 * 1000) {
    return new Promise((resolve, reject) => {
      const pid = setTimeout(() => reject("Timeout"), timeout)
      const handler = (event: MessageEvent<WindowMessageType>) => {
        if (event.data.type === type) {
          clearTimeout(pid)
          window.removeEventListener("message", handler)
          return resolve("data" in event.data ? event.data.data : undefined)
        }
      }
      window.addEventListener("message", handler)
    })
  }

  public async addTransaction(
    tx: Transaction,
  ): Promise<AddTransactionResponse> {
    if (tx.type === "DEPLOY") return super.addTransaction(tx)

    if (tx.signature?.length)
      throw Error("Adding signatures to a signer tx currently isn't supported")

    sendMessage({ type: "ADD_TRANSACTION", data: tx })
    sendMessage({ type: "OPEN_UI" })

    const res: any = await Promise.race([
      this.waitForMsgOfType("SUBMITTED_TX", 11 * 60 * 1000),
      this.waitForMsgOfType("FAILED_TX", 10 * 60 * 1000)
        .then(() => "error")
        .catch(() => {
          sendMessage({ type: "FAILED_TX", data: { tx } })
          return "timeout"
        }),
    ])

    if (res === "error") throw Error("User abort")
    if (res === "timeout") throw Error("User action timed out")

    return {
      code: "TRANSACTION_RECEIVED",
      address: tx.contract_address,
      transaction_hash: res.txHash,
    }
  }
}
