import { flatMap } from "lodash"
import { useMemo } from "react"

import { Currency, CurrencyAmount, Pair, Token, Trade } from "../../sdk"
import { useSwapProvider } from "./../providers/swap"
import { BASES_TO_CHECK_TRADES_AGAINST } from "../constants"
// import { BASES_TO_CHECK_TRADES_AGAINST } from "../constants"
import { wrappedCurrency } from "../utils/wrappedCurrency"
import { PairState, usePairs } from "./Reserves"

function useAllCommonPairs(
  currencyA?: Currency,
  currencyB?: Currency,
): [Pair[], boolean] {
  const { networkId } = useSwapProvider()

  const bases: Token[] = useMemo(
    () =>
      networkId ? Object.values(BASES_TO_CHECK_TRADES_AGAINST[networkId]) : [],
    [networkId],
  )

  const [tokenA, tokenB] = networkId
    ? [
        wrappedCurrency(currencyA, networkId),
        wrappedCurrency(currencyB, networkId),
      ]
    : [undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] =>
        bases.map((otherBase) => [base, otherBase]),
      ).filter(([t0, t1]) => t0.address !== t1.address),
    [bases],
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] =>
              Boolean(tokens[0] && tokens[1]),
            )
            .filter(([t0, t1]) => t0.address !== t1.address)
        : [],
    [tokenA, tokenB, bases, basePairs],
  )

  const allPairs = usePairs(allPairCombinations)
  const anyPairLoading = allPairs.some(
    ([pairState]) => pairState === PairState.LOADING,
  )

  // only pass along valid pairs, non-duplicated pairs
  return [
    useMemo(
      () =>
        Object.values(
          allPairs
            // filter out invalid pairs
            .filter((result): result is [PairState.EXISTS, Pair] =>
              Boolean(result[0] === PairState.EXISTS && result[1]),
            )
            // filter out duplicated pairs
            .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
              memo[curr.liquidityToken.address] =
                memo[curr.liquidityToken.address] ?? curr
              return memo
            }, {}),
        ),
      [allPairs],
    ),
    anyPairLoading,
  ]
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
): [Trade | null, boolean] {
  const [allowedPairs, pairLoading] = useAllCommonPairs(
    currencyAmountIn?.currency,
    currencyOut,
  )

  return [
    useMemo(() => {
      if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
        const trade =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: 3,
            maxNumResults: 1,
          })[0] ?? null

        return trade
      }
      return null
    }, [allowedPairs, currencyAmountIn, currencyOut]),
    pairLoading,
  ]
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
): [Trade | null, boolean] {
  const [allowedPairs, pairLoading] = useAllCommonPairs(
    currencyIn,
    currencyAmountOut?.currency,
  )

  return [
    useMemo(() => {
      if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
        return (
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
            maxHops: 3,
            maxNumResults: 1,
          })[0] ?? null
        )
      }
      return null
    }, [allowedPairs, currencyIn, currencyAmountOut]),
    pairLoading,
  ]
}
