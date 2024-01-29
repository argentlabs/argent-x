import { Token } from "../../../../shared/token/__new/types/token.model"
import { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useTokenOnCurrentNetworkByAddress } from "../../accountTokens/tokens.state"
import { useTokenBalanceForAccount } from "../../accountTokens/useTokenBalanceForAccount"
import { Field, useSwapState } from "../state/fields"
import { bigDecimal } from "@argent/shared"
import { useSwapQuoteForPay } from "./useSwapQuoteForPay"
import { useTradeFromSwapQuote } from "./useTradeFromSwapQuote"
import { Trade } from "../../../../shared/swap/model/trade.model"
import { useUserState } from "../state/user"
import { computeSlippageAdjustedAmounts } from "../utils/prices"
import { isUndefined } from "lodash-es"

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

  const isExactIn: boolean = independentField === Field.PAY // This will always be true until we add ability to create a trade from Receive field
  const tokenDecimals = isExactIn ? payToken?.decimals : receiveToken?.decimals

  const parsedAmount = tokenDecimals
    ? bigDecimal.parseUnits(typedValue, tokenDecimals).value
    : undefined

  const { paySwapQuote, paySwapQuoteLoading, paySwapQuoteError } =
    useSwapQuoteForPay({
      payToken,
      receiveToken,
      payAmount: parsedAmount,
      account: selectedAccount,
    })

  const tradeFromPay = useTradeFromSwapQuote(paySwapQuote)

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

  if (!parsedAmount) {
    inputError = inputError ?? SwapInputError.NO_AMOUNT
  }

  if (!tokens[Field.PAY] || !tokens[Field.RECEIVE]) {
    inputError = inputError ?? SwapInputError.NO_TOKEN
  }

  const trade = isExactIn ? tradeFromPay : null // null until we add ability to create a trade from Receive field

  const slippageAdjustedAmounts =
    trade &&
    userSlippageTolerance &&
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
    trade: tradeFromPay,
    inputError,
    tradeLoading: paySwapQuoteLoading,
  }
}
