import type { Provider, SignerInterface } from "starknet"

export type EventHandler = (accounts: string[]) => void

interface IStarketWindowObject {
  enable: () => Promise<string[]>
  on: (event: "accountsChanged", handleEvent: EventHandler) => void
  off: (event: "accountsChanged", handleEvent: EventHandler) => void
  signer?: SignerInterface
  provider: Provider
  selectedAddress?: string
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
