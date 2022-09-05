import { getTokenForContractAddress } from "../../getTokenForContractAddress"
import { isTokenMintTransaction, isTokenTransferTransaction } from "../../is"
import { IExplorerTransactionTransformer } from "./type"

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
