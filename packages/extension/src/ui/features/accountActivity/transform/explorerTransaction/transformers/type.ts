import { IExplorerTransaction } from "../../../../../../shared/explorer/type"
import { Token } from "../../../../../../shared/token/type"
import { TransformedTransaction } from "../../type"

export interface IExplorerTransactionTransformer {
  result: TransformedTransaction
  explorerTransaction: IExplorerTransaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
  fingerprint?: string
}
