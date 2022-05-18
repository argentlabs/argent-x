import {
  Abi,
  Account,
  AddTransactionResponse,
  Call,
  InvocationsDetails,
  Provider,
  Signature,
  defaultProvider,
  ec,
  typedData,
} from "starknet"

import { WindowMessageType } from "../shared/MessageType"
import { getProvider } from "../shared/networks"
import { EventHandler, StarknetWindowObject } from "./inpage.model"
import { sendMessage, waitForMsgOfType } from "./messageActions"
import {
  handleAddNetworkRequest,
  handleAddTokenRequest,
} from "./requestMessageHandlers"

const VERSION = `${process.env.VERSION}`

const userEventHandlers: EventHandler[] = []

// window.ethereum like
const starknetWindowObject: StarknetWindowObject = {
  account: undefined,
  provider: defaultProvider,
  selectedAddress: undefined,
  isConnected: false,
  version: VERSION,
  request: async (call) => {
    if (call.type === "wallet_watchAsset" && call.params.type === "ERC20") {
      await handleAddTokenRequest(call.params)
    } else if (call.type === "wallet_addStarknetChain") {
      await handleAddNetworkRequest(call.params)
    }
    throw Error("Not implemented")
  },
  enable: () =>
    new Promise((resolve) => {
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { starknet } = window
        if (!starknet) {
          return
        }

        if (
          (data.type === "CONNECT_DAPP_RES" && data.data) ||
          (data.type === "START_SESSION_RES" && data.data)
        ) {
          window.removeEventListener("message", handleMessage)
          const { address, network } = data.data
          starknet.provider = getProvider(network)
          starknet.account = new ArgentXAccount(address, starknet.provider)
          starknet.selectedAddress = address
          starknet.isConnected = true
          resolve([address])
        }
      }
      window.addEventListener("message", handleMessage)

      sendMessage({
        type: "CONNECT_DAPP",
        data: { host: window.location.host },
      })
    }),
  isPreauthorized: async () => {
    sendMessage({
      type: "IS_PREAUTHORIZED",
      data: window.location.host,
    })
    return waitForMsgOfType("IS_PREAUTHORIZED_RES", 1000)
  },
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

function attach() {
  try {
    delete window.starknet
    // set read only property to window
    Object.defineProperty(window, "starknet", {
      value: starknetWindowObject,
      writable: false,
    })
  } catch {
    // ignore
  }
  // we need 2 different try catch blocks because we want to execute both even if one of them fails
  try {
    window.starknet = starknetWindowObject
  } catch {
    // ignore
  }
}

function attachHandler() {
  attach()
  setTimeout(attach, 100)
}
// inject script
attachHandler()
window.addEventListener("load", () => attachHandler())
document.addEventListener("DOMContentLoaded", () => attachHandler())
document.addEventListener("readystatechange", () => attachHandler())

window.addEventListener(
  "message",
  ({ data }: MessageEvent<WindowMessageType>) => {
    const { starknet } = window
    if (starknet && starknet.account && data.type === "CONNECT_ACCOUNT") {
      const { address, network } = data.data
      if (address !== starknet.selectedAddress) {
        starknet.selectedAddress = address
        starknet.provider = getProvider(network)
        starknet.account = new ArgentXAccount(address, starknet.provider)
        for (const handleEvent of userEventHandlers) {
          handleEvent([address])
        }
      }
    } else if (data.type === "DISCONNECT_ACCOUNT") {
      if (!starknet) {
        return
      }
      starknet.selectedAddress = undefined
      starknet.account = undefined
      starknet.isConnected = false
      for (const handleEvent of userEventHandlers) {
        handleEvent([])
      }
    }
  },
)

export class ArgentXAccount extends Account {
  constructor(address: string, provider?: Provider) {
    // since account constructor is taking a KeyPair,
    // we set a dummy one (never used anyway)
    const keyPair = ec.getKeyPair(0)
    super(provider || defaultProvider, address, keyPair)
  }

  public override async execute(
    transactions: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
  ): Promise<AddTransactionResponse> {
    sendMessage({
      type: "EXECUTE_TRANSACTION",
      data: { transactions, abis, transactionsDetail },
    })
    const { actionHash } = await waitForMsgOfType(
      "EXECUTE_TRANSACTION_RES",
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

  public override async signMessage(
    data: typedData.TypedData,
  ): Promise<Signature> {
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
}
