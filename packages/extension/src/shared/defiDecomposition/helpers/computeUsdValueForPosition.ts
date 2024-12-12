import { convertTokenAmountToCurrencyValue } from "@argent/x-shared"
import type { Token } from "../../token/__new/types/token.model"
import type { TokenPriceDetails } from "../../token/__new/types/tokenPrice.model"
import { equalToken } from "../../token/__new/utils"
import type { PositionBaseToken } from "../schema"

export const computeUsdValueForPosition = (
  positionBaseToken: PositionBaseToken,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
) => {
  const tokenInfo = tokens.find((t) => equalToken(t, positionBaseToken))
  if (!tokenInfo) {
    return
  }

  const tokenWithCurrencyValue = tokenPrices.find((token) =>
    equalToken(token, tokenInfo),
  )
  if (!tokenWithCurrencyValue) {
    return
  }

  return convertTokenAmountToCurrencyValue({
    amount: positionBaseToken.balance,
    decimals: tokenInfo.decimals,
    unitCurrencyValue: tokenWithCurrencyValue.ccyValue,
  })
}
