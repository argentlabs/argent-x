import { getTokenForContractAddress } from "../../getTokenForContractAddress"
import { isTokenMintTransaction, isTokenTransferTransaction } from "../../is"
import type { ITransactionTransformer } from "./type"

/** adds token transfer */

export default function ({ tokensByNetwork, result }: ITransactionTransformer) {
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
