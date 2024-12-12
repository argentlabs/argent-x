import type { IExplorerTransaction } from "../../../../../explorer/type"
import type { Token } from "../../../../../token/__new/types/token.model"
import type { TransformedTransaction } from "../../type"

export interface IExplorerTransactionTransformer {
  result: TransformedTransaction
  explorerTransaction: IExplorerTransaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
  fingerprint?: string
}
