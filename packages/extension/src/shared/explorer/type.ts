import { Status } from "starknet"

export interface IExplorerTransactionParameters {
  /** @example tokenId @example response_len */
  name: string
  value: string
}

export interface IExplorerTransactionEvent {
  /** @example transaction_executed */
  name: string
  address: string
  parameters: IExplorerTransactionParameters[] | null // sometimes null for some reason
}

export interface IExplorerTransactionCall {
  /** @example mint */
  name: string
  address: string
  parameters: IExplorerTransactionParameters[]
}

export interface IExplorerTransaction {
  /** @example 0x1e122f27e74c51082bc19377a76002889fa6b4b00508398f23f9dedc9f56b5c */
  id: string
  /** @example 299482 */
  blockNumber: number
  /** @example 1660823428 */
  timestamp: number
  /** @example 0x1e122f27e74c51082bc19377a76002889fa6b4b00508398f23f9dedc9f56b5c */
  transactionHash: string
  /** @example 0x5f1f0a38429dcab9ffd8a786c0d827e84c1cbd8f60243e6d25d066a13af4a25 */
  contractAddress: string
  /** @example __execute__ */
  entryPoint?: string
  /** @example 0x6d90a45c752 */
  maxFee?: string
  /** @example 0x490b183da37 */
  actualFee: string
  status: Status
  statusData: string
  events: IExplorerTransactionEvent[]
  calls?: IExplorerTransactionCall[]
}
