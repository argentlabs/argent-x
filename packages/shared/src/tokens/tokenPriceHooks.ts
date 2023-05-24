import { BigNumberish } from "ethers"
import { useMemo } from "react"

import { ApiData } from "../http/apiData"
import { isNumeric } from "../utils/number"
import {
  convertTokenAmountToCurrencyValue,
  fetchPriceAndTokenDataFromApi,
  lookupTokenPriceDetails,
} from "./price"
import { TokenWithBalance } from "./token"

/** @returns price and token data which will be cached and refreshed periodically by SWR */
/** @returns individual price details for the token */

export const useTokenPriceDetails = (
  token?: TokenWithBalance,
  apiData?: ApiData,
) => {
  const { apiBaseUrl, apiHeaders } = apiData || {}
  const { pricesData, tokenData } = fetchPriceAndTokenDataFromApi(
    apiBaseUrl,
    apiHeaders,
  )
  return useMemo(() => {
    if (!token || !pricesData || !tokenData) {
      return
    }
    return lookupTokenPriceDetails({
      token,
      pricesData,
      tokenData,
    })
  }, [token, pricesData, tokenData])
}

/**
 * Converts the amount of token into currecy value
 *
 * @returns currency value
 */

export const useTokenAmountToCurrencyValue = (
  token?: TokenWithBalance,
  amount?: BigNumberish,
  apiData?: ApiData,
) => {
  const priceDetails = useTokenPriceDetails(token, apiData)

  return useMemo(() => {
    if (
      !token ||
      !priceDetails ||
      amount === undefined ||
      !isNumeric(amount) ||
      !token.decimals
    ) {
      return
    }

    const currencyValue = convertTokenAmountToCurrencyValue({
      amount,
      decimals: token.decimals,
      unitCurrencyValue: priceDetails.ccyValue,
    })
    return currencyValue
  }, [amount, priceDetails, token])
}
