import { TransactionExecutionStatus, TransactionFinalityStatus } from "starknet"

export interface VoyagerTransaction {
  blockId: string
  blockNumber: number
  hash: string
  index: number
  timestamp: number
  type: string
  status: TransactionFinalityStatus | TransactionExecutionStatus
}
