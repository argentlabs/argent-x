import { Token } from "../../../../../token/__new/types/token.model"
import { Transaction } from "../../../../../transactions"
import { ActivityTransaction, TransformedTransaction } from "../../type"

export interface ITransactionTransformer {
  result: TransformedTransaction
  transaction: ActivityTransaction | Transaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
}
