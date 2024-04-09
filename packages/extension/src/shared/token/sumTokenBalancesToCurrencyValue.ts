import { bigDecimal, convertTokenAmountToCurrencyValue } from "@argent/x-shared"
import type { TokenPriceDetails } from "./__new/types/tokenPrice.model"
import type { Token } from "./__new/types/token.model"
import type { TokenWithOptionalBigIntBalance } from "./__new/types/tokenBalance.model"
import { isUndefined } from "lodash-es"
import { lookupTokenPriceDetails } from "./lookupTokenPriceDetails"

export interface ISumTokenBalancesToCurrencyValue {
  /** the tokens to sum */
  tokens: TokenWithOptionalBigIntBalance[]
  /** reponse from `/tokens/prices` endpoint */
  pricesData: TokenPriceDetails[]
  /** reponse from `/tokens/info` endpoint */
  tokenData: Token[]
}

export const sumTokenBalancesToCurrencyValue = ({
  tokens,
  pricesData,
  tokenData,
}: ISumTokenBalancesToCurrencyValue) => {
  let sumTokenBalance = BigInt(0)
  let didGetValidConversion = false
  tokens.forEach((token) => {
    const priceDetails = lookupTokenPriceDetails({
      token,
      pricesData,
      tokenData,
    })
    if (
      priceDetails &&
      // 0n is considered false otherwise
      !isUndefined(token.balance) &&
      !isUndefined(token.decimals)
    ) {
      const currencyValue = convertTokenAmountToCurrencyValue({
        amount: token.balance,
        decimals: token.decimals,
        unitCurrencyValue: priceDetails.ccyValue,
      })
      /** zero is a valid value here */
      if (currencyValue !== undefined) {
        didGetValidConversion = true
        sumTokenBalance =
          sumTokenBalance + bigDecimal.parseCurrency(currencyValue).value
      }
    }
  })
  /** undefined if there were no valid conversions */
  if (!didGetValidConversion) {
    return
  }
  /** keep as string to avoid loss of precision elsewhere */
  return bigDecimal.formatCurrency(sumTokenBalance)
}
