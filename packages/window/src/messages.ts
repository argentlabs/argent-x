import type {
  AddStarknetChainParameters,
  SwitchStarknetChainParameter,
  WatchAssetParameters,
} from "get-starknet-core"
import type {
  Abi,
  Call,
  DeclareSignerDetails,
  InvocationsSignerDetails,
  typedData,
} from "starknet"

export type MessageTypes =
  // enable and isPreauthorized
  // connect dapp to wallet
  | {
      type: "CONNECT_REQUEST"
      data: {
        host: string
      }
    }
  | {
      type: "CONNECT_REQUEST_RECEIPT"
      data: {
        receiptId: string
      }
    }
  | {
      type: "CONNECT_RESPONSE"
      meta: { forReceiptId: string }
      data: {
        selectedAddress: string
      }
    }
  | {
      type: "CONNECT_FAILURE"
      meta: { forReceiptId: string }
      data: {
        error: string
      }
    }
  // check preauthorization
  | {
      type: "IS_PREAUTHORIZED_REQUEST"
      data: {
        host: string
      }
    }
  | {
      type: "IS_PREAUTHORIZED_RESPONSE"
      data: {
        isPreauthorized: boolean
      }
    }
  // SIGNER MESSAGES
  // get public key
  | {
      type: "GET_PUBKEY_REQUEST"
    }
  | {
      type: "GET_PUBKEY_RESPONSE"
      data: {
        pubkey: string
      }
    }
  // sign message
  | {
      type: "SIGN_MESSAGE_REQUEST"
      data: {
        typedData: typedData.TypedData
        accountAddress: string
      }
    }
  | {
      type: "SIGN_MESSAGE_REQUEST_RECEIPT"
      data: {
        receiptId: string
      }
    }
  | {
      type: "SIGN_MESSAGE_RESPONSE"
      meta: { forReceiptId: string }
      data: {
        signature: string[]
      }
    }
  | {
      type: "SIGN_MESSAGE_FAILURE"
      meta: { forReceiptId: string }
      data: {
        error: string
      }
    }
  // sign transaction
  | {
      type: "SIGN_TRANSACTION_REQUEST"
      data: {
        transactions: Call[]
        transactionsDetail: InvocationsSignerDetails
        abis?: Abi[] | undefined
      }
    }
  | {
      type: "SIGN_TRANSACTION_REQUEST_RECEIPT"
      data: {
        receiptId: string
      }
    }
  | {
      type: "SIGN_TRANSACTION_RESPONSE"
      meta: { forReceiptId: string }
      data: {
        signature: string[]
      }
    }
  | {
      type: "SIGN_TRANSACTION_FAILURE"
      meta: { forReceiptId: string }
      data: {
        error: string
      }
    }
  // sign declare transaction
  | {
      type: "SIGN_DECLARE_TRANSACTION_REQUEST"
      data: {
        declareContract: DeclareSignerDetails
      }
    }
  | {
      type: "SIGN_DECLARE_TRANSACTION_REQUEST_RECEIPT"
      data: {
        receiptId: string
      }
    }
  | {
      type: "SIGN_DECLARE_TRANSACTION_RESPONSE"
      meta: { forReceiptId: string }
      data: {
        signature: string[]
      }
    }
  | {
      type: "SIGN_DECLARE_TRANSACTION_FAILURE"
      meta: { forReceiptId: string }
      data: {
        error: string
      }
    }
  // RPC MESSAGES
  // wallet_addStarknetChain
  | {
      type: "ADD_STARKNET_CHAIN_REQUEST"
      data: AddStarknetChainParameters
    }
  | {
      type: "ADD_STARKNET_CHAIN_REQUEST_RECEIPT"
      data: {
        receiptId: string
      }
    }
  | {
      type: "ADD_STARKNET_CHAIN_RESPONSE"
      meta: { forReceiptId: string }
      data: {
        success: boolean
      }
    }
  | {
      type: "ADD_STARKNET_CHAIN_FAILURE"
      meta: { forReceiptId: string }
      data: {
        error: string
      }
    }
  // wallet_switchStarknetChain
  | {
      type: "SWITCH_STARKNET_CHAIN_REQUEST"
      data: SwitchStarknetChainParameter
    }
  | {
      type: "SWITCH_STARKNET_CHAIN_REQUEST_RECEIPT"
      data: {
        receiptId: string
      }
    }
  | {
      type: "SWITCH_STARKNET_CHAIN_RESPONSE"
      meta: { forReceiptId: string }
      data: {
        success: boolean
      }
    }
  | {
      type: "SWITCH_STARKNET_CHAIN_FAILURE"
      meta: { forReceiptId: string }
      data: {
        error: string
      }
    }
  // wallet_watchAsset
  | {
      type: "WATCH_ASSET_REQUEST"
      data: WatchAssetParameters
    }
  | {
      type: "WATCH_ASSET_REQUEST_RECEIPT"
      data: {
        receiptId: string
      }
    }
  | {
      type: "WATCH_ASSET_RESPONSE"
      meta: { forReceiptId: string }
      data: {
        success: boolean
      }
    }
  | {
      type: "WATCH_ASSET_FAILURE"
      meta: { forReceiptId: string }
      data: {
        error: string
      }
    }

type AllowPromise<T> = T | Promise<T>

export interface WalletMessenger {
  postMessage: (message: MessageTypes) => void
  listenMessage: <
    K extends MessageTypes["type"],
    T extends { type: K } & MessageTypes,
  >(
    messageType: K,
    predicate?: (message: T) => boolean,
  ) => Promise<T extends { data: infer S } ? S : unknown>
  subscribe: (callback: (message: MessageTypes) => AllowPromise<void>) => void
}

export class WindowMessenger implements WalletMessenger {
  private readonly _listeners: Set<(message: MessageTypes) => void> = new Set(
    [],
  )

  constructor(private readonly _window: Window) {
    this._window.addEventListener("message", (event) => {
      if (event.data.type) {
        this._listeners.forEach((listener) => listener(event.data))
      }
    })
  }

  postMessage(message: MessageTypes): void {
    this._window.postMessage(message, "*")
  }

  listenMessage<T extends MessageTypes>(
    type: T["type"],
    filter?: (message: T) => boolean,
  ): Promise<T extends { data: infer S } ? S : unknown> {
    return new Promise((resolve) => {
      const listener = (message: T) => {
        if (message.type === type && (!filter || filter(message))) {
          this._listeners.delete(listener as any)
          resolve(
            ("data" in message ? message.data : undefined) as T extends {
              data: infer S
            }
              ? S
              : unknown,
          )
        }
      }
      this._listeners.add(listener as any)
    })
  }

  subscribe(callback: (message: MessageTypes) => void | Promise<void>): void {
    this._listeners.add(callback)
  }
}
