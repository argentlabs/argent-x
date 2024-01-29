import { isFunction } from "lodash-es"
import { FC, useEffect, useMemo } from "react"

import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useAggregatedTxFeesData } from "../transaction/useTransactionSimulatedData"
import { ParsedFeeError, getParsedFeeError } from "./feeError"
import { FeeEstimation } from "./FeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxFeeEstimation } from "./utils"
import { useTokenBalance } from "../../accountTokens/tokens.state"

export const FeeEstimationContainer: FC<TransactionsFeeEstimationProps> = ({
  feeTokenAddress,
  accountAddress,
  networkId,
  onErrorChange,
  onFeeErrorChange,
  transactions,
  actionHash,
  userClickedAddFunds,
  transactionSimulation,
  transactionSimulationFeeError,
  transactionSimulationLoading,
  needsDeploy = false,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const feeToken = useTokenBalance(feeTokenAddress, account)
  const { fee: feeSequencer, error } = useMaxFeeEstimation(
    actionHash,
    account,
    transactions,
    transactionSimulation,
    transactionSimulationLoading,
  )

  const { totalMaxFee, totalFee, fee } = useAggregatedTxFeesData(
    transactionSimulation,
    feeSequencer,
  )

  const enoughBalance = useMemo(
    () =>
      Boolean(
        totalMaxFee &&
          feeToken?.balance &&
          feeToken?.balance >= BigInt(totalMaxFee),
      ),
    [feeToken?.balance, totalMaxFee],
  )

  const showFeeError = Boolean(
    totalMaxFee && feeToken?.balance && !enoughBalance,
  )
  const showEstimateError =
    Boolean(error) || Boolean(transactionSimulationFeeError)
  const showError = showFeeError || showEstimateError

  const hasError = !totalMaxFee || !enoughBalance || showError
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

  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    totalFee,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    totalMaxFee,
  )

  return (
    <>
      {feeToken && (
        <FeeEstimation
          amountCurrencyValue={amountCurrencyValue}
          fee={fee}
          feeToken={feeToken}
          parsedFeeEstimationError={parsedFeeEstimationError}
          showError={showError}
          showEstimateError={showEstimateError}
          showFeeError={showFeeError}
          suggestedMaxFeeCurrencyValue={suggestedMaxFeeCurrencyValue}
          userClickedAddFunds={userClickedAddFunds}
          needsDeploy={needsDeploy}
        />
      )}
    </>
  )
}
