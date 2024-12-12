import type { ExecutionStatus, ExtendedFinalityStatus } from "../transactions"
import { z } from "zod"

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

export const explorerTransactionActualFeeSchema = z.object({
  /** @example 0x490b183da37 */
  amount: z.string(),
  /** @example WEI */
  unit: z.string(),
})

export type ExplorerTransactionActualFee = z.infer<
  typeof explorerTransactionActualFeeSchema
>

export interface IExplorerTransaction {
  /** @example 0x1e122f27e74c51082bc19377a76002889fa6b4b00508398f23f9dedc9f56b5c */
  id: string
  /** @example 299482 */
  blockNumber: number
  /** @example 1660823428 */
  timestamp: number
  /** @example 0x1e122f27e74c51082bc19377a76002889fa6b4b00508398f23f9dedc9f56b5c */
  transactionHash: string
  /** @example 0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a */
  contractAddress?: string
  /** @example __execute__ */
  entryPoint?: string
  /** @example 0x6d90a45c752 */
  maxFee?: string
  /** @example 0x490b183da37 */
  actualFee: string | ExplorerTransactionActualFee
  /** TODO: remove legacy status field */
  status?: ExtendedFinalityStatus
  finalityStatus: ExtendedFinalityStatus
  executionStatus?: ExecutionStatus
  failureReason?: "REJECTED" | "REVERTED" | "CANCELLED"
  statusData: string
  events: IExplorerTransactionEvent[]
  calls?: IExplorerTransactionCall[]
}
