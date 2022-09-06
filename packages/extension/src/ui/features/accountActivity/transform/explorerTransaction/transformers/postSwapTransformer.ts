import { getTokenForContractAddress } from "../../getTokenForContractAddress"
import { isSwapTransaction } from "../../is"
import { IExplorerTransactionTransformer } from "./type"

/** adds token swap tokens */

export default function ({
  tokensByNetwork,
  result,
}: IExplorerTransactionTransformer) {
  if (isSwapTransaction(result)) {
    const fromToken = getTokenForContractAddress(
      result.fromTokenAddress,
      tokensByNetwork,
    )
    const toToken = getTokenForContractAddress(
      result.toTokenAddress,
      tokensByNetwork,
    )
    result.displayName = `Sold ${fromToken?.symbol || "unknown"} for ${
      toToken?.symbol || "unknown"
    }`
    if (fromToken) {
      result.fromToken = fromToken
    }
    if (toToken) {
      result.toToken = toToken
    }
    return result
  }
}
