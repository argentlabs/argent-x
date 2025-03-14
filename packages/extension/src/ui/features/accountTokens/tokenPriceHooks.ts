import {
  bigDecimal,
  convertCurrencyValueToTokenAmount,
  convertTokenAmountToCurrencyValue,
  convertTokenUnitAmountWithDecimals,
  isAddress,
  isNumeric,
  prettifyCurrencyNumber,
  prettifyTokenNumber,
} from "@argent/x-shared"
import { useMemo } from "react"

import type { BigNumberish } from "starknet"
import {
  ARGENT_API_ENABLED,
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
} from "../../../shared/api/constants"
import { useArgentApiFetcher } from "../../../shared/api/fetcher"
import { RefreshIntervalInSeconds } from "../../../shared/config"
import type { Token } from "../../../shared/token/__new/types/token.model"
import { BaseTokenSchema } from "../../../shared/token/__new/types/token.model"
import type {
  TokenWithBalance,
  TokenWithOptionalBigIntBalance,
} from "../../../shared/token/__new/types/tokenBalance.model"
import { lookupTokenPriceDetails } from "../../../shared/token/lookupTokenPriceDetails"
import { sumTokenBalancesToCurrencyValue } from "../../../shared/token/sumTokenBalancesToCurrencyValue"
import type {
  ApiPriceDataResponse,
  ApiTokenDataResponse,
} from "../../../shared/token/types"
import {
  useConditionallyEnabledSWR,
  withPolling,
} from "../../services/swr.service"
import { useView } from "../../views/implementation/react"
import { allTokenPricesView, allTokensView } from "../../views/token"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"

/** @returns true if API is enabled, app is on mainnet and the user has enabled Argent services */

export const useCurrencyDisplayEnabled = (networkId?: string) => {
  const isDefaultNetwork = useIsDefaultNetwork(networkId)

  return ARGENT_API_ENABLED && isDefaultNetwork
}

/** @returns price and token data which will be cached and refreshed periodically by SWR */

export const usePriceAndTokenDataFromApi = (networkId?: string) => {
  const argentApiFetcher = useArgentApiFetcher()
  const currencyDisplayEnabled = useCurrencyDisplayEnabled(networkId)
  const { data: pricesData } = useConditionallyEnabledSWR<ApiPriceDataResponse>(
    !!currencyDisplayEnabled,
    `${ARGENT_API_TOKENS_PRICES_URL}`,
    argentApiFetcher,
    withPolling(RefreshIntervalInSeconds.MEDIUM * 1000) /** 60 seconds */,
  )
  const { data: tokenData } = useConditionallyEnabledSWR<ApiTokenDataResponse>(
    !!currencyDisplayEnabled,
    `${ARGENT_API_TOKENS_INFO_URL}`,
    argentApiFetcher,
    withPolling(RefreshIntervalInSeconds.SLOW * 1000) /** 5 minutes */,
  )
  return {
    pricesData,
    tokenData,
  }
}

export const usePriceAndTokenDataFromRepo = (networkId?: string) => {
  const currencyDisplayEnabled = useCurrencyDisplayEnabled(networkId)
  const pricesData = useView(allTokenPricesView)
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
  token?: Token | TokenWithOptionalBigIntBalance,
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
  token?: Token | TokenWithOptionalBigIntBalance,
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
  token?: Token | TokenWithOptionalBigIntBalance,
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
  token?: TokenWithBalance | TokenWithOptionalBigIntBalance,
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
  networkId?: string,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const { pricesData, tokenData } = usePriceAndTokenDataImpl(networkId)
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

/**
 * Converts currency value to token amount
 * @returns formatted token amount as string
 */
export const useCurrencyValueToTokenAmount = (
  currencyValue?: BigNumberish,
  token?: Token | TokenWithOptionalBigIntBalance,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const priceDetails = useTokenPriceDetails(token, usePriceAndTokenDataImpl)

  return useMemo(() => {
    if (
      !token?.decimals ||
      !priceDetails?.ccyValue ||
      currencyValue === undefined ||
      !isNumeric(currencyValue)
    ) {
      return
    }

    const tokenAmount = convertCurrencyValueToTokenAmount({
      currencyValue: currencyValue.toString(),
      decimals: token.decimals,
      unitCurrencyValue: priceDetails.ccyValue,
    })
    const stringAmount = bigDecimal.formatUnits({
      value: tokenAmount || 0n,
      decimals: token.decimals,
    })
    return prettifyTokenAmountValueForSwap(stringAmount)
  }, [currencyValue, priceDetails, token])
}

export const prettifyTokenAmountValueForSwap = (stringAmount?: string) => {
  const prettyAmount = prettifyTokenNumber(stringAmount ?? 0n, {
    maxNrDigits: 10, // max we can fit in the conversion value label
    minDecimalPlaces: 6, // otherwise the default value is 4 and will override the maxNrDigits
    roundingMode: 3, // BigNumber.ROUND_FLOOR so that we avoid the insufficient balance error
    groupSeparator: "", // we don't want the, separator, because when we switch the value the input expects a number
  })

  if (!prettyAmount) {
    return
  }

  // otherwise the above formatting will do 6 decimals
  if (Number(prettyAmount) === 0) return "0"

  return prettyAmount
}
/**
 * Converts token amount to currency value
 * @returns formatted currency value as string
 */
export const useTokenAmountToCurrencyFormatted = (
  amount?: BigNumberish,
  token?: Token | TokenWithOptionalBigIntBalance,
  usePriceAndTokenDataImpl = usePriceAndTokenData,
) => {
  const currencyValue = useTokenAmountToCurrencyValue(
    token,
    amount,
    usePriceAndTokenDataImpl,
  )

  return useMemo(() => {
    return prettifyCurrenvyValueForSwap(currencyValue)
  }, [currencyValue])
}

export const prettifyCurrenvyValueForSwap = (currencyValue?: string) => {
  if (!currencyValue) {
    return
  }
  // otherwise the formatting will do 6 decimals
  if (Number(currencyValue) === 0) return "0.00"

  const prettyCurrencyValue = prettifyCurrencyNumber(currencyValue ?? 0n, {
    groupSeparator: "", // we don't want the, separator, because when we switch the value the input expects a number
    roundingMode: 3, // BigNumber.ROUND_FLOOR so that we avoid the insufficient balance error
    decimalPlacesWhenZero: 6,
  })

  if (!prettyCurrencyValue) {
    return
  }

  return prettyCurrencyValue
}
