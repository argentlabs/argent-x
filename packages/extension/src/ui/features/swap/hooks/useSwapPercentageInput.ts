import { prettifyTokenNumber, bigDecimal } from "@argent/x-shared"
import { useState, useEffect, useCallback } from "react"
import type { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import {
  prettifyTokenAmountValueForSwap,
  useTokenAmountToCurrencyFormatted,
} from "../../accountTokens/tokenPriceHooks"
import { Field } from "../state/fields"
import { maxAmountSpendFromTokenBalance } from "../utils"
import { useSwapActionHandlers } from "./useSwapActionHandler"

export function useSwapPercentageInput(
  payTokenBalance?: TokenWithOptionalBigIntBalance,
  isFiatInput?: boolean,
) {
  const { onUserInput } = useSwapActionHandlers()

  const maxAmountInput = maxAmountSpendFromTokenBalance(payTokenBalance)

  const [percentageAmount, setPercentageAmount] = useState<bigint>()

  const currencyValueAmount = useTokenAmountToCurrencyFormatted(
    percentageAmount ?? 0n,
    payTokenBalance,
  )

  useEffect(() => {
    if (percentageAmount && payTokenBalance?.decimals) {
      let amount: string
      if (isFiatInput) {
        amount = currencyValueAmount ?? "0"
      } else {
        const stringAmount = bigDecimal.formatUnits({
          value: percentageAmount,
          decimals: payTokenBalance.decimals,
        })
        amount = prettifyTokenAmountValueForSwap(stringAmount) ?? "0"
      }
      onUserInput(Field.PAY, amount)
      setPercentageAmount(undefined)
    }
  }, [
    percentageAmount,
    onUserInput,
    payTokenBalance?.decimals,
    isFiatInput,
    currencyValueAmount,
  ])

  return useCallback(
    (percentage: number) => {
      if (maxAmountInput && payTokenBalance?.decimals) {
        const percentageAmount = (maxAmountInput * BigInt(percentage)) / 100n
        setPercentageAmount(percentageAmount)
      }
    },
    [maxAmountInput, payTokenBalance?.decimals],
  )
}
