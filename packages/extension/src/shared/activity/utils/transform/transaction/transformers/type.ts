import type { Token } from "../../../../../token/__new/types/token.model"
import type { Transaction } from "../../../../../transactions"
import type { ActivityTransaction, TransformedTransaction } from "../../type"

export interface ITransactionTransformer {
  result: TransformedTransaction
  transaction: ActivityTransaction | Transaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
}
