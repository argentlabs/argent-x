import type { Provider, SignerInterface } from "starknet"

export type EventHandler = (accounts: string[]) => void

// EIP-717:
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

type RpcMessage = {
  type: "wallet_watchAsset"
  params: WatchAssetParameters
}

interface IStarketWindowObject {
  request: (call: RpcMessage) => Promise<void>
  enable: (options?: { showModal?: boolean }) => Promise<string[]>
  disconnect: () => Promise<void>
  isPreauthorized: () => Promise<boolean>
  on: (event: "accountsChanged", handleEvent: EventHandler) => void
  off: (event: "accountsChanged", handleEvent: EventHandler) => void
  signer?: SignerInterface
  provider: Provider
  selectedAddress?: string
  version: string
}

interface ConnectedStarketWindowObject extends IStarketWindowObject {
  isConnected: true
  signer: SignerInterface
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
