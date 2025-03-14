import { selectedBaseAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { swapService } from "../../../services/swap"
import { addressSchema } from "@argent/x-shared"
import type {
  SwapReviewTrade,
  Trade,
} from "../../../../shared/swap/model/trade.model"
import { isUndefined } from "lodash-es"
import { formatExecutionPrice } from "../utils/prices"
import { useMemo } from "react"
import { useSwapTradeProviders } from "./useSwapTradeProviders"
import { usePriceImpact } from "./usePriceImpact"

export function useSwapCallback(trade?: Trade, userSlippageTolerance?: number) {
  const selectedAccount = useView(selectedBaseAccountView)
  const executionPrice = useMemo(
    /** Execution price taking fees into account */
    () => formatExecutionPrice({ trade, inverted: false, includeFee: false }),
    [trade],
  )
  const providers = useSwapTradeProviders(trade?.route)
  const priceImpact = usePriceImpact(trade)

  const handleSwap = async () => {
    if (!trade || isUndefined(userSlippageTolerance) || !selectedAccount) {
      return
    }

    const accountAddress = addressSchema.parse(selectedAccount.address)

    const { calls } = await swapService.getSwapOrderFromTrade(
      accountAddress,
      trade,
      userSlippageTolerance,
    )

    const reviewTrade: SwapReviewTrade = {
      providers: providers,
      executionPrice: executionPrice,
      slippage: userSlippageTolerance,
      totalFeePercentage: trade.totalFeePercentage,
      priceImpact: priceImpact,
      baseToken: trade.payToken,
      quoteToken: trade.receiveToken,
    }

    return swapService.makeSwap(
      calls,
      `Swap ${trade.payToken.symbol} to ${trade.receiveToken.symbol}`,
      [trade.payToken.address, trade.receiveToken.address],
      reviewTrade,
    )
  }

  return handleSwap
}
