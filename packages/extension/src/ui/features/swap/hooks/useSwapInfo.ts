import { bigDecimal } from "@argent/x-shared"
import { isUndefined } from "lodash-es"
import { useMemo } from "react"
import type { Trade } from "../../../../shared/swap/model/trade.model"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import type { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useCurrencyValueToTokenAmount } from "../../accountTokens/tokenPriceHooks"
import { useTokenOnCurrentNetworkByAddress } from "../../accountTokens/tokens.state"
import { useTokenBalanceForAccount } from "../../accountTokens/useTokenBalanceForAccount"
import { Field, useSwapState } from "../state/fields"
import { useUserState } from "../state/user"
import { computeSlippageAdjustedAmounts } from "../utils/prices"
import { useSwapQuoteForPay } from "./useSwapQuoteForPay"
import { useTradeFromSwapQuote } from "./useTradeFromSwapQuote"

export enum SwapInputError {
  NO_ACCOUNT = "No account selected",
  NO_AMOUNT = "Enter amount",
  NO_TOKEN = "Select a Token",
  INSUFFICIENT_BALANCE = "Insufficient balance",
  NO_QUOTE = "Quote could not be retrieved",
}
export interface SwapInfo {
  tokens: { [field in Field]?: Token }
  tokenBalances: { [field in Field]?: TokenWithOptionalBigIntBalance }
  parsedAmount: bigint | undefined
  trade: Trade | undefined
  inputError: SwapInputError | undefined
  tradeLoading: boolean
}

export function useSwapInfo(): SwapInfo {
  const selectedAccount = useView(selectedAccountView)

  const {
    independentField,
    typedValue,
    [Field.PAY]: { tokenAddress: payTokenAddress },
    [Field.RECEIVE]: { tokenAddress: receiveTokenAddress },
    isFiatInput,
  } = useSwapState()

  const { userSlippageTolerance } = useUserState()

  const payToken = useTokenOnCurrentNetworkByAddress(payTokenAddress)
  const receiveToken = useTokenOnCurrentNetworkByAddress(receiveTokenAddress)

  const payTokenBalance = useTokenBalanceForAccount({
    token: payToken,
    account: selectedAccount,
  })

  const receiveTokenBalance = useTokenBalanceForAccount({
    token: receiveToken,
    account: selectedAccount,
  })

  /** Determines if the swap is exact input (PAY) or exact output (RECEIVE) */
  const isExactIn = independentField === Field.PAY

  /** Get the relevant token for decimal calculation */
  const activeToken = isExactIn ? payToken : receiveToken

  /** Convert fiat value to token amount if needed */
  const tokenAmount = useCurrencyValueToTokenAmount(typedValue, activeToken)

  const parsedAmount = useMemo(() => {
    if (!activeToken?.decimals) {
      return undefined
    }

    const amount = isFiatInput ? (tokenAmount ?? "") : typedValue
    try {
      return bigDecimal.parseUnits(amount, activeToken.decimals).value
    } catch {
      return undefined
    }
  }, [activeToken?.decimals, isFiatInput, tokenAmount, typedValue])

  const { paySwapQuote, paySwapQuoteLoading, paySwapQuoteError } =
    useSwapQuoteForPay({
      payToken,
      receiveToken,
      sellAmount: isExactIn ? parsedAmount : undefined,
      buyAmount: isExactIn ? undefined : parsedAmount,
      account: selectedAccount,
    })

  const trade = useTradeFromSwapQuote(paySwapQuote)

  const tokenBalances = {
    [Field.PAY]: payTokenBalance,
    [Field.RECEIVE]: receiveTokenBalance,
  }

  const tokens = {
    [Field.PAY]: payToken,
    [Field.RECEIVE]: receiveToken,
  }

  let inputError: SwapInputError | undefined
  if (!selectedAccount) {
    inputError = SwapInputError.NO_ACCOUNT
  }

  if (parsedAmount === undefined) {
    inputError = inputError ?? SwapInputError.NO_AMOUNT
  }

  if (!tokens[Field.PAY] || !tokens[Field.RECEIVE]) {
    inputError = inputError ?? SwapInputError.NO_TOKEN
  }

  const slippageAdjustedAmounts =
    trade &&
    userSlippageTolerance !== undefined &&
    computeSlippageAdjustedAmounts(trade, userSlippageTolerance)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    tokenBalances[Field.PAY]?.balance,
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.PAY] : null,
  ]

  const isInvalidAmount =
    amountIn && !isUndefined(balanceIn) && balanceIn < amountIn.value

  if (isInvalidAmount) {
    inputError = inputError ?? SwapInputError.INSUFFICIENT_BALANCE
  }

  if (paySwapQuoteError) {
    inputError = inputError ?? SwapInputError.NO_QUOTE
  }

  return {
    tokens,
    tokenBalances,
    parsedAmount,
    trade: trade,
    inputError,
    tradeLoading: paySwapQuoteLoading,
  }
}
