import { useMemo } from "react"
import { uint256 } from "starknet"
import useSWR from "swr"

import { DEFAULT_NETWORK_ID } from "./../../sdk/constants"
import {
  Currency,
  CurrencyAmount,
  ETHER,
  JSBI,
  Token,
  TokenAmount,
  WETH,
} from "../../sdk"
import { useSwapProvider } from "../providers"
import { NoMulticallError } from "../services/multicall"
import { isAddress, uint256ToHex } from "../utils"
import { useAllTokens } from "./Tokens"
import { useAddressNormalizer } from "./useAddressNormalizer"
import { useMulticall } from "./useMulticall"

export function useMultipleTokenBalances(
  tokenAddresses: (string | undefined)[],
  accountAddress: string,
) {
  const { multicall, networkId } = useSwapProvider()

  const tokenAddressesString = tokenAddresses.filter(Boolean).join("-")

  const key = ["balanceOf", tokenAddressesString, networkId]
    .filter(Boolean)
    .join("-")

  const {
    data: balances,
    isValidating: loading,
    ...rest
  } = useSWR(key, async () => {
    if (!multicall) {
      throw new NoMulticallError("Multicall not available")
    }

    const promises = tokenAddresses.map((pairAddress) =>
      pairAddress
        ? multicall.call({
            contractAddress: pairAddress,
            entrypoint: "balanceOf",
            calldata: [accountAddress],
          })
        : undefined,
    )

    const response = await Promise.all(promises)

    return response.map((res) => {
      if (!res) {
        return undefined
      }

      return uint256ToHex({ low: res[0], high: res[1] })
    })
  })

  return { balances, loading, ...rest }
}

/**
 * Fetch ETH balance for the given address
 * @param accountAddress
 * @returns CurrencyAmount | undefined
 */

export function useETHBalance(
  accountAddress?: string,
): CurrencyAmount | undefined {
  const { networkId } = useSwapProvider()

  const ethAddress = WETH[networkId ?? DEFAULT_NETWORK_ID].address

  const address = useAddressNormalizer(accountAddress)

  // const balance = useSingleCallResult(tokenContract, "balanceOf", {
  //   account: address ?? "",
  // })

  const balance = useMulticall({
    contractAddress: ethAddress,
    entrypoint: "balanceOf",
    calldata: [address],
  })

  const uint256Balance: uint256.Uint256 = useMemo(
    () => ({ low: balance?.result?.[0], high: balance?.result?.[1] }),
    [balance?.result],
  )

  return useMemo(() => {
    const value = balance ? uint256.uint256ToBN(uint256Balance) : undefined
    if (value && address) {
      return CurrencyAmount.ether(JSBI.BigInt(value.toString()))
    }
    return undefined
  }, [address, balance, uint256Balance])
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () =>
      tokens?.filter(
        (t?: Token): t is Token => isAddress(t?.address) !== false,
      ) ?? [],
    [tokens],
  )

  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map((vt) => vt.address),
    [validatedTokens],
  )

  const { balances, loading } = useMultipleTokenBalances(
    validatedTokenAddresses,
    address ?? "",
  )

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{
              [tokenAddress: string]: TokenAmount | undefined
            }>((memo, token, i) => {
              const value = balances?.[i]
              const amount = value ? JSBI.BigInt(value.toString()) : undefined
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount)
              }
              return memo
            }, {})
          : {},
      [address, validatedTokens, balances],
    ),
    loading || !balances,
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(
  account?: string,
  token?: Token,
): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) {
    return undefined
  }
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount | undefined)[] {
  const tokens = useMemo(
    () =>
      currencies?.filter(
        (currency): currency is Token => currency instanceof Token,
      ) ?? [],
    [currencies],
  )

  const token0Balance = useETHBalance(account)
  const tokenBalances = useTokenBalances(account, tokens)
  const containsTOKEN0: boolean = useMemo(
    () => currencies?.some((currency) => currency === ETHER) ?? false,
    [currencies],
  )

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) {
          return undefined
        }
        if (currency instanceof Token) {
          return tokenBalances[currency.address]
        }
        if (containsTOKEN0) {
          return token0Balance
        }
        return undefined
      }) ?? [],
    [account, containsTOKEN0, currencies, token0Balance, tokenBalances],
  )
}

export function useCurrencyBalance(
  account?: string,
  currency?: Currency,
): CurrencyAmount | undefined {
  return useCurrencyBalances(account, [currency])[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): {
  [tokenAddress: string]: TokenAmount | undefined
} {
  const { selectedAccount } = useSwapProvider()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(
    () => Object.values(allTokens ?? {}),
    [allTokens],
  )
  const balances = useTokenBalances(selectedAccount?.address, allTokensArray)
  return balances ?? {}
}
