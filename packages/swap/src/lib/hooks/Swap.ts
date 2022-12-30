import { useCallback } from "react"

import { WrappedTokenInfo } from "./../../tokenlist/types"
import { Currency, CurrencyAmount, ETHER, Token, Trade } from "../../sdk"
import { useSwapProvider } from "./../providers/swap"
import { Field, useSwapState } from "../state/swap"
import useUserState from "../state/user"
import { tryParseAmount } from "../utils/parseAmount"
import { computeSlippageAdjustedAmounts } from "../utils/prices"
import { useCurrency } from "./Tokens"
import { useTradeExactIn, useTradeExactOut } from "./Trade"
import { useCurrencyBalances } from "./Wallet"

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency | WrappedTokenInfo }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  trade: Trade | undefined
  inputError?: string
  tradeLoading: boolean
} {
  const { selectedAccount: account } = useSwapProvider()

  const connectedAddress = account?.address

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const relevantTokenBalances = useCurrencyBalances(
    connectedAddress ?? undefined,
    [inputCurrency ?? undefined, outputCurrency ?? undefined],
  )

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(
    typedValue,
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined,
  )

  const [bestTradeExactIn, bestTradeInLoading] = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
  )

  const [bestTradeExactOut, bestTradeOutLoading] = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
  )

  const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  // get link to trade on v1, if a better rate exists
  // const v1Trade = useV1Trade(isExactIn, currencies[Field.INPUT], currencies[Field.OUTPUT], parsedAmount)

  let inputError: string | undefined
  if (!account) {
    inputError = "Connect Wallet"
  }

  if (!parsedAmount) {
    inputError = inputError ?? "Enter an amount"
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? "Select a Token"
  }

  const { userSlippageTolerance } = useUserState()

  const slippageAdjustedAmounts =
    trade &&
    userSlippageTolerance &&
    computeSlippageAdjustedAmounts(trade, userSlippageTolerance)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = "Insufficient " + amountIn.currency.symbol + " balance"
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    trade: trade ?? undefined,
    inputError,
    /* TODO: ask always */
    tradeLoading: isExactIn ? bestTradeInLoading : bestTradeOutLoading,
  }
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
} {
  const { selectCurrency, switchCurrencies, typeInput } = useSwapState()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      selectCurrency({
        field,
        currencyId:
          currency instanceof Token
            ? currency.address
            : currency === ETHER
            ? "ETH"
            : "",
      })
    },
    [selectCurrency],
  )

  const onSwitchTokens = useCallback(() => {
    switchCurrencies()
  }, [switchCurrencies])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      typeInput({ field, typedValue })
    },
    [typeInput],
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
  }
}
