import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { utils } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import { useMemo } from "react"
import { Abi, Contract, number, shortString, uint256 } from "starknet"
import useSWR from "swr"

import parsedErc20Abi from "../../../abis/ERC20.json"
import { getFeeToken } from "../../../shared/token"
import { Account } from "../accounts/Account"
import { TokenDetails, TokenDetailsWithBalance } from "./tokens.state"

export interface TokenView {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string

  image?: string
  showAlways?: boolean
}

const formatTokenBalanceToCharLength =
  (length: number) =>
  (balance: BigNumberish = 0, decimals = 18): string => {
    const balanceBn = BigNumber.from(balance)
    const balanceFullString = utils.formatUnits(balanceBn, decimals)

    // show max ${length} characters or what's needed to show everything before the decimal point
    const balanceString = balanceFullString.slice(
      0,
      Math.max(length, balanceFullString.indexOf(".")),
    )

    // make sure seperator is not the last character, if so remove it
    // remove unnecessary 0s from the end, except for ".0"
    let cleanedBalanceString = balanceString
      .replace(/\.$/, "")
      .replace(/0+$/, "")
    if (cleanedBalanceString.endsWith(".")) {
      cleanedBalanceString += "0"
    }

    return cleanedBalanceString
  }

export const formatTokenBalance = formatTokenBalanceToCharLength(9)

export const toTokenView = ({
  name,
  symbol,
  decimals,
  balance,
  ...rest
}: TokenDetailsWithBalance): TokenView => {
  const decimalsNumber = decimals?.toNumber() || 18
  return {
    name: name || "Unknown token",
    symbol: symbol || "",
    decimals: decimalsNumber,
    balance: formatTokenBalance(balance, decimalsNumber),
    ...rest,
  }
}

export const fetchTokenDetails = async (
  address: string,
  account: Account,
): Promise<TokenDetails> => {
  const tokenContract = new Contract(
    parsedErc20Abi as Abi,
    address,
    account.provider,
  )
  const [decimals, name, symbol] = await Promise.all([
    tokenContract
      .call("decimals")
      .then((x) => number.toHex(x.decimals))
      .catch(() => ""),
    tokenContract
      .call("name")
      .then((x) => shortString.decodeShortString(number.toHex(x.name)))
      .catch(() => ""),
    tokenContract
      .call("symbol")
      .then((x) => shortString.decodeShortString(number.toHex(x.symbol)))
      .catch(() => ""),
  ])
  const decimalsBigNumber = BigNumber.from(decimals || 0)
  return {
    address,
    name,
    symbol,
    networkId: account.networkId,
    decimals: decimalsBigNumber.isZero() ? undefined : decimalsBigNumber,
  }
}

export const fetchTokenBalance = async (
  address: string,
  account: Account,
): Promise<BigNumber> => {
  const tokenContract = new Contract(
    parsedErc20Abi as Abi,
    address,
    account.provider,
  )
  const result = await tokenContract.balanceOf(account.address)
  return BigNumber.from(uint256.uint256ToBN(result.balance).toString())
}

export const fetchFeeTokenBalance = async (
  account: Account,
  networkId: string,
): Promise<BigNumber> => {
  const token = getFeeToken(networkId)
  if (!token) {
    return BigNumber.from(0)
  }
  return fetchTokenBalance(token.address, account)
}

export interface ApiTokenDetails {
  id: number
  address: string
  pricingId: number
}

export interface ApiTokenDataResponse {
  tokens: ApiTokenDetails[]
}

export interface ApiPriceDetails {
  pricingId: number
  ethValue: number
  ccyValue: number
  ethDayChange: number
  ccyDayChange: number
}

export interface ApiPriceDataResponse {
  prices: ApiPriceDetails[]
}

/** generic SWR json fetcher */

export const fetcher = async (url: string) => {
  const response = await fetch(url)
  return await response.json()
}

export const lookupTokenPriceDetails = ({
  token,
  pricesData,
  tokenData,
}: {
  token: TokenDetails
  pricesData: ApiPriceDataResponse
  tokenData: ApiTokenDataResponse
}) => {
  /** find token from tokenData by matching address */
  const tokenInPriceData = tokenData.tokens.find(
    ({ address }) => address.toLowerCase() === token.address.toLowerCase(),
  )
  if (tokenInPriceData) {
    /** find token price details from pricesData by matching priceId */
    const priceDetails = pricesData.prices.find(
      ({ pricingId }) => pricingId === tokenInPriceData.pricingId,
    )
    return priceDetails
  }
}

export const usePriceAndTokenData = () => {
  const { data: pricesData } = useSWR<ApiPriceDataResponse>(
    `${process.env.REACT_APP_ARGENT_API_BASE_URL}/tokens/prices?chain=starknet`,
    fetcher,
  )
  /** TODO: implement currency? */
  const { data: tokenData } = useSWR<ApiTokenDataResponse>(
    `${process.env.REACT_APP_ARGENT_API_BASE_URL}/tokens/info?chain=starknet`,
    fetcher,
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

export const countDecimals = (value: number | string) => {
  const numValue = Number(value)
  /** check for whole number with no decimals */
  if (Math.floor(numValue) === numValue) {
    return 0
  }
  /** count decimals after conversion to string e.g. '12.34' */
  return numValue.toString().split(".")[1].length || 0
}

export const convertTokenAmountToCurrencyValue = ({
  amount,
  decimals,
  unitCurrencyValue,
}: {
  amount: BigNumberish
  decimals: BigNumberish
  unitCurrencyValue: number | string
  unformatted?: boolean
}) => {
  /**
   * BigNumber is only for integers, it does not support floating-point or fixed-point math
   * @see https://github.com/ethers-io/ethers.js/issues/488#issuecomment-481944450
   */

  const decimalsNumber = Number(decimals)
  const unitCurrencyValueNumber = Number(unitCurrencyValue)

  /** determine what we need to multiply by to make price into an integer */
  const priceDecimals = countDecimals(unitCurrencyValueNumber)
  const priceToIntegerMultiplier = Math.pow(10, priceDecimals)

  /** Math.round due to loss of precision */
  const integerPrince = BigNumber.from(
    Math.round(unitCurrencyValueNumber * priceToIntegerMultiplier),
  )

  /** Multiply the integer price by balance, then divide down by the multiplier from above */
  const priceWithDecimals = integerPrince
    .mul(amount)
    .div(priceToIntegerMultiplier)

  /** Convert down using decimals */
  const convertedPrice = formatUnits(priceWithDecimals, decimalsNumber)
  return convertedPrice
}

export const prettifyCurrencyValue = (currencyValue: string | number) => {
  const prettyValue = Number(currencyValue).toFixed(2)
  /** TODO: implement currency? */
  const symbol = "$"
  return `${symbol}${prettyValue}`
}
