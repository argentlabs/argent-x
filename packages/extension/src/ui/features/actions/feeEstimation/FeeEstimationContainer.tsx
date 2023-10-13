import { isFunction } from "lodash-es"
import { FC, useEffect, useMemo } from "react"

import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { useFeeTokenBalance } from "../../accountTokens/useFeeTokenBalance"
import { useAggregatedTxFeesData } from "../transaction/useTransactionSimulatedData"
import { ParsedFeeError, getParsedFeeError } from "./feeError"
import { FeeEstimation } from "./FeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxFeeEstimation } from "./utils"

export const FeeEstimationContainer: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  networkId,
  onErrorChange,
  onFeeErrorChange,
  transactions,
  actionHash,
  userClickedAddFunds,
  transactionSimulation,
  transactionSimulationFee,
  transactionSimulationFeeError,
  transactionSimulationLoading,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const { feeTokenBalance } = useFeeTokenBalance(account)
  const { fee: feeSequencer, error } = useMaxFeeEstimation(
    transactions,
    actionHash,
    transactionSimulation,
    transactionSimulationLoading,
  )

  const { fee } = useAggregatedTxFeesData(
    transactionSimulation,
    transactionSimulationFee,
    feeSequencer,
  )

  const enoughBalance = useMemo(
    () =>
      Boolean(
        fee?.suggestedMaxFee &&
          feeTokenBalance &&
          feeTokenBalance >= BigInt(fee.suggestedMaxFee),
      ),
    [feeTokenBalance, fee?.suggestedMaxFee],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError =
    Boolean(error) || Boolean(transactionSimulationFeeError)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  useEffect(() => {
    if (!isFunction(onFeeErrorChange)) {
      return
    }
    onFeeErrorChange(showFeeError)
  }, [showFeeError, onFeeErrorChange])

  let parsedFeeEstimationError: ParsedFeeError | undefined
  if (showEstimateError) {
    if (transactionSimulationFeeError) {
      parsedFeeEstimationError = getParsedFeeError(
        transactionSimulationFeeError,
      )
    } else if (error) {
      parsedFeeEstimationError = getParsedFeeError(error)
    }
  }
  const feeToken = useNetworkFeeToken(networkId)

  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    fee?.amount,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    fee?.suggestedMaxFee,
  )

  return (
    <>
      {feeToken && (
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
          userClickedAddFunds={userClickedAddFunds}
        />
      )}
    </>
  )
}
