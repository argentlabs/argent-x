import { useMemo } from "react"
import useSWR from "swr"

import {
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
  ApiPriceDataResponse,
  ApiTokenDataResponse,
  convertTokenAmountToCurrencyValue,
  lookupTokenPriceDetails,
} from "../../../shared/tokenPrice.service"
import { fetcher } from "../../../shared/utils/fetcher"
import { TokenDetails, TokenDetailsWithBalance } from "./tokens.state"

/** TODO: implement currency? */

export const usePriceAndTokenData = () => {
  const { data: pricesData } = useSWR<ApiPriceDataResponse>(
    `${ARGENT_API_TOKENS_PRICES_URL}`,
    fetcher,
    {
      refreshInterval: 60 * 1000 /** 60 seconds */,
    },
  )
  const { data: tokenData } = useSWR<ApiTokenDataResponse>(
    `${ARGENT_API_TOKENS_INFO_URL}`,
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000 /** 5 minutes */,
    },
  )
  return {
    pricesData,
    tokenData,
  }
}

export const useTokenPriceDetails = (
  token: TokenDetails | TokenDetailsWithBalance,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const { pricesData, tokenData } = usePriceAndTokenDataImpl()
  return useMemo(() => {
    if (!pricesData || !tokenData) {
      return
    }
    return lookupTokenPriceDetails({
      token,
      pricesData,
      tokenData,
    })
  }, [token, pricesData, tokenData])
}

export const useTokenBalanceToCurrencyValue = (
  token: TokenDetailsWithBalance,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const priceDetails = useTokenPriceDetails(token, usePriceAndTokenDataImpl)
  return useMemo(() => {
    if (!token || !priceDetails || !token.balance || !token.decimals) {
      return
    }
    const currencyValue = convertTokenAmountToCurrencyValue({
      amount: token.balance,
      decimals: token.decimals,
      unitCurrencyValue: priceDetails.ccyValue,
    })
    return currencyValue
  }, [priceDetails, token])
}

export const useSumTokenBalancesToCurrencyValue = (
  tokens: TokenDetailsWithBalance[],
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const { pricesData, tokenData } = usePriceAndTokenDataImpl()
  return useMemo(() => {
    if (!tokens || !pricesData || !tokenData) {
      return
    }
    let sumTokenBalance = 0
    tokens.forEach((token) => {
      const priceDetails = lookupTokenPriceDetails({
        token,
        pricesData,
        tokenData,
      })
      if (!priceDetails || !token.balance || !token.decimals) {
        // missing data - don't add it
      } else {
        const currencyValue = convertTokenAmountToCurrencyValue({
          amount: token.balance,
          decimals: token.decimals,
          unitCurrencyValue: priceDetails.ccyValue,
        })
        if (currencyValue) {
          sumTokenBalance += Number(currencyValue)
        }
      }
    })
    /** convert to string for consistency with `convertTokenAmountToCurrencyValue()` */
    return String(sumTokenBalance)
  }, [pricesData, tokenData, tokens])
}
