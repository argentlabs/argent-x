import type { AccountInterface, Provider } from "starknet"

export type EventHandler = (accounts: string[]) => void

// EIP-747:
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-747.md
interface WatchAssetParameters {
  type: "ERC20" // The asset's interface, e.g. 'ERC20'
  options: {
    address: string // The hexadecimal StarkNet address of the token contract
    symbol?: string // A ticker symbol or shorthand, up to 5 alphanumerical characters
    decimals?: number // The number of asset decimals
    image?: string // A string url of the token logo
    name?: string // The name of the token - not in spec
  }
}

export type RpcMessage =
  | {
      type: "wallet_watchAsset"
      params: WatchAssetParameters
      result: boolean
    }
  | {
      type: string
      params: any
      result: never
    }

interface IStarketWindowObject {
  request: <T extends RpcMessage>(
    call: Omit<T, "result">,
  ) => Promise<T["result"]>
  enable: (options?: { showModal?: boolean }) => Promise<string[]>
  isPreauthorized: () => Promise<boolean>
  on: (event: "accountsChanged", handleEvent: EventHandler) => void
  off: (event: "accountsChanged", handleEvent: EventHandler) => void
  account?: AccountInterface
  provider: Provider
  selectedAddress?: string
  version: string
}

interface ConnectedStarketWindowObject extends IStarketWindowObject {
  isConnected: true
  account: AccountInterface
  selectedAddress: string
}

interface DisconnectedStarketWindowObject extends IStarketWindowObject {
  isConnected: false
}

export type StarknetWindowObject =
  | ConnectedStarketWindowObject
  | DisconnectedStarketWindowObject

declare global {
  interface Window {
    starknet?: StarknetWindowObject
  }
}
