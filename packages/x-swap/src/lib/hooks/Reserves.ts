import { useMemo } from "react"
import { validateAndParseAddress } from "starknet"
import useSWR from "swr"

import { Currency, Pair, Token, TokenAmount } from "../../sdk"
import { useSwapProvider } from "../providers"
import { NoMulticallError } from "../services/multicall"
import { uint256ToHex } from "../utils"
import { wrappedCurrency } from "../utils/wrappedCurrency"
import { useAllPairs } from "./Pairs"

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export interface LiquidityPairToken {
  liquidityToken: Token | undefined
  tokens: [Token, Token]
}

export interface Reserves {
  reserve0: string
  reserve1: string
}

export function useReserves(pairAddresses: (string | undefined)[]) {
  console.log(
    "🚀 ~ file: Reserves.ts ~ line 30 ~ useReserves ~ pairAddresses",
    pairAddresses,
  )
  const { multicall, networkId } = useSwapProvider()

  const pairAddressesString = pairAddresses.filter(Boolean).join("-")

  const key = ["get_reserves", pairAddressesString, networkId]
    .filter(Boolean)
    .join("-")

  const {
    data: reserves,
    isValidating: loading,
    ...rest
  } = useSWR(key, async () => {
    if (!multicall) {
      throw new NoMulticallError("Multicall not available")
    }

    const promises = pairAddresses.map((pairAddress) =>
      pairAddress
        ? multicall.call({
            contractAddress: pairAddress,
            entrypoint: "get_reserves",
          })
        : undefined,
    )

    const response = await Promise.all(promises)

    return response.map((res) => {
      if (!res) {
        return undefined
      }

      return {
        reserve0: uint256ToHex({ low: res[0], high: res[1] }),
        reserve1: uint256ToHex({ low: res[2], high: res[3] }),
      } as Reserves
    })
  })

  return { reserves, loading, ...rest }
}

export function usePairs(
  currencies: [Currency | undefined, Currency | undefined][],
): [PairState, Pair | null][] {
  const { networkId } = useSwapProvider()
  const allPairs = useAllPairs()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, networkId),
        wrappedCurrency(currencyB, networkId),
      ]),
    [currencies, networkId],
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
          ? validateAndParseAddress(Pair.getAddress(tokenA, tokenB))
          : undefined
      }),
    [tokens],
  )

  const validatedPairAddress = useMemo(
    () =>
      pairAddresses.map((addr) =>
        addr && allPairs.includes(addr) ? addr : undefined,
      ),
    [allPairs, pairAddresses],
  )

  const { reserves, loading } = useReserves(validatedPairAddress)

  return useMemo(() => {
    return validatedPairAddress.map((pairAddress, i) => {
      if (loading || !reserves) {
        return [PairState.LOADING, null]
      }

      const tokenA = tokens?.[i]?.[0]
      const tokenB = tokens?.[i]?.[1]
      const currentReserves = reserves[i]

      if (!tokenA || !tokenB || tokenA.equals(tokenB)) {
        return [PairState.INVALID, null]
      }

      if (!pairAddress || !currentReserves) {
        return [PairState.NOT_EXISTS, null]
      }

      const { reserve0, reserve1 } = currentReserves

      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA]

      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0),
          new TokenAmount(token1, reserve1),
        ),
      ]
    })
  }, [loading, reserves, tokens, validatedPairAddress])
}

export function usePair(
  tokenA?: Currency,
  tokenB?: Currency,
): [PairState, Pair | null] {
  const pairs = usePairs([[tokenA, tokenB]])?.[0]
  return pairs ?? [PairState.LOADING, null]
}
