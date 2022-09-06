import { BigNumberish } from "ethers"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../shared/token/price"
import { useAppState } from "../../app.state"
import { isEqualAddress } from "../../services/addresses"
import { useTokenAmountToCurrencyValue } from "./tokenPriceHooks"
import { useTokensInNetwork } from "./tokens.state"

export interface IUseDisplayTokenAmountAndCurrencyValue {
  amount: BigNumberish
  tokenAddress?: string
}

export const useDisplayTokenAmountAndCurrencyValue = ({
  amount,
  tokenAddress,
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
  const displayValue = prettifyCurrencyValue(amountCurrencyValue)
  return {
    displayAmount,
    displayValue,
  }
}
