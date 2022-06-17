import { BigNumberish } from "ethers"
import { useMemo } from "react"
import useSWR from "swr"

import { Token } from "../../../shared/token"
import {
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
  ApiPriceDataResponse,
  ApiTokenDataResponse,
  convertTokenAmountToCurrencyValue,
  lookupTokenPriceDetails,
  sumTokenBalancesToCurrencyValue,
} from "../../../shared/tokenPrice.service"
import { fetcher } from "../../../shared/utils/fetcher"
import { TokenDetails, TokenDetailsWithBalance } from "./tokens.state"

/** @returns price and token data which will be cached and refreshed periodically by SWR */

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

/** @returns individual price details for the token */

export const useTokenPriceDetails = (
  token?: Token | TokenDetails | TokenDetailsWithBalance,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const { pricesData, tokenData } = usePriceAndTokenDataImpl()
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
  token?: Token | TokenDetails | TokenDetailsWithBalance,
  amount?: BigNumberish,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const priceDetails = useTokenPriceDetails(token, usePriceAndTokenDataImpl)
  return useMemo(() => {
    if (!token || !priceDetails || amount === undefined || !token.decimals) {
      return
    }
    const currencyValue = convertTokenAmountToCurrencyValue({
      amount,
      decimals: token.decimals,
      unitCurrencyValue: priceDetails.ccyValue,
    })
    return currencyValue
  }, [priceDetails, token])
}

/**
 * Converts token and token.balance into currecy value
 *
 * @returns currency value
 */

export const useTokenBalanceToCurrencyValue = (
  token: TokenDetailsWithBalance,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  return useTokenAmountToCurrencyValue(
    token,
    token.balance,
    usePriceAndTokenDataImpl,
  )
}

/**
 * Sums an array of tokens into currency value
 *
 * @returns currency value
 */

export const useSumTokenBalancesToCurrencyValue = (
  tokens: TokenDetailsWithBalance[],
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const { pricesData, tokenData } = usePriceAndTokenDataImpl()
  return useMemo(() => {
    if (!tokens || !pricesData || !tokenData) {
      return
    }
    return sumTokenBalancesToCurrencyValue({
      tokens,
      pricesData,
      tokenData,
    })
  }, [pricesData, tokenData, tokens])
}
