import { BigNumberish } from "ethers"
import { useMemo } from "react"

import {
  ARGENT_API_ENABLED,
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
} from "../../../shared/api/constants"
import {
  isPrivacySettingsEnabled,
  settingsStore,
} from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import {
  ApiPriceDataResponse,
  ApiTokenDataResponse,
  convertTokenAmountToCurrencyValue,
  convertTokenUnitAmountWithDecimals,
  lookupTokenPriceDetails,
  sumTokenBalancesToCurrencyValue,
} from "../../../shared/token/price"
import { Token } from "../../../shared/token/type"
import { TokenDetailsWithBalance } from "../../../shared/tokens.state"
import { isNumeric } from "../../../shared/utils/number"
import { argentApiFetcher } from "../../services/argentApiFetcher"
import { useConditionallyEnabledSWR, withPolling } from "../../services/swr"
import { useIsMainnet } from "../networks/useNetworks"

/** @returns true if API is enabled, app is on mainnet and the user has enabled Argent services */

export const useCurrencyDisplayEnabled = () => {
  const isMainnet = useIsMainnet()
  const privacyUseArgentServicesEnabled = useKeyValueStorage(
    settingsStore,
    "privacyUseArgentServices",
  )
  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_API_ENABLED && isMainnet
  }
  return ARGENT_API_ENABLED && isMainnet && privacyUseArgentServicesEnabled
}

/** @returns price and token data which will be cached and refreshed periodically by SWR */

export const usePriceAndTokenDataFromApi = () => {
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const { data: pricesData } = useConditionallyEnabledSWR<ApiPriceDataResponse>(
    !!currencyDisplayEnabled,
    `${ARGENT_API_TOKENS_PRICES_URL}`,
    argentApiFetcher,
    withPolling(60 * 1000) /** 60 seconds */,
  )
  const { data: tokenData } = useConditionallyEnabledSWR<ApiTokenDataResponse>(
    !!currencyDisplayEnabled,
    `${ARGENT_API_TOKENS_INFO_URL}`,
    argentApiFetcher,
    withPolling(5 * 60 * 1000) /** 5 minutes */,
  )
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
  ? usePriceAndTokenDataFromApi
  : usePriceAndTokenDataDisabled

/** @returns individual price details for the token */

export const useTokenPriceDetails = (
  token?: Token | TokenDetailsWithBalance,
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
 * Convert a unit amount of token into native amount, useful for user input
 *
 * @see {@link convertTokenUnitAmountWithDecimals}
 *
 * @returns currency value
 */

export const useTokenUnitAmountToCurrencyValue = (
  token?: Token | TokenDetailsWithBalance,
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
  token?: Token | TokenDetailsWithBalance | undefined,
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
  token?: TokenDetailsWithBalance,
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
