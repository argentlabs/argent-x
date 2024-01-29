import { BigNumberish } from "starknet"
import {
  PRETTY_UNLIMITED,
  isUnlimitedAmount,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../shared/token/price"
import { useAppState } from "../../app.state"
import { useTokenAmountToCurrencyValue } from "./tokenPriceHooks"
import { useTokensInNetwork } from "./tokens.state"
import { isEqualAddress } from "@argent/shared"

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
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
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
