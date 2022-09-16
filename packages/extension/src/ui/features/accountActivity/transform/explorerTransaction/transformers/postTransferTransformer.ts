import { IExplorerTransactionTransformer } from "../../explorerTransaction/transformers/type"
import { getTokenForContractAddress } from "../../getTokenForContractAddress"
import { isTokenMintTransaction, isTokenTransferTransaction } from "../../is"

/** adds token transfer */

export default function ({
  tokensByNetwork,
  result,
}: IExplorerTransactionTransformer) {
  if (isTokenTransferTransaction(result) || isTokenMintTransaction(result)) {
    const token = getTokenForContractAddress(
      result.tokenAddress,
      tokensByNetwork,
    )
    if (token) {
      result.token = token
    }
    return result
  }
}
