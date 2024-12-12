import { useCallback } from "react"
import type { BaseToken } from "../../shared/token/__new/types/token.model"
import { useView } from "../views/implementation/react"
import { allTokenPricesView, allTokensView } from "../views/token"
import { equalToken } from "../../shared/token/__new/utils"
import { convertTokenAmountToCurrencyValue } from "@argent/x-shared"

export function useTokenAmountToCcyCallback() {
  const tokens = useView(allTokensView)
  const tokenPrices = useView(allTokenPricesView)
  return useCallback(
    (baseToken: BaseToken, amount: string) => {
      const tokenPrice = tokenPrices.find((cv) => equalToken(cv, baseToken))
      const token = tokens.find((t) => equalToken(t, baseToken))

      if (!token || !tokenPrice) {
        return "0"
      }

      const usdValue = convertTokenAmountToCurrencyValue({
        amount,
        decimals: token.decimals,
        unitCurrencyValue: tokenPrice.ccyValue,
      })

      return usdValue || "0"
    },
    [tokens, tokenPrices],
  )
}
