import { IExplorerTransaction } from "../../../../../explorer/type"
import { Token } from "../../../../../token/__new/types/token.model"
import { TransformedTransaction } from "../../type"

export interface IExplorerTransactionTransformer {
  result: TransformedTransaction
  explorerTransaction: IExplorerTransaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
  fingerprint?: string
}
