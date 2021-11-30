import {
  AddTransactionResponse,
  Provider,
  SignerInterface,
  Transaction,
  defaultProvider,
} from "starknet"

import { MessageType, WindowMessageType } from "../shared/MessageType"
import { EventHandler, StarknetWindowObject } from "./model"

const extId = document
  .getElementById("argent-x-extension")
  ?.getAttribute("data-extension-id")

const userEventHandlers: EventHandler[] = []

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
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { starknet } = window
        if (!starknet) {
          return
        }

        if (data.type === "CONNECT_RES" && data.data) {
          window.removeEventListener("message", handleMessage)
          const { address, network } = data.data
          starknet.provider = new Provider({ network: network as any })
          starknet.signer = new WalletSigner(address, starknet.provider)
          starknet.selectedAddress = address
          starknet.isConnected = true
          resolve([address])
        }
      }
      window.addEventListener("message", handleMessage)

      sendMessage({ type: "CONNECT", data: { host: window.location.host } })
    }),
  on: (event, handleEvent) => {
    if (event !== "accountsChanged") {
      throw new Error(`Unknwown event: ${event}`)
    }
    userEventHandlers.push(handleEvent)
  },
  off: (event, handleEvent) => {
    if (event !== "accountsChanged") {
      throw new Error(`Unknwown event: ${event}`)
    }
    if (userEventHandlers.includes(handleEvent)) {
      userEventHandlers.splice(userEventHandlers.indexOf(handleEvent), 1)
    }
  },
}
window.starknet = starknetWindowObject

window.addEventListener(
  "message",
  ({ data }: MessageEvent<WindowMessageType>) => {
    const { starknet } = window
    if (starknet && starknet.signer && data.type === "WALLET_CONNECTED") {
      const { address, network } = data.data
      if (address !== starknet.selectedAddress) {
        starknet.selectedAddress = address
        starknet.provider = new Provider({ network: network as any })
        starknet.signer = new WalletSigner(address, starknet.provider)
        for (const handleEvent of userEventHandlers) {
          handleEvent([address])
        }
      }
    }
  },
)

export class WalletSigner extends Provider implements SignerInterface {
  public address: string

  constructor(address: string, provider?: Provider) {
    super(provider || defaultProvider)
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
    transaction: Transaction,
  ): Promise<AddTransactionResponse> {
    if (transaction.type === "DEPLOY") return super.addTransaction(transaction)

    if (transaction.signature?.length)
      throw Error(
        "Adding signatures to a signer transaction currently isn't supported",
      )

    sendMessage({ type: "ADD_TRANSACTION", data: transaction })
    sendMessage({ type: "OPEN_UI" })

    const result: any = await Promise.race([
      this.waitForMsgOfType("SUBMITTED_TX", 11 * 60 * 1000),
      this.waitForMsgOfType("FAILED_TX", 10 * 60 * 1000)
        .then(() => "error")
        .catch(() => {
          sendMessage({ type: "FAILED_TX", data: { tx: transaction } })
          return "timeout"
        }),
    ])

    if (result === "error") throw Error("User abort")
    if (result === "timeout") throw Error("User action timed out")

    return {
      code: "TRANSACTION_RECEIVED",
      address: transaction.contract_address,
      transaction_hash: result.txHash,
    }
  }
}
