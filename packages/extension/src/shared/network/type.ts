export interface Network {
  id: string
  name: string
  chainId: string
  baseUrl: string
  /** URL of the block explorer API service */
  explorerUrl?: string
  /** URL of the user-facing block explorer web interface */
  blockExplorerUrl?: string
  accountClassHash?: {
    argentAccount: string
    argentPluginAccount?: string
    argentBetterMulticallAccount?: string
    argent5MinuteEscapeTestingAccount?: string
  }
  rpcUrl?: string
  readonly?: boolean
  multicallAddress?: string
}

export type NetworkStatus = "ok" | "degraded" | "error" | "unknown"
