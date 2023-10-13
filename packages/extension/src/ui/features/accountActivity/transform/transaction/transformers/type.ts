import { Token } from "../../../../../../shared/token/__new/types/token.model"
import { Transaction } from "../../../../../../shared/transactions"
import { ActivityTransaction } from "../../../useActivity"
import { TransformedTransaction } from "../../type"

export interface ITransactionTransformer {
  result: TransformedTransaction
  transaction: ActivityTransaction | Transaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
}
