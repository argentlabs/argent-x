import { FC, useEffect, useMemo } from "react"

import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { FeeEstimation } from "./FeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxFeeEstimation } from "./utils"
import { getParsedError } from "./utils"

export const FeeEstimationContainer: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  networkId,
  onErrorChange,
  transactions,
  actionHash,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const { feeTokenBalance } = useFeeTokenBalance(account)
  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  const enoughBalance = useMemo(
    () =>
      Boolean(
        fee?.suggestedMaxFee && feeTokenBalance?.gte(fee.suggestedMaxFee),
      ),
    [feeTokenBalance, fee?.suggestedMaxFee],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  const parsedFeeEstimationError = showEstimateError && getParsedError(error)
  const feeToken = useNetworkFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.suggestedMaxFee,
  )

  return (
    <FeeEstimation
      amountCurrencyValue={amountCurrencyValue}
      fee={fee}
      feeToken={feeToken}
      feeTokenBalance={feeTokenBalance}
      parsedFeeEstimationError={parsedFeeEstimationError}
      showError={showError}
      showEstimateError={showEstimateError}
      showFeeError={showFeeError}
      suggestedMaxFeeCurrencyValue={suggestedMaxFeeCurrencyValue}
    />
  )
}
