import { IExplorerTransactionTransformer } from "./type"
import { getTokenForContractAddress } from "../../getTokenForContractAddress"
import {
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../../is"

/** adds token transfer */

export default function ({
  tokensByNetwork,
  result,
}: IExplorerTransactionTransformer) {
  if (
    isTokenTransferTransaction(result) ||
    isTokenMintTransaction(result) ||
    isTokenApproveTransaction(result)
  ) {
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
