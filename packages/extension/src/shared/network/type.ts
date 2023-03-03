import { ArgentAccountType } from "../wallet.model"

export type AccountClassHash = { [key in ArgentAccountType]?: string } & {
  standard: string
}

export interface Network {
  id: string
  name: string
  chainId: string
  baseUrl: string
  /** URL of the block explorer API service */
  explorerUrl?: string
  /** URL of the user-facing block explorer web interface */
  blockExplorerUrl?: string
  accountClassHash?: AccountClassHash
  rpcUrl?: string
  readonly?: boolean
  multicallAddress?: string
}

export type NetworkStatus = "ok" | "degraded" | "error" | "unknown"
