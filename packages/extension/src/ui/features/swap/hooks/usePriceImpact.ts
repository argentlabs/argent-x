import { useMemo } from "react"
import type {
  PriceImpactResult,
  Trade,
} from "../../../../shared/swap/model/trade.model"
import { useTokenAmountToCurrencyFormatted } from "../../accountTokens/tokenPriceHooks"

export type PriceImpactType = "low" | "high" | "extreme"

export const usePriceImpact = (
  trade?: Trade,
): PriceImpactResult | undefined => {
  const payCurrencyValue = useTokenAmountToCurrencyFormatted(
    trade?.payAmount,
    trade?.payToken,
  )

  const receiveCurrencyValue = useTokenAmountToCurrencyFormatted(
    trade?.receiveAmount,
    trade?.receiveToken,
  )

  return useMemo(() => {
    if (!trade || !payCurrencyValue || !receiveCurrencyValue) {
      return
    }

    const inputValue = Number(payCurrencyValue)
    const outputValue = Number(receiveCurrencyValue)
    const priceImpact = ((inputValue - outputValue) / inputValue) * 100

    if (priceImpact <= 5) {
      return {
        value: priceImpact,
        type: "low",
      }
    }

    if (priceImpact > 5 && priceImpact < 20) {
      return {
        value: priceImpact,
        type: "high",
      }
    }

    return {
      value: priceImpact,
      type: "extreme",
    }
  }, [payCurrencyValue, receiveCurrencyValue, trade])
}
