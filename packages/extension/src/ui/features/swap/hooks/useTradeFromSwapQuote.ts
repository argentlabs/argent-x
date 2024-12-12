import { useTokenOnCurrentNetworkByAddress } from "../../accountTokens/tokens.state"
import { useMemo } from "react"
import { Field, useSwapState } from "../state/fields"
import type { SwapQuoteResponse } from "../../../../shared/swap/model/quote.model"
import type { Trade } from "../../../../shared/swap/model/trade.model"
import {
  TradeSchema,
  TradeType,
} from "../../../../shared/swap/model/trade.model"
import { calculateTotalFee } from "../../../../shared/swap/utils"

export function useTradeFromSwapQuote(
  swapQuote?: SwapQuoteResponse,
): Trade | undefined {
  const {
    [Field.PAY]: { tokenAddress: payTokenAddress },
    [Field.RECEIVE]: { tokenAddress: receiveTokenAddress },
    independentField,
  } = useSwapState()

  // Try to get the tokens from the swap quote, otherwise fallback to the ones from the state / default ones
  const payToken = useTokenOnCurrentNetworkByAddress(
    swapQuote?.sellToken ?? payTokenAddress,
  )
  const receiveToken = useTokenOnCurrentNetworkByAddress(
    swapQuote?.buyToken ?? receiveTokenAddress,
  )

  return useMemo(() => {
    if (!swapQuote || !payToken || !receiveToken) {
      return undefined
    }

    const tradeType =
      independentField === Field.PAY
        ? TradeType.EXACT_PAY
        : TradeType.EXACT_RECEIVE

    const { totalFee, totalFeeInCurrency, totalFeePercentage } =
      calculateTotalFee(swapQuote)

    const trade = TradeSchema.parse({
      payToken,
      receiveToken,
      tradeType,
      payAmount: swapQuote.sellAmount,
      receiveAmount: swapQuote.buyAmount,
      payAmountInCurrency: swapQuote.sellAmountInCurrency,
      receiveAmountInCurrency: swapQuote.buyAmountInCurrency,
      totalFee,
      totalFeeInCurrency,
      totalFeePercentage,
      expiresAt: swapQuote.expiresAt,
      expiresIn: swapQuote.expiresIn,
      route: swapQuote.routes[0],
      data: swapQuote.data,
    })

    return trade
  }, [swapQuote, payToken, receiveToken, independentField])
}
