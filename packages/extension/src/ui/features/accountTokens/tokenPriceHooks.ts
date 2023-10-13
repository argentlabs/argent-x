import { isAddress } from "@argent/shared"
import { Token as SwapToken } from "@argent/x-swap"
import { useMemo } from "react"

import {
  ARGENT_API_ENABLED,
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
} from "../../../shared/api/constants"
import {
  ApiPriceDataResponse,
  ApiTokenDataResponse,
  convertTokenAmountToCurrencyValue,
  convertTokenUnitAmountWithDecimals,
  lookupTokenPriceDetails,
  sumTokenBalancesToCurrencyValue,
} from "../../../shared/token/price"
import { isNumeric } from "../../../shared/utils/number"
import { argentApiFetcher } from "../../services/argentApiFetcher"
import {
  useConditionallyEnabledSWR,
  withPolling,
} from "../../services/swr.service"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { BigNumberish } from "starknet"
import { RefreshInterval } from "../../../shared/config"
import { useView } from "../../views/implementation/react"
import { tokenPricesView } from "../../views/tokenPrices"
import { allTokensView } from "../../views/token"
import { TokenWithOptionalBigIntBalance } from "../../../shared/token/__new/types/tokenBalance.model"
import {
  BaseTokenSchema,
  Token,
} from "../../../shared/token/__new/types/token.model"

/** @returns true if API is enabled, app is on mainnet and the user has enabled Argent services */

export const useCurrencyDisplayEnabled = () => {
  const isDefaultNetwork = useIsDefaultNetwork()

  return ARGENT_API_ENABLED && isDefaultNetwork
}

/** @returns price and token data which will be cached and refreshed periodically by SWR */

export const usePriceAndTokenDataFromApi = () => {
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const { data: pricesData } = useConditionallyEnabledSWR<ApiPriceDataResponse>(
    !!currencyDisplayEnabled,
    `${ARGENT_API_TOKENS_PRICES_URL}`,
    argentApiFetcher,
    withPolling(RefreshInterval.MEDIUM * 1000) /** 60 seconds */,
  )
  const { data: tokenData } = useConditionallyEnabledSWR<ApiTokenDataResponse>(
    !!currencyDisplayEnabled,
    `${ARGENT_API_TOKENS_INFO_URL}`,
    argentApiFetcher,
    withPolling(RefreshInterval.SLOW * 1000) /** 5 minutes */,
  )
  return {
    pricesData,
    tokenData,
  }
}

export const usePriceAndTokenDataFromRepo = () => {
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const pricesData = useView(tokenPricesView)
  const tokenData = useView(allTokensView)

  if (!currencyDisplayEnabled) {
    return {
      pricesData: undefined,
      tokenData: undefined,
    }
  }

  return {
    pricesData,
    tokenData,
  }
}

export const usePriceAndTokenDataDisabled = () => {
  return {
    pricesData: undefined,
    tokenData: undefined,
  }
}

export const usePriceAndTokenData = ARGENT_API_ENABLED
  ? usePriceAndTokenDataFromRepo
  : usePriceAndTokenDataDisabled

/** @returns individual price details for the token */

export const useTokenPriceDetails = (
  token?: Token | TokenWithOptionalBigIntBalance | SwapToken,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const { pricesData, tokenData } = usePriceAndTokenDataImpl()
  return useMemo(() => {
    if (!token || !pricesData || !tokenData || !isAddress(token.address)) {
      return
    }
    const parsedToken = BaseTokenSchema.parse(token)
    return lookupTokenPriceDetails({
      token: parsedToken,
      pricesData,
      tokenData,
    })
  }, [token, pricesData, tokenData])
}

/**
 * Convert a unit amount of token into native amount, useful for user input
 *
 * @see {@link convertTokenUnitAmountWithDecimals}
 *
 * @returns currency value
 */

export const useTokenUnitAmountToCurrencyValue = (
  token?: Token | TokenWithOptionalBigIntBalance | SwapToken,
  unitAmount?: BigNumberish,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const convertedAmount = convertTokenUnitAmountWithDecimals({
    unitAmount,
    decimals: token?.decimals,
  })
  return useTokenAmountToCurrencyValue(
    token,
    convertedAmount,
    usePriceAndTokenDataImpl,
  )
}

/**
 * Converts the amount of token into currecy value
 *
 * @returns currency value
 */

export const useTokenAmountToCurrencyValue = (
  token?: Token | TokenWithOptionalBigIntBalance | SwapToken,
  amount?: BigNumberish,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const priceDetails = useTokenPriceDetails(token, usePriceAndTokenDataImpl)
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

/**
 * Converts token and token.balance into currecy value
 *
 * @returns currency value
 */

export const useTokenBalanceToCurrencyValue = (
  token?: TokenWithOptionalBigIntBalance,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  return useTokenAmountToCurrencyValue(
    token,
    token?.balance,
    usePriceAndTokenDataImpl,
  )
}

/**
 * Sums an array of tokens into currency value
 *
 * @returns currency value
 */

export const useSumTokenBalancesToCurrencyValue = (
  tokens: TokenWithOptionalBigIntBalance[],
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
