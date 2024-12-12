import type {
  BaseTransaction,
  TransactionWithStatus,
} from "../../transactions/interface"

export interface BaseContract {
  address: string
  networkId: string
}

export interface IChainService {
  getDeployed(contract: BaseContract): Promise<boolean>
  getTransactionStatus(
    transaction: BaseTransaction,
  ): Promise<TransactionWithStatus>
}
