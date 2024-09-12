import { BigNumberish } from "starknet"
import { useTokenAmountToCurrencyValue } from "./tokenPriceHooks"
import {
  isEqualAddress,
  prettifyCurrencyValue,
  PRETTY_UNLIMITED,
  prettifyTokenAmount,
  isUnlimitedAmount,
} from "@argent/x-shared"
import { useTokensInCurrentNetworkIncludingSpam } from "./tokens.state"

export interface IUseDisplayTokenAmountAndCurrencyValue {
  amount: BigNumberish
  tokenAddress?: string
  currencySymbol?: string
}

export const useDisplayTokenAmountAndCurrencyValue = ({
  amount,
  tokenAddress,
  currencySymbol = "$",
}: IUseDisplayTokenAmountAndCurrencyValue) => {
  const tokensByNetwork = useTokensInCurrentNetworkIncludingSpam()
  const token = tokenAddress
    ? tokensByNetwork.find(({ address }) =>
        isEqualAddress(address, tokenAddress),
      )
    : undefined
  const amountCurrencyValue = useTokenAmountToCurrencyValue(token, amount)
  if (!token) {
    return {
      displayAmount: null,
      displayValue: null,
    }
  }
  const displayAmount = prettifyTokenAmount({
    amount,
    decimals: token?.decimals,
    symbol: token?.symbol || "Unknown token",
  })
  let displayValue = null
  if (amountCurrencyValue && isUnlimitedAmount(amount)) {
    displayValue = [currencySymbol, PRETTY_UNLIMITED].filter(Boolean).join("")
  } else {
    displayValue = prettifyCurrencyValue(amountCurrencyValue, currencySymbol)
  }
  return {
    displayAmount,
    displayValue,
  }
}
