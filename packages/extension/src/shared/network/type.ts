export interface Network {
  id: string
  name: string
  chainId: string
  baseUrl: string
  explorerUrl?: string
  accountClassHash?: string
  rpcUrl?: string
  readonly?: boolean
  multicallAddress?: string
}

export type NetworkStatus = "ok" | "degraded" | "error" | "unknown"
